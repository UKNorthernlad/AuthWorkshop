const { Issuer } = require('openid-client');

Issuer.discover('http://localhost:8080/auth/realms/myrealm/') // => Promise
  .then(function (keyCloakIssuer) {
    console.log('Discovered issuer %s', keyCloakIssuer.issuer);
    console.log('Metadata %O', keyCloakIssuer.metadata);
  });