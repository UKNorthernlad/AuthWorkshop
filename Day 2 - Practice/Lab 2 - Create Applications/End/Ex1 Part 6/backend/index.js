// Express Setup
var express = require('express');
var app = express();

// Utilities
const util = require('util');
const morgan = require("morgan")

//  Extracts Application/x-www-form-urlencoded encoded data from the body of POST requests.
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended:true});

// OIDC Setup
var {Issuer} = require('openid-client');
var {generators} = require('openid-client');
//var nonce = generators.nonce();

var bearerToken = require('bearer-token');
var http = require('http');


// Session cookie infrastructure
var session = require('express-session');
const { send } = require('process');

// Start application listening.
app.listen(8082, () => console.log('Listening on Port 8082')); 

var client;

Issuer.discover('http://localhost:8080/auth/realms/myrealm/')// => Promise
.then(function (keyCloakIssuer) {
    //console.log('Discovered issuer %s', keyCloakIssuer.issuer);
    //console.log('Metadata %O', keyCloakIssuer.metadata);

    client = new keyCloakIssuer.Client({
        client_id: 'myfirstapp',
        client_secret: 'ad671d3a-4e56-44d5-b750-74bd8949936e',
        redirect_uris: ['http://localhost:8081/callback'],
        response_types: ['code'],
        // id_token_signed_response_alg (default "RS256")
      }); // => Client

  });

// Middlewear to extract the Access Token if there is on.
 const auth = (request, response, next) => {

    bearerToken(request, (err, access_token) => {
        console.log(`Access_Token = ${access_token}`);
        console.log("Error = " + JSON.stringify(err));
        
        // Validate the token
        // Assume Access Token is bad until we complete the code to validate it.
        request.isTokenValid = false;

        //Validate the token. This doesn't work yet - there's a prize if you can fix it.
        if(access_token){ // There is *some* Bearer value in the Authorization header.
            console.log(access_token);   

            //Perform work to validate the token for real.
            let result = client.introspect(access_token, 'requesting_party_token');
            //let result = client.introspect(access_token, 'access_token'); // Seems to return validated ID Token.
            
            result.then((result,err) => {
             if (err) return console.error(`Introspect error = ${err}`);

             if(result.active === true){ // Valid token
                console.log('Valid Token.');
                    console.log(JSON.stringify(result));
                    
                    // BUG HERE - WHY WON'T THIS UPDATE? Think it's got something to do with updating on a .then handler.
                    return request.isTokenValid = true;

                    // // TODO PROPERLY- Check the claims contain the right scope to call this API
                    // if(true) {  // simulate claim missing
                    //     //response.status(403).send('Not authorised - Required Scope is missing');
                    // }
                } else {
                    console.log("Token not active - probably means it's not valid or has expired.");           
                }
            }).catch( err => {
                console.log(`Token Intospection Error - ${err}`);
                throw err;
            });
        } else {
            request.isTokenValid = false;
        }

        next();
    });
     
 };

//app.use(morgan("common"));
// Use the "auth" middlewear, i.e. process each request through it.
//app.use(auth);




//
// Routing handlers for main pages
//

// Homepage
app.get ('/api/tasks', auth, (request, response) => {

    //request.isTokenValid = true;

    if(request.isTokenValid){
        console.log("VALID VALID VALID");
        var data = ['Task1','Task2','Task3'];
        response.type('application/json');
        response.status(200);
        response.send(data);
    } else {
        console.log("BAD BAD BAD");
        var data = ['Bad Token'];
        response.type('application/json');
        response.status(403);
        response.send(data);
    }
});
