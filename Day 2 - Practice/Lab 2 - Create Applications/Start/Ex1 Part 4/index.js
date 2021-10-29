// Express Setup
var express = require('express');
var app = express();

// Utilities
const util = require('util');

//  Extracts Application/x-www-form-urlencoded encoded data from the body of POST requests.
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended:true});

// OIDC Setup
// var {Issuer} = require('openid-client');
// var {generators} = require('openid-client');
// var nonce = generators.nonce();

// // Session cookie infrastructure
// var session = require('express-session');

// // MongoDB to store Session data
// const mongoURI = "mongodb://mongoadmin:mongoadminpassword@127.0.0.1:27017/sessions?authSource=admin";
// var mongoose = require('mongoose');
// var MongoDBSession = require('connect-mongodb-session')(session);

// // Connect
// mongoose.connect(mongoURI, {useNewUrlParser: true,useUnifiedTopology: true,})
// .then(res => { console.log("MongoDB Connected.");})
// .catch( err => {console.log(`MongoDB Connect Error ====> ${err}`);});

// // Define Collection name
// var store = new MongoDBSession({
//     uri : mongoURI,
//     collection : "mySessions",
// });

// // Middlewear to read session cookie on each request
// app.use(
//     session({
//         secret: "somekey",
//         resave: false,
//         saveUninitialized: false,
//         //store: store, // Save the session data in the mongoDB. Default it in memory on webserver
//     })
// );


// Start application listening.
app.listen(8081, () => console.log('Listening on Port 8081')); 


// var client;

// Issuer.discover('http://localhost:8080/auth/realms/myrealm/')// => Promise
// .then(function (keyCloakIssuer) {
//     console.log('Discovered issuer %s', keyCloakIssuer.issuer);
//     console.log('Metadata %O', keyCloakIssuer.metadata);

//     client = new keyCloakIssuer.Client({
//         client_id: 'myfirstapp',
//         redirect_uris: ['http://localhost:8081/callback'],
//         response_types: ['id_token'],
//         // id_token_signed_response_alg (default "RS256")
//       }); // => Client

//   });

// // Middlewear to log debugging information and protect the SecretPage.
//  const auth = (req, res, next) => {
//     console.log(req.url);
//     console.log(req.session);

//      if(req.session.isAuth) {
//         console.log(`Session cookie userName = ${req.session.userName}`); 
//      } else {
//          console.log("Not authenticated.");
//      };

//      if(req.url === '/secretpage'){
//          if(req.session.userName){
//             console.log(`Accessing the SecretPage as ${req.session.userName}`);
//          } else {
//             console.log('Tried to access the SecretPage but not authenticated.');
//             var err = new Error('You are not authenticated - a real application would now redirect you to /login.');
//             err.status = 401;
//             return next(err);
//          }      
//      }
//      next();
//  };

// // Use the "auth" middlewear, i.e. process each request through it.
// app.use(auth);


//
// Routing handlers for main pages
//

// Homepage
app.get ('/',  (request, response) => {

    var username;
    if(request.session !== undefined) { username = request.session.userName ?? 'Unauthenticated';}
    response.send(`<h1>Application Homepage</h1> <h2>${username}</h2><p><a href="/logout">Logout</a></p> <p><a href="/login">Login</a></p> <p><a href="/secretpage">Go to the SecretPage</a></p>   <p><a href="http://localhost:8080/auth/realms/myrealm/account/">Go to Identity Provider</a></p>`);
})

// // Login page - Redirects the browser to the URL constructed by the client.authorizationUrl call.
// app.get ('/login', (request, response) => {
    
//     var authURL = client.authorizationUrl({
//         scope: 'openid email profile',
//         response_mode: 'form_post',
//         //response_mode: 'fragment',
//         nonce,
//       });
//       console.log(`Redirecting to IdP at: ${authURL}`);
//       console.log();
//       response.redirect(authURL);
// })


// The SecretPage. You can only see this if you are authenticated. Access controlled via middlewear.
app.get ('/secretpage',  (request, response) => {
    response.type('html');
    response.send('<h1>The Secret Page</h1><a href="/">Back to Homepage</a>');
})

// // Callback handler. This page receives the token from KeyCloak IdP via the POST body, confirms it's legit, extracts the claims and sets values in the session cookie.
// app.post ('/callback', urlEncodedParser, (request, response) => {
//     const params = client.callbackParams(request);

//     var claims =  client.callback('/', params, { nonce }).then(function(tokenSet){

//         console.log('Received and validated tokens %j', tokenSet);
//         const tokenClaims = tokenSet.claims()
//         var claimsMessage = util.format('%j', tokenClaims);
//         console.log(claimsMessage);

//         // Set session variable to indicate user is now authenticated.
//         request.session.isAuth = true;

//         // Set userName session variable. Will be read back on subsequent pages.
//         request.session.userName = tokenClaims.email;

//         // Extract and set session variables for any other claims from the token as you'll not see it again.
//         // Typically you'd extract the unique identifier for the user (e.g. a UUID/GUID) or other unique name.
//         // This might be used for keying user content in a locally attached database.

//         return claimsMessage;
//     });

//     // Display the claims & token information in the browser for debugging purposes.
//     // In a real application, you would automatically redirect back to the homepage or secured resource.
//     claims.then(function(c) {
//         response.type('html');
//         response.send('<html><h1>Token</h1><p>' + request.body.id_token + '</p><h1>Claims</h1><pre>' + c + '</pre><a href="/">Return to Homepage</a>');
//       }).catch(err => {
//           console.log(err);
//       });
// });



 



