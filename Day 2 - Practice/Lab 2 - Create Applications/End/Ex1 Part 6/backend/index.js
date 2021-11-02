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
        // Hard coded for now:
        const dummyToken = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJuTldFWDVpQ1E2emFyNU5WUm9lMTl4RDFjRGxvY1Z0dWxyeXF6WUY0dDZjIn0.eyJleHAiOjE2MzU4OTM1ODMsImlhdCI6MTYzNTg5MzI4MywiYXV0aF90aW1lIjoxNjM1ODc0NzQwLCJqdGkiOiI2YjY4MTk5Ny03NjkwLTQ1ZWItYTE2Yy0yZDBmNTUzMDlhZjYiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9yZWFsbXMvbXlyZWFsbSIsImF1ZCI6WyJiYWNrZW5kQVBJIiwiYWNjb3VudCJdLCJzdWIiOiI4NmJmZTk3OC1hMzljLTRkM2QtOThiOS01MDdiODk2MzlkN2EiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJteWZpcnN0YXBwIiwic2Vzc2lvbl9zdGF0ZSI6IjE1OTFiZTcxLTBiN2EtNDM2Yy1iODM0LTlhZWUxZWIyNmVlYyIsImFjciI6IjAiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2xvY2FsaG9zdDo4MDgxIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW15cmVhbG0iLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYmFja2VuZEFQSSI6eyJyb2xlcyI6WyJCb3R0bGVXYXNoZXIiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIERvV2FzaGluZyBwcm9maWxlIGVtYWlsIiwic2lkIjoiMTU5MWJlNzEtMGI3YS00MzZjLWI4MzQtOWFlZTFlYjI2ZWVjIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiTXkgVXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6Im15dXNlciIsImdpdmVuX25hbWUiOiJNeSIsImZhbWlseV9uYW1lIjoiVXNlciIsImVtYWlsIjoibXl1c2VyQG15dXNlci5jb20ifQ.KR_hV-5jqoLrpGqzyX0x8Jq6UQ3ntxOL_joWOL4A_jw9tgoA9-J-QKiadxQCkOnaGoYs1SWU0bxoiqC5o0Yw5BogjrMIyKoz2YZKppf2XYVVFVAF5wVaPMNhkkEBztq_fMXSB3uB6vxgVUg01XB4tJvMuHsUVNeD5wwbcVHFRjAFl-5UvJP6QGAWCdaNxN8oYEUA8Js0_IJ_cgXtPTvtcOurWn2bXN4hZAtkWXOX2Zqj-d5anuymp_hV-shubXblPjZEnnt3CAZ2kvUwPJ4dfWkEx9wGI0IrCpAsryzU1qWzdOkO2xx-y7D22_4cjOBD-2uu-9ftpVzooF8P9p4sPw";


        // Assume Access Token is bad until we complete the code to validate it.
        response.isTokenValid = false;

        if(access_token){ // There is a token present in the request
                   
            //Perform work to validate the token for real.
            client.introspect(access_token, 'access_token').then((result,err) => {
             if(result.active === false){ // Invalid token
                    console.log("Token not active - probably means it's not valid or has expired.");    
                } else {
                    console.log('Valid Token.');
                    console.log(JSON.stringify(result));
                    response.isTokenValid = true;
                    // // TODO PROPERLY- Check the claims contain the right scope to call this API
                    // if(true) {  // simulate claim missing
                    //     //response.status(403).send('Not authorised - Required Scope is missing');
                    // } 
                }
            }).catch( err => {
                console.log(`Token Intospection Error - ${err}`);
                throw err;
            });
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
app.get ('/api/tasks', auth,  (request, response) => {
    if(response.isTokenValid){
        console.log("VALID VALID VALID");
        var data = ['Task1','Task2','Task3'];
        response.type('application/json');
        response.status(200);
        response.send(JSON.stringify(data));
    } else {
        response.status(403);
        response.send('Bad');
    }
});
