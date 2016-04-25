'use strict';
var passport = require('passport');
var _ = require('lodash');
var config = require('config');
var clients = config.clients;
var ef = require('./ef');
var errs = require('errs');
var log = require('bunyan-hub-logger')({app: 'oauth2', name: 'passport'});
var token = require('./token');
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var exports = module.exports = new (passport.Passport);
exports.use(new BearerStrategy(function (atoken, done) {
    log.debug({access_token: atoken}, 'bearer token: %s', atoken);
    return ef(done, token.geta, atoken, function (obj) {
        return done(null, obj.user || {}, {
            client: obj.client,
            scope: obj.scope,
            socialUser: obj.socialUser,
            oauthSignedIn: obj.oauthSignedIn
        });
    });
}));
var loadClientsFromRemote = require('./clients').loadClientsFromRemote;
var loadClients = (function () {
    function loadClients() {
        if (!config.remoteConfigPrefix) {
            return;
        }
        loadClientsFromRemote(config.remoteConfigPrefix, function (clientsFromRemote) {
            if (_.isEqual(clients, clientsFromRemote, '===')) {
                return;
            }
            log.debug({clientsFromRemote: clientsFromRemote}, 'record clientsFromRemote');
            if (clientsFromRemote != null && clientsFromRemote.length) {
                return clients = clientsFromRemote;
            }
        });
        return setTimeout(loadClients, 60000);
    }
    return loadClients;
}());
exports.use(new ClientPasswordStrategy(function (clientId, clientSecret, done) {
    var client;
    log.debug({clientParams: {id: clientId, secret: clientSecret}}, 'client get from request params');
    client = clients.filter(function (c) {
        return c.id === clientId && c.secret === clientSecret;
    })[0];
    log.debug({client: client}, 'valid client');
    if (client) {
        return done(null, client);
    } else {
        return done(errs.create({
            message: 'invalid client',
            code: 'unauthorized_client',
            status: 401
        }));
    }
}));
loadClients();
