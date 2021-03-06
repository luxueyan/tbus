// Generated by LiveScript 1.3.1
var supertest, assert;
supertest = require('supertest');
assert = require('assert');
describe('auth module', function(){
  var server, config, ctest, atoken;
  server = config = ctest = null;
  atoken = '';
  before(function(){
    server = require('../../example/server');
    config = require('config');
    return ctest = config.clients[1];
  });
  it('auth.pass() will always pass', function(done){
    return supertest(server).get('/test/pass').set('accept', 'application/json').expect(200, function(err, r){
      if (err) {
        console.error(err.stack);
      }
      assert(!err);
      assert(r.body.authPass);
      return done();
    });
  });
  it('can get access token for test', function(done){
    return supertest(server).post('/api/v2/token').type('form').send({
      grant_type: 'client_credentials',
      client_id: ctest.id,
      client_secret: ctest.secret,
      scope: 'a b'
    }).expect(200, function(err, r){
      if (err) {
        console.error(err.stack);
      }
      assert(!err);
      assert.equal(ctest.id, r.body.client.id);
      assert.equal('Bearer', r.body.token_type);
      assert.deepEqual(['a', 'b'], r.body.scope);
      atoken = r.body.access_token;
      return done();
    });
  });
  it('can access api with access_token', function(done){
    return supertest(server).get('/test').set('accept', 'application/json').set('Authorization', 'Bearer ' + atoken).expect(200, function(err, r){
      if (err) {
        console.error(err.stack);
      }
      assert(!err);
      assert.equal(ctest.name, r.body.authInfo.client.name);
      assert.deepEqual(['a', 'b'], r.body.authInfo.scope);
      return done();
    });
  });
  it('auth.scope() will pass when user have some scope', function(done){
    return supertest(server).get('/test/scope_b_c').set('accept', 'application/json').set('Authorization', 'Bearer ' + atoken).expect(200, function(err, r){
      if (err) {
        console.error(err.stack);
      }
      assert(!err);
      assert(r.body.authPass);
      return done();
    });
  });
  it('auth.scope() will be rejected when no scope match', function(done){
    return supertest(server).get('/test/scope_c_d').set('accept', 'application/json').set('Authorization', 'Bearer ' + atoken).expect(403, function(err, r){
      if (err) {
        console.error(err.stack);
      }
      assert(!err);
      assert(!r.body.authPass);
      return done();
    });
  });
  it('auth.user() will reject request without req.user', function(done){
    return supertest(server).get('/test/user').set('accept', 'application/json').set('Authorization', 'Bearer ' + atoken).expect(403, function(err, r){
      if (err) {
        console.error(err.stack);
      }
      assert(!err);
      assert.equal('You must sign in to get this resource.', r.body.error_description);
      assert(!r.body.authPass);
      return done();
    });
  });
  it('auth.client() will reject request without req.authInfo.client', function(done){
    return supertest(server).get('/test/client').set('accept', 'application/json').expect(403, function(err, r){
      if (err) {
        console.error(err.stack);
      }
      assert(!err);
      assert(!r.body.authPass);
      return done();
    });
  });
  it('auth.user() will reject request without access_token', function(done){
    return supertest(server).get('/test/user').set('accept', 'application/json').expect(403, function(err, r){
      if (err) {
        console.error(err.stack);
      }
      assert(!err);
      assert(!r.body.authPass);
      return done();
    });
  });
  it('can get access token for test by password', function(done){
    return supertest(server).post('/api/v2/token').type('form').send({
      grant_type: 'password',
      client_id: ctest.id,
      client_secret: ctest.secret,
      username: 'hello',
      password: 'world',
      scope: 'a b'
    }).expect(200, function(err, r){
      if (err) {
        console.error(err.stack);
      }
      assert(!err);
      atoken = r.body.access_token;
      assert.equal(ctest.id, r.body.client.id);
      assert.equal('Bearer', r.body.token_type);
      assert.deepEqual(['a', 'b'], r.body.scope);
      return done();
    });
  });
  it('can access auth.client() api with access_token', function(done){
    return supertest(server).get('/test/client').set('accept', 'application/json').set('Authorization', 'Bearer ' + atoken).expect(200, function(err, r){
      if (err) {
        console.error(err.stack);
      }
      assert(!err);
      assert.equal(ctest.name, r.body.authInfo.client.name);
      assert.deepEqual(['a', 'b'], r.body.authInfo.scope);
      return done();
    });
  });
  return it('can access auth.user() api with req.user given', function(done){
    return supertest(server).get('/test/user').set('accept', 'application/json').set('Authorization', 'Bearer ' + atoken).expect(200, function(err, r){
      if (err) {
        console.error(err.stack);
      }
      assert(!err);
      assert.equal(ctest.name, r.body.authInfo.client.name);
      assert.deepEqual(['a', 'b'], r.body.authInfo.scope);
      return done();
    });
  });
});
