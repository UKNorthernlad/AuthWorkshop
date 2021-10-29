// Express Setup
var express = require('express');
var app = express();

const util = require('util');

// Application/x-www-form-urlencoded body POST parser
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended:true});

// OIDC Setup
var {Issuer} = require('openid-client');
var {generators} = require('openid-client');
var nonce = generators.nonce();

// Session storage
var session = require('express-session');
// Middlewear to read session cookie on each request
app.use(
    session({
        secret: "somekey",
        resave: false,
        saveUninitialized: false,
    })
);

const mongoURI = "mongodb://mongoadmin:mongoadminpassword@127.0.0.1:27017/sessions?authSource=admin";
var MongoStore = require('connect-mongo');
var mongoose = require('mongoose');
var MongoDBSession = require('connect-mongodb-session')(session);

var connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    };
    

mongoose.connect(mongoURI, connectOptions).then (res => {
    console.log("MongoDB Connected");
}).catch( err => {
    console.log(`Error was ====> ${err}`);
});

var store = new MongoDBSession({
    uri : mongoURI,
    collection : "mySessions",
});





app.listen(8081, () => console.log('Listening on Port 8081')); 
var client;

var result = Issuer.discover('http://localhost:8080/auth/realms/myrealm/')// => Promise
.then(function (keyCloakIssuer) {
    //console.log('Discovered issuer %s', keyCloakIssuer.issuer);
    //console.log('Metadata %O', keyCloakIssuer.metadata);

    client = new keyCloakIssuer.Client({
        client_id: 'myfirstapp',
        redirect_uris: ['http://localhost:8081/callback'],
        response_types: ['id_token'],
        // id_token_signed_response_alg (default "RS256")
      }); // => Client

  });


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


           // res.redirect('/login');
         }
         
     }

     next();

 };


app.use(auth);

app.get ('/',  (request, response) => {
    response.send(`<h1>Application Homepage</h1> <h2>${request.session.userName}</h2><p><a href="/logout">Logout</a></p> <p><a href="/login">Login</a></p> <p><a href="/secretpage">Go to the SecretPage</a></p>   <p><a href="http://localhost:8080/auth/realms/myrealm/account/">Go to Identity Provider</a></p>`);
})

app.get ('/login', (request, response) => {
    
    var authURL = client.authorizationUrl({
        scope: 'openid email profile',
        response_mode: 'form_post',
        //response_mode: 'fragment',
        nonce,
      });
      console.log(`Redirecting to IdP at: ${authURL}`);
      console.log();
      response.redirect(authURL);

      request.baseUrl;
})


app.get ('/secretpage',  (request, response) => {
    response.type('html');
    response.send('<h1>The Secret Page</h1><a href="/">Back to Homepage</a>');
})




app.post ('/callback', urlEncodedParser, (request, response) => {
    //console.log(request.session);
    const params = client.callbackParams(request);

   var claims =  client.callback('/', params, { nonce }).then(function(tokenSet){

        console.log('Received and validated tokens %j', tokenSet);
        console.log();

        const tokenClaims = tokenSet.claims()
        var claimsMessage = util.format('%j', tokenClaims);
        console.log(claimsMessage);
        request.session.isAuth = true;
        request.session.userName = tokenClaims.email;

        return claimsMessage;
    
    });

    claims.then(function(c) {
        response.type('html');
        response.send('<html><h1>Token</h1><p>' + request.body.id_token + '</p><h1>Claims</h1><pre>' + c + '</pre><a href="/">Return to Homepage</a>');
      }).catch(err => {
          console.log(err);
      });
 

    

});



 



