# Lab2 - Build Applications

## Exercise 1 - Simple WebServer based app with user authentication
For this first exercise you are going to build a basic server-side web application that a user can log into via a "login" link on the homepage.

Whilst the first few parts will use Azure AD (AAD), don't let this worry you too much. OIDC works the same whether using AAD, KeyCloak or any other 3rd party IdP product. The URLs used may be different and the way to configure the product might be done in code rather than through a UI but the aim here is to concentrate on OIDC and not the IdP being used.

### Task 1 - A Visual Studio C# application using AAD.
Microsoft already has a suitable quickstart lab for this most basic case. It offers an *automatic* or *manual* option to configure the sample code and it's recommended that you use the **manual** option so that you get exposure to configuring all the required parts.

The sample application makes use of the *Microsoft Authentication Library* (MSAL) which provides some important OIDC related features which perform tasks such as confirming JWT tokens are legitimate and have not been tampered with. This is the reason why you won't see any code which performs these sorts of checks.

This sample uses the *Implicit* flow (response_type=id_token) and is perfect for simply authenticating your end-users, assuming the only job you want done is authenticating the user and then relying on your own session mechanism with no need for accessing any third party APIs with an Access Token from the Authorization Server.

> The sample you are about to download contains two lines of code which automatically force you to sign-in once you run the application. To help understand the OIDC process, it's recommended that you make a couple of changes to the application before you run it for the first time.
>  1. /Controllers/HomeController.cs   ----  Comment out line 13.
>  2. /StartUp.cs  ---- Comment out line 41.

1. Browse to https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-aspnet-core-webapp and follow the instructions to download and configure the sample code. This will also walk you through the process of creating a new application registration to support it.
> Once you have downloaded and extracted the code, you will need to double-click on the `WebApp-OpenIDConnect-DotNet.sln` file to open the project in Visual Studio.
> 
> Upon completion of that excersise, return here.
2. Review the code, especially the lines you commened out above. Add them back in and run the application again. What's the difference this time?

### Task 2 - A Visual Studio Code Node.js application using AAD & MSAL for Node.
This is pretty much the same exercise as previous but instead you will be using Node.js, AAD and MSAL for Node.js. The only difference is that this time the application is using the *authorization* code flow which means that AAD doesn't produce a full JWT ID token, but instead only a special *authorization code* which it gives to the browser - it then hands that to the Node.js application. This in turn uses its own special *secret* password AND the auth code to speak directly to AAD to obtain the JWT. The upshot of this is that the ID JWT token is never given directly to the browser and the user can't read its contents.

1. Browse to https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-nodejs-webapp-msal and follow the instructions, returning here afterwards.

Besides MSAL for Node.js (which is the offical Microsoft supported authentication library for AAD), other alternative *npm* packages exist to perform OIDC authentication & token processing. Common ones include *OpenID-Client* and *Passport.js*. 

### Task 3 (Optional) - A Node.js application which uses Passport.js
In this quickstart, you download and run a code sample that demonstrates how to set up OpenID Connect authentication in a web application built using Node.js with Express and Passport.js but the end result is pretty much the same as that in the previous section. Whilst the code may look very different (because you are using a different npm package) or Redirect URIs may not be the same, the process of configuring Applications in AAD and inserting values into the code remains unchanged.

One advantage of using authentication libaries such as Passport.js is that you can customize how the login/logout process works by adding code into your own handlers. However as you can see from the code sample, it means your application can be full of boiler-plate code.

1. Browse to https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-nodejs-webapp and follow the instructions, returning here afterwards.

### Task 4 - A Node.js application which uses KeyCloak IdP, OpenId-Client and the OIDC Implicit Flow.
Let's now move to an application which uses Node.js and KeyCloak as the IdP. You created a KeyCloak docker container in the setup lab, but now you are going to configure it with an application, in much the same way as you did for Azure AD. It will be configured to use the `Implicit Flow` aka `Public Client Flow` to issue tokens. You will then create a Node.js application and install the *OpenId-Client* npm package.

As assumption has been made that you are familiar with Node.js development, so the steps below are the bare minimum you'll need to follow to get the lab completed.

You will start with a partially written application and slowly add-in the functionallity needed to support OIDC.

1. Open the sample folder in VSCode.
```
cd .\Day 2 - Practice\Lab 2 - Create Applications\Start\Ex1 Task 4

code .
```
2. Run `npm install -g nodemon` to install the Node monitor tool, then run `npm install` to download all the required packages.

3. Now run the application to see its current state:
```
nodemon .
```
> Open a browser at `http://localhost:8081`. You should see a basic application homepage.
> * Under the H1 heading, it says "undefined" - this will eventually show your login name.
> 
> There are two links:
> 
> * The `SecretPage` is currently accessible but eventually you will change this so that it can only be accessed by authenticated users.
> * The `Identity Provider` link takes you to the KeyCloak IdP.

4. Review lines 1-10 of the application. This is standard Node.js/Express setup code.

5. Line 48 sets the application listening on port 8081.

6. Lines 100-105 and 123-126 are the handlers for the root Homepage & SecretPage.

7. Replace lines 12-15 with the following to create an `Issuer` object which will hold configuration information about your IdP and also generate *nonce* values. These are used to help prevent replay attacks.
```
// OIDC Setup
var {Issuer} = require('openid-client');
var {generators} = require('openid-client');
var nonce = generators.nonce();
```

8. Replace lines 51-65 will the following:
```
var client;

Issuer.discover('http://localhost:8080/auth/realms/myrealm/')// => Promise
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
```

> * Lines 53-56 will query your KeyCloak IdP for the `myrealm` and return detailed configuration settings & options.
> * The code from 99-104 configure the application with its:
>   * `client_id` which must match that configured in the IdP
>   * `redirect_uri` which an an application URL that will receive and process tokens from the IdP. This must match the same value configured in the IdP.
>   * `response_types` states that we will only require an ID Token when we authenticate (i.e. we won't be needing any Access Tokens).

9. Hit Ctrl+C to save your changes. Nodemon will automatically reload the application.

10. Browse to `http://localhost:8080/auth/realms/myrealm/` to view the metadata that KeyCloak provides. This includes things such as the public key which is used to verify any tokens it issues.

> It can take several minutes for KeyCloak to startup inside the container - so be patient. When you see `**Admin console listening on http://127.0.0.1:9990**` at the bottom of the window from where you launched the container, you'll know it's up and running.
> * If KeyCloak is not answering, try to create another Docker container as described at https://www.keycloak.org/getting-started/getting-started-docker.
> * Make sure you follow the part of the above setup guide to create a Realm called `myrealm` and also a user called `myuser` (remember that a *Realm* is the equivalent of an AAD Tenant).
> * You should also ensure that the *myuser* has an email address. This will be extracted into the ID Token and eventually displayed on the application homepage.
> * Don't worry about following the part for creating a client, there are steps coming up shortly explaining what you need to do.

11. View the output from your Nodemon console, you should see the metadata has been downloaded. The output should look similar to the following:
```
Discovered issuer http://localhost:8080/auth/realms/myrealm
Metadata {
  claim_types_supported: [ 'normal' ],
  claims_parameter_supported: true,
  grant_types_supported: [
    'authorization_code',
    'implicit',
    'refresh_token',
    'password',
    'client_credentials',
    'urn:ietf:params:oauth:grant-type:device_code',
    'urn:openid:params:grant-type:ciba'
  ],
  request_parameter_supported: true,
  request_uri_parameter_supported: true,
  require_request_uri_registration: true,
  response_modes_supported: [
    'query',
    'fragment',
    'form_post',
    'query.jwt',
    'fragment.jwt',
    'form_post.jwt',
    'jwt'
  ],
  token_endpoint_auth_methods_supported: [
    'private_key_jwt',
    'client_secret_basic',
    'client_secret_post',
    'tls_client_auth',
    'client_secret_jwt'
  ],
  issuer: 'http://localhost:8080/auth/realms/myrealm',
  authorization_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/auth',
  token_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/token',
  introspection_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/token/introspect',
  userinfo_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/userinfo',
  end_session_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/logout',
  jwks_uri: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/certs',
  check_session_iframe: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/login-status-iframe.html',
  response_types_supported: [
    'code',
    'none',
    'id_token',
    'token',
    'id_token token',
    'code id_token',
    'code token',
    'code id_token token'
  ],
  subject_types_supported: [ 'public', 'pairwise' ],
  id_token_signing_alg_values_supported: [
    'PS384', 'ES384',
    'RS384', 'HS256',
    'HS512', 'ES256',
    'RS256', 'HS384',
    'ES512', 'PS256',
    'PS512', 'RS512'
  ],
  id_token_encryption_alg_values_supported: [ 'RSA-OAEP', 'RSA-OAEP-256', 'RSA1_5' ],
  id_token_encryption_enc_values_supported: [
    'A256GCM',
    'A192GCM',
    'A128GCM',
    'A128CBC-HS256',
    'A192CBC-HS384',
    'A256CBC-HS512'
  ],
  userinfo_signing_alg_values_supported: [
    'PS384', 'ES384',
    'RS384', 'HS256',
    'HS512', 'ES256',
    'RS256', 'HS384',
    'ES512', 'PS256',
    'PS512', 'RS512',
    'none'
  ],
  request_object_signing_alg_values_supported: [
    'PS384', 'ES384',
    'RS384', 'HS256',
    'HS512', 'ES256',
    'RS256', 'HS384',
    'ES512', 'PS256',
    'PS512', 'RS512',
    'none'
  ],
  request_object_encryption_alg_values_supported: [ 'RSA-OAEP', 'RSA-OAEP-256', 'RSA1_5' ],
  request_object_encryption_enc_values_supported: [
    'A256GCM',
    'A192GCM',
    'A128GCM',
    'A128CBC-HS256',
    'A192CBC-HS384',
    'A256CBC-HS512'
  ],
  registration_endpoint: 'http://localhost:8080/auth/realms/myrealm/clients-registrations/openid-connect',
  token_endpoint_auth_signing_alg_values_supported: [
    'PS384', 'ES384',
    'RS384', 'HS256',
    'HS512', 'ES256',
    'RS256', 'HS384',
    'ES512', 'PS256',
    'PS512', 'RS512'
  ],
  introspection_endpoint_auth_methods_supported: [
    'private_key_jwt',
    'client_secret_basic',
    'client_secret_post',
    'tls_client_auth',
    'client_secret_jwt'
  ],
  introspection_endpoint_auth_signing_alg_values_supported: [
    'PS384', 'ES384',
    'RS384', 'HS256',
    'HS512', 'ES256',
    'RS256', 'HS384',
    'ES512', 'PS256',
    'PS512', 'RS512'
  ],
  authorization_signing_alg_values_supported: [
    'PS384', 'ES384',
    'RS384', 'HS256',
    'HS512', 'ES256',
    'RS256', 'HS384',
    'ES512', 'PS256',
    'PS512', 'RS512'
  ],
  authorization_encryption_alg_values_supported: [ 'RSA-OAEP', 'RSA-OAEP-256', 'RSA1_5' ],
  authorization_encryption_enc_values_supported: [
    'A256GCM',
    'A192GCM',
    'A128GCM',
    'A128CBC-HS256',
    'A192CBC-HS384',
    'A256CBC-HS512'
  ],
  claims_supported: [
    'aud',
    'sub',
    'iss',
    'auth_time',
    'name',
    'given_name',
    'family_name',
    'preferred_username',
    'email',
    'acr'
  ],
  scopes_supported: [
    'openid',
    'email',
    'offline_access',
    'profile',
    'roles',
    'phone',
    'microprofile-jwt',
    'address',
    'web-origins'
  ],
  code_challenge_methods_supported: [ 'plain', 'S256' ],
  tls_client_certificate_bound_access_tokens: true,
  revocation_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/revoke',
  revocation_endpoint_auth_methods_supported: [
    'private_key_jwt',
    'client_secret_basic',
    'client_secret_post',
    'tls_client_auth',
    'client_secret_jwt'
  ],
  revocation_endpoint_auth_signing_alg_values_supported: [
    'PS384', 'ES384',
    'RS384', 'HS256',
    'HS512', 'ES256',
    'RS256', 'HS384',
    'ES512', 'PS256',
    'PS512', 'RS512'
  ],
  backchannel_logout_supported: true,
  backchannel_logout_session_supported: true,
  device_authorization_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/auth/device',
  backchannel_token_delivery_modes_supported: [ 'poll', 'ping' ],
  backchannel_authentication_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/ext/ciba/auth',
  backchannel_authentication_request_signing_alg_values_supported: [
    'PS384', 'ES384',
    'RS384', 'ES256',
    'RS256', 'ES512',
    'PS256', 'PS512',
    'RS512'
  ],
  require_pushed_authorization_requests: false,
  pushed_authorization_request_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/ext/par/request',
  mtls_endpoint_aliases: {
    token_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/token',
    revocation_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/revoke',
    introspection_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/token/introspect',
    device_authorization_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/auth/device',
    registration_endpoint: 'http://localhost:8080/auth/realms/myrealm/clients-registrations/openid-connect',
    userinfo_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/userinfo',
    pushed_authorization_request_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/ext/par/request',
    backchannel_authentication_endpoint: 'http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/ext/ciba/auth'
  }
}
```
If you see something similar to the error message below, there is a good chance that nothing is listening on port 8080. In other words, your Docker container is not running correctly.
```
PS C:\temp\ex1Task4> node .
node:internal/process/promises:246
          triggerUncaughtException(err, true /* fromPromise */);
          ^

Error: connect ECONNREFUSED 127.0.0.1:8080
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1146:16) {
  errno: -4078,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '127.0.0.1',
  port: 8080
}
```

Now let's configure an application in KeyCloak. We are going to configure an *Implicit Flow* application which allows the full ID Token to be passed via (and possibly read by) the browser.  This is just like the very first AAD example you completed above:

12. Login to KeyCloak admin console at `http://localhost:8080/auth/` as the `admin` user and ensure the Realm is set to `myrelam` (top left hand side of the screen).

13. Click `clients` in the menu, then on the far right of the screen, click `Create`.

14. Set *ClientId* to `myfirstapp`.

15. Set *Root URL* to `http://localhost:8081`.

> Notice these last two settings match values you configured into the application.

16. Press `Save` to return to the *Settings* tab.

17. Locate the *Implicit Flow Allowed* settings switch and set this to `On`.

18. Press `Save` at the bottom of the screen.

You now have an IdP which is configured to issue Tokens. Let's configure the rest of the Node.js application to request & process one.

21. Replace lines 107-119 with the following:
```
// Login page - Redirects the browser to the URL constructed by the client.authorizationUrl call.
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
})
```
> This is an Express page handler.
> 
> When a user clicks the `Login` link on the homepage, they are directed to `/login` which is rendered from this code. It uses the `client` object seen earlier to build a URL to the KeyCloak Idp. It will look something like this:
>
> `http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/auth?client_id=myfirstapp&scope=openid%20email%20profile&response_type=id_token&redirect_uri=http%3A%2F%2Flocalhost%3A8081%2Fcallback&response_mode=form_post&nonce=oI1AaCYwT2Sm7A4CwgeqAQ-n4wvqozjsAHgqlk6iJwk`
> 
> Notice that:
>
> * It contains a reference to the Realm: `http://localhost:8080/auth/realms/myrealm/`
>
> * We are wanting to use `openid-connect` as the authentication protocol, specifically we are now wanting to actually authenticate: `/protocol/openid-connect/auth`
>
> * We identify ourselves as the `myfirstapp` application: `client_id=myfirstapp`
>
> * We are requesting certain information be contained inside the returned token: `scope=openid%20email%20profile`. These so-called `scopes` are defined in the IdP.
>
> * We are requesting an *ID Token* but no Access Token: `response_type=id_token`
>
> * We tell the IdP which URL our application is listening on where it will process any sent tokens: `redirect_uri=http%3A%2F%2Flocalhost%3A8081%2Fcallback`. This URL must match the one configured in the IdP.
>
> * The IdP should send the *ID Token* in the form of *x-www-form-urlencoded* data encoded in the body of an HTTP POST request to the *redirect_uri*.

22. Save the code so far and browse to `http://localhost:8081`. After you press the `Login` link you will be redirected to the login page of the KeyCloak IdP where you can login with the `myuser` account.

> After logging in KeyCloak, you will be redirected back to `http://localhost:8081/callback` (try using the developer tools in the browser to confirm this).
>
> **Problem**: You don't currently have a page called `/callback` to receive the token so expect to see an error: `Cannot POST /callback`
>
> One of the responsibilities of the `/callback` page is to extract the data from the new ID Token and store it, usually in HTTP Session state. Before you can create the callback page, you need to enable the session cookie functionallity.


23. Replace lines 17-18 to enable HTTP Session state:
```
// Session cookie infrastructure
var session = require('express-session');
```

24. Each time a browser makes a call to the application, any cookies for that domain are automatically sent (this is part of the HTTP standard - it's nothing Node or OIDC specific).

     The *Session cookie*, normally called `connect.sid` in Express based Node.js applications needs to be extracted and any data inside it should be made available to the application.
     
     Replace lines 36-44 with the code below to configure an Express middleware.
```
// Middleware to read session cookie on each request
app.use(
    session({
        secret: "somekey",
        resave: false,
        saveUninitialized: false,
        //store: store, // Save the session data in the mongoDB. Default is in memory.
    })
);
```
> To prevent users tampering with the session cookie in their browser (e.g. chaning their username!) to gain elevated privledges, the cookie is nearly always encrypted (or at least digitally signed). See how the above code contains a `secret` which is used to encrypt token before they are sent and to decrypt them once they are sent back.
>
> The secret should be kept secret! Harding coding it as shown here is only suitable for development or training purposes. In reality this should be passed into the application at execution time, perhaps via an environment variable.

Now the HTTP Session infrastructure is in place, let's get back to the `/callback` page:

25. Replace lines 128-160 with code below.

    Line 129 contains a handler which listens for HTTP POST requests to the `/callback` URL. The *body* of the request is extracted into a variable called `params`.

    Line 132 is the function which inspects the token to ensure it has not been tampered with (which could happen because it is passed via the browser). Tokens are digitally signed by the IdP and the public certificate to check the signature was downloaded as part of the metadata seen way back in step 10. 

    As long as the Token checks out, lines 140 & 143 set some key values in the session cookie.
```
// Callback handler. This page receives the token from KeyCloak IdP via the POST body, confirms it's legit, extracts the claims and sets values in the session cookie.
app.post ('/callback', urlEncodedParser, (request, response) => {
    const params = client.callbackParams(request);

    var claims =  client.callback('/', params, { nonce }).then(function(tokenSet){

        console.log('Received and validated tokens %j', tokenSet);
        const tokenClaims = tokenSet.claims()
        var claimsMessage = util.format('%j', tokenClaims);
        console.log(claimsMessage);

        // Set session variable to indicate user is now authenticated.
        request.session.isAuth = true;

        // Set userName session variable. Will be read back on subsequent pages.
        request.session.userName = tokenClaims.email;

        // Extract and set session variables for any other claims from the token as you'll not see it again.
        // Typically you'd extract the unique identifier for the user (e.g. a UUID/GUID) or other unique name.
        // This might be used for keying user content in a locally attached database.

        return claimsMessage;
    });

    // Display the claims & token information in the browser for debugging purposes.
    // In a real application, you would automatically redirect back to the homepage or secured resource.
    claims.then(function(c) {
        response.type('html');
        response.send('<html><h1>Token</h1><p>' + request.body.id_token + '</p><h1>Claims</h1><pre>' + c + '</pre><a href="/">Return to Homepage</a>');
      }).catch(err => {
          console.log(err);
      });
});
```
26. Save the code so far and browse to `http://localhost:8081`. Login using the `myuser` account.
> This time, the `/callback` page will display the base64 encoded token and the decoded claims inside it.
>
> In a real application you would not display these of course, it's done here to *pause* the normal flow and help you understand what is happening.
>
> If you want, you could modify the application by updating the `.then` handler in line 154 to redirect to the homepage. 

27. Press the `Return to Homepage` link to get back to the beginning. Notice this time that an email address should be displayed under the main H1 title block.

28. Open your browser's *Developer Tools* and on the **Application** tab, under *Storage*->*Cookies* notice you now have a new cookie called `connect.sid`.
> If you delete this cookie and reload the homepage, you'll notice the email address changes back to `Unauthenticated`. Pressing `Login` again will fix the issue.

Once a user is logged-in, it is possible to use some unique & immutable piece of data from their token as the key for storing data in other systems. The next time they login, the token will contain this same unique data point which is critical if data retreival is to take place.

Another reason for authenticating the user is to control which parts of an application they can access or APIs they can call. To do this you need to include code in each webpage which tests if the user is authenticated (and typically also extracts *who* they are). Once this is known you can limit access to certain features/pages or change functionallty depending on who they are.

You are now going to secure the `SecretPage` so that only authenticated users can access it.

29. Replace lines 67-92 with the code below.

    This is an Express middleware component, which is designed to process incomming requests.
    
    Line 78 is checking to see if the request if for `/secretpage`, if so it then checks the session cookie to get the `userName` value. If this exists, it means the user has already authenticated. If it is missing (meaning they have yet to login), it displays an error.

    Finally in Line 92 the middleware is activated and all incoming requests are routed through it.
```
// Middleware to log debugging information and protect the SecretPage.
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

// Use the "auth" middleware, i.e. process each request through it.
app.use(auth);
```

30. Save the code so far and browse to `http://localhost:8081`. Click the `Login` link.
> You might notice this time you don't need to actually login but yet you are still granted an ID Token. Why do you think this is?

31. Now from the Homepage, click the `SecretPage` link. You should be able to view the page.

32. Close and reopen the browser. Now clicking on the `SecretPage` link should display an error. This is because the session cookie is memory resident only and not cached in the browser.

### Replacing in-memory storage with a database.

Session cookies which are stored in the user's browser don't actually contain the real data. The cookie value is in reality just a unique string of numbers/letters (albeit encrypted/signed) that when sent back to the server can be used to lookup an in-memory table of Session objects.

If you loose or delete the cookie in the browser, there is no way to reference the data stored server side. This is why deleting the `connect.sid` cookie appears to log you out because they server now can't check if you are logged-in or not. 

Similarly, if the server or application restarts any in-memory data is lost and your session cookie now points to something which doesn't exist. The result is the same, you appear to have logged-off. 

You will now add-in a MongoDB to store the Session data.

33. Replace Lines 20-34 with the code below.

    Lines 21 defines a connection string to a MongoDB server and database.

    In line 26 a connection is made.

    Line 31 defines the Collection where the data will be stored. *If you come from a SQL background, think of a "Collection" as being similar to a Table*.
```
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
```
34. Now you have defined *where* to store the Session data, you need to actually enable it. Uncomment line 42 (the **store** object key)to instruct the Session state middlewewar to use the database.

    Your code should now look like this:
```
// Middleware to read session cookie on each request
app.use(
    session({
        secret: "somekey",
        resave: false,
        saveUninitialized: false,
        store: store, // Save the session data in the mongoDB. Default is in memory on webserver
    })
);
```
35. Save the code so far and browse to `http://localhost:8081`. Click the `Login` link.

36. Using the `MongoDB Compass` application installed earlier, press `Refresh`, then find the `sessions` database, followed by the `mySessions` collection. You should now see the Session data has been stored in the server.

37. Finally, notice on the homepage that there is a link to `Logout` however pressing this results in an error. Create a new page handler to implement this by copying the existing `Login` handler, but replacing the body of the function with:
```
request.session.destroy((err) => {
   if(err) throw err;
   response.redirect('/');
});
```

### Task 5 - A Node.js application which uses KeyCloak IdP, OpenId-Client and the OIDC Authorization Code Flow.
Open ID Connect has a number of different ways to obtain an ID and/or Access Token. In Task 4 above you used the `Implicit Flow` (sometimes called *Public Flow*) where the full ID Token is returned from KeyCloak as an HTML page with the token in a hidden field on a form. The browser then automatically performs an HTTP POST of the data to the /callback endpoint from where the token is extracted.

The downside of this is that the client browser can read all the data in the form. But what if you don't want the user to see the token as it flows through their machine? Perhaps it contains data you would rather they did not see, e.g. a credit score?

You are now going to build a `Confidential Client` application. This has the ability to obtain an ID Token and an Access Token directly without it being passed via the client's browser. This is often refered to as the `Authorization Code Flow` or `Authorization Code Grant`.

Don't be confused by the name `Confidential Client`. This is not refering to anything executing in the browser, i.e. it's not a Single Page Applicaiton. The term refers to the Node.js application running on the server which typically then acts as a client to connect to a remote API. *Confidential* refers to the fact it can store **secrets** (aka passwords) on the server, typically in configuration files or environment variables which can be used to obtain the required tokens.

You are now going to use some starter code to build an `Authorization Code Flow` application.  You will notice it is really just a cut down version of the code you completed in the last task. Session handling, the /login, /callback & /secretpage pages are all still there, it's just some of the authentication code which is changing.

Let's begin by making the nessesary changes to the *Client* application in KeyCloak.

1. Login to the KeyCloak admin console - http://localhost:8080

2. From the left hand menu. click `Clients`, then go into the settings for the `myfirstapp`.

3. Change the *Access Type* setting to `confidential`.

4. Press `Save` at the bottom of the screen.

5. Select the *Credentials* tab at the top of the page and make a copy of the **Secret** assigned to the client application (it will be a GUID).
6. Open `\AuthWorkshop\Day 2 - Practice\Lab 2 - Create Applications\Start\Ex1 Part 5` in Visual Studio Code.

> Reviewing the code you should see it is very similar to Task 4 End, however there are a few changes.

7. Uncomment lines 108-110. Notice that the `response_mode: 'form_post'` property has been removed because it is only required to specify how you want tokens returned via the browser (using either an HTTP POST or URL Fragment). The *Authorisation Code flow* doesn't return any tokens via the browser so the *response_mode* setting has been removed to keep the code cleaner.

8. Change line 61 to read:
```
response_types: ['code'],
```

> This indicates that we now want to use an `Authorization Code` flow. Once the user has logged-in to KeyCloak it returns a special code to the /callback page rather than the full ID Token.

9. Update the `client_secret` setting in line 59 with the GUID you saved from earlier. The application uses the `client_id` and `client_secret` (which you can think of as a username & password) to connect back to KeyCloak on a special URL where it passes in the `Authorization Code` from above. The IdP then returns the proper ID Token.

10. Review line 126. Notice now the `/callback` page is an HTTP `Get` rather than HTTP `Post` as before, which means the `urlEncodedParser` that was used before is nolonger required.

11. Notice also that line 128 has been simplfied and the `{nonce}` that was used before has gone. This is nolonger required as the codes produced in an Authorization Code flow are always unique.

12. Save the code so far, launch the application with `nodemon .` and browse to `http://localhost:8081`.

13. After you press the `Login` link you will be redirected to the login page of the KeyCloak IdP where you can login with the `myuser` account. Afterwards you will be redirected to the `/callback` URL. 

> Remember now the `/callback` URL will extract the Code which is visible in the browser address bar but in the background will connect to KeyCloak, use its appID & secret along with the Code to redeem these for the real ID Token.
>
> The `/callback` page will then print out the Code and Claims from inside the ID Token. Just as before we save the information inside a session cookie and the application will perform exactly as it did previously.
