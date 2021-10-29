# Lab2 - Build Applications

In this lab you are going to build a number of different applications that use OpenID Connect (OIDC) for user authentication. 

Real world development teams might use a mixture of different tools, frameworks and application architectures therefore this lab will attempt to introduce you to some of the more common combinations. 

Accordingly these programs will be written in C#, whilst others will use Node.js and there will be a mixture of different applications types (WebServer, Single Page Application, WebServer + Backend API, non-confidential client apps & Service/Daemon applications). Some applications will be created using Visual Studio, whilst others will use Visual Studio Code.

Where it is possible or praticle it will be shown how to use either AzureAD or KeyCloak as the identity provider and use either the **Microsoft Authentication Library (MSAL)** or the *npm* **Open-Client** package.

It will be assumed that the reader is already an experienced developer and is familiar with the Microsoft development world or the Node.js way of creating applications. This will mean that step by step "press here, click that" sorts of instructions won't be present except where it is covering a new authentication related topic that the reader probably won't have seen before.

Microsoft has extensive samples & documentation which guide a developer through the process of creating OIDC applications on a number of different platforms (Windows, MacOS, iOS, Android) using several diffent development languages (.NetCore, Node.js, Ruby, Python, etc) however all samples DO assume the developer is using Azure AD. 

Accordingly where an existing Microsoft lab excersise covers an indented area of learning, you will be directed to the appropriate page at http://docs.microsoft.com however for cases where you would be using the KeyCloak IdP, then a custom step-by-step set of instructions will be provided below.

See https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-overview for an extensive overview of OIDC, detailed samples & further reading.

## Exercise 1 - Simple WebServer based app with user authentication
For this first exercise you are going to build a basic server-side web application that a user can log into via a "login" link on the homepage.

Whilst the first few parts will use Azure AD (AAD), don't let this worry you too much. OIDC works the same whether using AAD, KeyCloak or any other 3rd party IdP product. The URLs used may be different and the way to configure the product might be done in code rather than through a UI but the aim here is to concentrate on OIDC and not the IdP being used.

### Part 1 - A Visual Studio C# application using AAD.
Microsoft already has an suitable quickstart lab for this most basic case. It offers an *automatic* or *manual* option to configure the sample code and it's recommended that you use the **manual** option so that you get exposure to configuring all the required parts.

The sample application makes use of the *Microsoft Authentication Library* (MSAL) which provides some important OIDC related features which perform tasks such as confirming JWT tokens are legitimate and have not been tampered with. This is the reason why you won't see any code which performs these sorts of checks.

This sample uses the *Implicit* flow (response_type=id_token) and is perfect for simply authenticating your end-users, assuming the only job you want done is authenticating the user and then relying on your own session mechanism with no need for accessing any third party APIs with an Access Token from the Authorization Server.

> The sample you download contains two lines of code which automatically force you to sign-in once you run the application. To help understand the OIDC process, it's recommended that you make a couple of changes to the application before you run it for the first time.
>  1. /Controllers/HomeController.cs   ----  Comment out line 13.
>  2. /StartUp.cs  ---- Comment out line 41.

1. Browse to https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-aspnet-core-webapp and follow the instructions. Upon completion of that excersise, return here.
2. Review the code, especially the lines you commened out above. Add them back in and run the application again. What's the difference this time?

### Part 2 - A Visual Studio Code Node.js application using AAD & MSAL for Node.
This is pretty much the same exercise as previous but instead you will be using Node.js, AAD and MSAL for Node.js. The only difference is that this time the application is using the *authorization* code flow which means that AAD doesn't produce a full JWT ID token, but instead only a special *authorization code* which it gives to the browser - it then hands that to the Node.js application. This in turn uses its own special *secret* password AND the auth code to speak directly to AAD to obtain the JWT. The upshot of this is that the ID JWT token is never given directly to the browser and the user can't read its contents.

1. Browse to https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-nodejs-webapp-msal and follow the instructions, returning here afterwards.

Besides MSAL for Node.js (which is the offical Microsoft supported authentication library for AAD), other alternative *npm* packages exist to perform OIDC authentication & token processing. Common ones include *OpenID-Client* and *Passport.js*. 

### Part 3 (Optional) - A Node.js application which uses Passport.js
In this quickstart, you download and run a code sample that demonstrates how to set up OpenID Connect authentication in a web application built using Node.js with Express and Passport.js but the end result is pretty much the same as that in the previous section. Whilst the code may look very different (because you are using a different npm package) or Redirect URIs may not be the same, the process of configuring Applications in AAD and inserting values into the code remains unchanged.

One advantage of using authentication libaries such as Passport.js is that you can customize how the login/logout process works by adding code into your own handlers. However as you can see from the code sample, it means your application can be full of boiler-plate code.

1. Browse to https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-nodejs-webapp and follow the instructions, returning here afterwards.

### Part 4 - A Node.js application which uses KeyCloak IdP & OpenId-Client.
Let's now move to an application which uses Node.js and KeyCloak as the IdP. You created a KeyCloak docker container in the setup lab, but now you are going to configure it with an application, in much the same way as you did for Azure AD. You will then create a Node.js application and install the *OpenId-Client* npm package.

As assumption has been made that you are familiar with Node.js development, so the steps below are the bare minimum you'll need to follow to get the lab completed.

1. mkdir c:\temp
2. cd \temp
3. mkdir ex1part4
4. cd ex1part4
5. npm install -g nodemon
6. npm init -y
7. npm install openid-client
8. Add a new "start" script to the package.json file
```
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start" : "nodemon ."
  },
```
9. Add an *index.js* file then add the code below. This will make a connection to the IdP and download its *metadata* which is a description of the services & configuration values it offers:
```
const { Issuer } = require('openid-client');
Issuer.discover('http://localhost:8080/auth/realms/myrealm/') // => Promise
  .then(function (keyCloakIssuer) {
    console.log('Discovered issuer %s', keyCloakIssuer.issuer);
    console.log('Metadata %O', keyCloakIssuer.metadata);
  });
  ```
10. Browse to `http://localhost:8080/auth/realms/myrealm/` to check that KeyCloak is up and running, if not, start another Docker container as described at https://www.keycloak.org/getting-started/getting-started-docker.
> It can take several minutes for the application to startup inside the container - so be patient. When you see `**Admin console listening on http://127.0.0.1:9990**` in the output window, you'll know it's up and running. You can then browse to `http://localhost:8080/auth/admin/` to login with admin/admin credentials.
11. Make sure you follow the part of the above setup guide to create a Realm called `myrealm` and also a user called `myuser` (remember that a *Realm* is the equivalent of an AAD Tenant). Don't worry about following the part on creating a client, there are steps coming up shortly explaining what you need to do.
12. Run `npm start` to execute the program.
> This simple program will connect to a well known URL endpoint for your Realm and display the IdP metadata.

The output should look similar to the following:
```
PS C:\temp\ex1part4> node .
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
If you see something similar to the error message below, there is a good change that nothing is listening on port 8080. In other words, your Docker container is not running correctly.
```
PS C:\temp\ex1part4> node .
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
13. Rename `index.js` to `metadata.js` - you will be able to run this page anytime to ensure that KeyCloak is running and that your application is capable of taking to it.

Now let's configure an application in KeyCloak. Initally we are going to configure an *Implicit Flow* application which allows the full ID Token to be passed via the browser (just like the very first AAD example you completed above):

14. In the KeyCloak admin console, ensure you are still logged-in as the `admin` user and the Realm is set to `myrelam` (top left hand side of the screen).
15. Click `clients` in the menu, then on the far right of the screen, click `Create`.
16. Set *ClientId* to `myfirstapp`.
17. Set *Root URL* to `http://localhost:8081`.
18. Press `Save` to return to the *Settings* tab.
19. Locate the *Implicit Flow Allowed* settings switch and set this to `On`.
20. Press `Save` at the bottom of the screen.

Now you will create the application code:

21. Create a new `index.js` file.
22. npm install express
23. 



























## Exercise 2 - Secure WebServer Application that uses a backend API
For this second exercise you are going to build a "Secure Web Server" application. "Secure" in this context refers to an application that runs on a remote server and where the end-user is unable to see the source code or (more importantly) the configuration the application uses to support authentication. This is in contrast to a client-side application which runs in the browser where the user can "view source" at any time.

Secure web server applications allow the storing of **secrets** aka passwords in configuration files or environment variables which can be used to obtain access tokens which are then used to access backend APIs.

### Part 1 - A Visual Studio C# application.
https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-aspnet-core-web-api


### Part 2 - A Visual Studio Code Node.js application.
XXXXXXXXXXXXX
























## Exercise 3 - Advanced WebServer Application that uses custom backend API scopes.
For this third ......

### Part 1 - A Visual Studio C# application.
XXXXXXXXXXXXX

### Part 2 - User Scopes v Application Scopes
XXXXXXXXXXXXX

### Part 3 - A Visual Studio Code Node.js application.
XXXXXXXXXXXXX






















## Exercise 4 - Single Page Web Applications
In this 4th exercise you will create a typical **Single Page Application** which will pull data from an backend API. Whilst this may appear to be similar to Exercise 2 there is one important difference. This application is unable to securely store a "secret" (as the user could view the source code at any time) therefore a different "flow" must be used to obtain the id/access token.

https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-nodejs-desktop























## Exercise 5 - Background Services/Daemon Applications.
XXXXXXXXXXXXX

### Part 1 - A Visual Studio C# application.
https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-netcore-daemon

### Part 2 - Node.js Application
https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-nodejs-console















## Exercise 6 - Resource Owner Credential Flow
XXXXXXXXXXXXX

### Part 1 - A Visual Studio C# application.
XXXXXXXXXXXXX

### Part 2 - Node.js Application
XXXXXXXXXXXXX






# TODO - If time.


* Aquire token silently.



###########################################################
###########################################################
###########################################################
###########################################################

# Which version of node do you have installed?
node -v

# You can install different version of node.js on a machine, e.g.
nvm install v0.10.31 

# Switch to using a specific installed version, e.g.
nvm use v16.11.1 


#npm install express # backend framework for node.js

docker run -d -p 8080:8080   --name keycloak -e KEYCLOAK_USER=admin                   -e KEYCLOAK_PASSWORD=admin                       quay.io/keycloak/keycloak:15.0.2
docker run -d -p 27017:27017 --name mongodb  -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=mongoadminpassword mongo

