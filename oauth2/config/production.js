'use strict';
module.exports = {
    remoteConfigPrefix: false,
    tokenExpireSeconds: 24 * 60 * 60 * 15,
    clients: [
    {
        name: "node",
        id: "client-id-for-node-dev",
        secret: "client-secret-for-node-dev",
    },
    {
        name: "mobile",
        id: "client-id-for-mobile-dev",
        secret: "client-secret-for-mobile-dev"
    },
    ],
};
