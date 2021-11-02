// Express Setup
var express = require('express');
var app = express();

var apiCall = require('./apicall');

// Utilities
const util = require('util');

//  Extracts Application/x-www-form-urlencoded encoded data from the body of POST requests.
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended:true});

// OIDC Setup
var {Issuer} = require('openid-client');
var {generators} = require('openid-client');
//var nonce = generators.nonce();

// Session cookie infrastructure
var session = require('express-session');
const { send } = require('process');

// MongoDB to store Session data
const mongoURI = "mongodb://mongoadmin:mongoadminpassword@127.0.0.1:27017/sessions?authSource=admin";
var mongoose = require('mongoose');
var MongoDBSession = require('connect-mongodb-session')(session);

// Connect
mongoose.connect(mongoURI, {useNewUrlParser: true,useUnifiedTopology: true,})
.then(res => { console.log("MongoDB Connected.");})
.catch( err => {console.log(`MongoDB Connect Error ====> ${err}`);});

// Define Collection name
var store = new MongoDBSession({
    uri : mongoURI,
    collection : "mySessions",
});

// Middlewear to read session cookie on each request
app.use(
    session({
        secret: "somekey",
        resave: false,
        saveUninitialized: false,
        //store: store, // Save the session data in the mongoDB. Default it in memory on webserver
    })
);

// Start application listening.
app.listen(8081, () => console.log('Listening on Port 8081')); 

var client;

Issuer.discover('http://localhost:8080/auth/realms/myrealm/')// => Promise
.then(function (keyCloakIssuer) {
    console.log('Discovered issuer %s', keyCloakIssuer.issuer);
    console.log('Metadata %O', keyCloakIssuer.metadata);

    client = new keyCloakIssuer.Client({
        client_id: 'myfirstapp',
        client_secret: 'ad671d3a-4e56-44d5-b750-74bd8949936e',
        redirect_uris: ['http://localhost:8081/callback'],
        response_types: ['code'],
        // id_token_signed_response_alg (default "RS256")
      }); // => Client

  });

// Middlewear to log debugging information and protect the SecretPage.
 const auth = (req, res, next) => {
    console.log(req.url);
    console.log(req.session);

     if(req.session.isAuth) {
        console.log(`Session cookie userName = ${req.session.userName}`); 
     } else {
         console.log("Not authenticated.");
     };

     if(req.url === '/secretpage'){
         if(req.session.userName){
            console.log(`Accessing the SecretPage as ${req.session.userName}`);
         } else {
            console.log('Tried to access the SecretPage but not authenticated.');
            var err = new Error('You are not authenticated - a real application would now redirect you to /login.');
            err.status = 401;
            return next(err);
         }      
     }
     next();
 };

// Use the "auth" middlewear, i.e. process each request through it.
app.use(auth);

//
// Routing handlers for main pages
//

// Homepage
app.get ('/',  (request, response) => {
    var username;
    if(request.session !== undefined) { username = request.session.userName ?? 'Unauthenticated';}
    response.send(`<h1>Application Homepage</h1> <h2>${username}</h2><p><a href="/logout">Logout</a></p> <p><a href="/login">Login</a></p> <p><a href="/secretpage">Go to the SecretPage</a></p>   <p><a href="http://localhost:8080/auth/realms/myrealm/account/">Go to Identity Provider</a></p>`);
})

// Login page - Redirects the browser to the URL constructed by the client.authorizationUrl call.
app.get ('/login', (request, response) => {

    var authURL = client.authorizationUrl({
        scope: 'openid email profile',
        resource: 'https://my.api.example.com/resource/32178',
        //code_challenge,
        //code_challenge_method: 'S256',
    });
    
      console.log(`Redirecting to IdP at: ${authURL}`);
      console.log();
      response.redirect(authURL);
})


// The SecretPage. You can only see this if you are authenticated. Access controlled via middlewear.
app.get ('/secretpage',  (request, response) => {

    apiCall.performRequest('localhost','8082','/api/tasks','GET',request.session.tokenSet.access_token,{},function(data){
        console.log('Got: ' + data);
        response.type('html');
        response.send('<h1>The Secret Page which calls the API</h1><h2>Returned data</h2><pre>' + data + '</pre>    <a href="/">Back to Homepage</a>');
    });
})

// Callback handler. This page receives the token from KeyCloak IdP via the POST body, confirms it's legit, extracts the claims and sets values in the session cookie.
app.get ('/callback', (request, response) => {

    const params = client.callbackParams(request);
    const claims = client.callback('http://localhost:8081/callback', params)
    .then(tokenSet => {

        console.log('Received and validated tokens %j', tokenSet);
        const tokenClaims = tokenSet.claims();

        // Set session variable to indicate user is now authenticated.
        request.session.isAuth = true;

        // Set userName session variable. Will be read back on subsequent pages.
        request.session.userName = tokenClaims.email;

        // Save the TokenSet in the sesson object
        request.session.tokenSet = tokenSet;

        // Extract and set session variables for any other claims from the token as you'll not see it again.
        // Typically you'd extract the unique identifier for the user (e.g. a UUID/GUID) or other unique name.
        // This might be used for keying user content in a locally attached database.

        var result = {
            "id_token" :      util.format('%j', tokenSet.id_token).replace(new RegExp('"', 'g'), ''),
            "id_claims" :     util.format('%j', tokenSet.claims()).replace(new RegExp('"', 'g'), ''),
            "access_token" :  util.format('%j', tokenSet.access_token).replace(new RegExp('"', 'g'), '')
        };

        return result;
    });

    // Display the claims & token information in the browser for debugging purposes.
    // In a real application, you would automatically redirect back to the homepage or secured resource.
    claims.then(function(result) {
        response.type('html');

        var code = '<h1>Code</h1><p>' + request.query.code + '</p>';
        var idtoken = '<h1>ID Token</h1><p>' + result.id_token + '</p><p><a target="id_token" href="http://jwt.ms/#id_token=' + result.id_token + '">Click here to decode token</a></p>';
        var accesstoken = '<h1>Access Token</h1><p>' + result.access_token + '</p> <p><a target="access_token" href="http://jwt.ms/#access_token=' + result.access_token + '">Click here to decode token</a></p>';

        response.send('<html>' + code + idtoken + accesstoken + '<h1><a href="/secretpage">Call the API from the SecretPage</a></h1>  <a href="/">Return to Homepage</a></html>');
      }).catch(err => {
          console.log(err);
      });
});



 



