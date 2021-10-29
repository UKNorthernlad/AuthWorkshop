// Express Setup
var express = require('express');
var app = express();

// Application/x-www-form-urlencoded body POST parser
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended:true});

// OIDC Setup
var {Issuer} = require('openid-client');
var {generators} = require('openid-client');
var nonce = generators.nonce();

// Session storage
var session = require('express-session');
app.use(
    session({
        secret: "somekey",
        resave: false,
        saveUninitialized: false,
    })
);

const mongoURI = "mongodb://mongoadmin:mongoadminpassword@localhost:27017/sessions";
var MongoStore = require('connect-mongo');
var mongoose = require('mongoose');
var MongoDBSession = require('connect-mongodb-session')(session);
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then (res => {
    console.log("MongoDB Connected");
});

// var store = new MongoDBSession({
//     uri : mongoURI,
//     collection : "mySessions",
// });





app.listen(8081, () => console.log('Listening on Port 8081')); 
var client;

var result = Issuer.discover('http://localhost:8080/auth/realms/myrealm/')// => Promise
.then(function (keyCloakIssuer) {
    console.log('Discovered issuer %s', keyCloakIssuer.issuer);
    console.log('Metadata %O', keyCloakIssuer.metadata);

    client = new keyCloakIssuer.Client({
        client_id: 'myfirstapp',
        redirect_uris: ['http://localhost:8081/callback'],
        response_types: ['id_token'],
        // id_token_signed_response_alg (default "RS256")
      }); // => Client

  });

app.get ('/', (request, response) => {
    console.log(request.session);
    response.send('<h1>Application Homepage</h1><a href="/login">Login</a>');
})

app.get ('/login', (request, response) => {
    console.log(request.session);
    var authURL = client.authorizationUrl({
        scope: 'openid email profile',
        response_mode: 'form_post',
        //response_mode: 'fragment',
        nonce,
      });
      console.log(`Redirecting to IdP at: ${authURL}`);
      console.log();
      response.redirect(authURL);
})


app.post ('/callback', urlEncodedParser, (request, response) => {
    console.log(request.session);
    const params = client.callbackParams(request);

    client.callback('/', params, { nonce }).then(function(tokenSet){

        console.log('Received and validated tokens %j', tokenSet);
        console.log();
        console.log('Validated ID Token claims %j', tokenSet.claims());
    });
 

    response.send(request.body.id_token);

});



 



