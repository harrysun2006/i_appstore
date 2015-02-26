'use strict';

var AUTH_ENUM = { eToken: 1, eForm: 2};
var AUTH_TYPE = AUTH_ENUM.eToken;

var GLOBAL_SETTINGS = {
    portApi: 3000,
    portWeb: 81,
    secret: 'traderplus.applet',
    privKey: 'traderplus.applet', // fs.readFileSync(path.join(__dirname, 'priv.pem'));
    pubKey: 'traderplus.applet', // fs.readFileSync(path.join(__dirname, 'pub.pem'));
    tokenOption: {algorithm: 'HS256', expiresInMinutes: 30},
    isFormAuth: function() { 
      return AUTH_TYPE == AUTH_ENUM.eForm;
    },
    isTokenAuth: function() { 
      return AUTH_TYPE == AUTH_ENUM.eToken;
    },
    mongoUrl: 'mongodb://localhost/applet',
    redisHost: 'localhost',
    redisPort: 6379
};

exports.settings = GLOBAL_SETTINGS;
