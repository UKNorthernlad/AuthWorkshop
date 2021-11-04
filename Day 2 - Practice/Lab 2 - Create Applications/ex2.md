# Lab2 - Build Applications

## Exercise 2 - Confidential Client Application that uses a backend API
The next logical step is to build an application that runs on a server but needs to talk to a remote API in the context of the logged-on user. To do this you need to make two key changes:

1. Define the backend API as its own unique client application in KeyCloak.

2. Configure KeyCloak to understand that the FrontEnd application (myfirstapp) and the BackEnd API (backendAPI) are related and when users login to the FrontEnd application, they are prompted to consent to an access token being issued for the BackEnd API. The FrontEnd app will keep this token and use it whenever it needs to access the Backend API.

3. Configure the BackEnd API application to trust access tokens issued by KeyCloak and to check tokens contain a valid `scope`.

### Task 1 - A Node.js application that uses KeyCloak and talks to a backend API.

#### Configuring KeyCloak

1. XXXX

#### Building/Configuring the applications - FrontEnd Application

1. Open the starter content at `.\AuthWorkshop\Day 2 - Practice\Lab 2 - Create Applications\Start\Ex2\frontend` in Visual Studio Code.

1. Notice there is now a new file, `apicall.js` - open it for review.
> This contains a function which will call the backend API.

1. Uncomment the function definition in line 5.
> Notice this takes parameters which indicate where the backend API is located, hostname, port etc.
>
> Most importantly it contains an `accesstoken` parameter. You will need to pass the access token received from the IdP to the BackEnd to autheneticate access.

1. Uncomment line 12. Here you are setting the `authorization: bearer <accesstoken value>` Header in the HTTP GET request being made to the backend API. Without this, your HTTP call won't be authenticated.

1. Open the `index.js` file.

1. Uncomment line 5 (added "var apiCall = require('./apicall');")

1. Uncomment line 63 (show we are still using the "Code" flow which will obtain obtain both an ID and Access token).

1. Uncomment line 126 (make the API call)

1. Review lines 171,172 (notice that the callback page now prints out the tokens for debugging purposes).

1. Update line 62 with the `client secret` for the `myfirstapp`. This will be unqiue for each environment so don't rely on the value else you won't be able to redeem the Authorization code into ID & Access Tokens.

1. Save the progress so far and run the application with `nodemon .`

1. Open a browser to `http://localhost:8081` and click on the **Sign-in** link.
> This will redirect you to KeyCloak, so login with the `myuser` username & password.
>
> Did you notice you got prompted to *Consent* to the various scopes? If you don't see this you possibly didn't configure the client applications in KeyCloak correctly.
>

1. Once you are back on the */callback* page, you can click any of the links to view the decoded token and see what data lies inside each of them.
> You *could* press the `Secret Page` link which calls the backend API, but you've not configured that yet - so expect an error if you do.

#### Building/Configuring the applications - BackEnd Application
This is the application which implements the backend API. It's really just a simple Node.js/Express application with a page handler for a single `/api/tasks` page which returns a JSON object array. In a real application you would obviously pull the data a long term data store.

1. Open the starter content at `.\AuthWorkshop\Day 2 - Practice\Lab 2 - Create Applications\Start\Ex2\backend` in **A SECOND INSTANCE** of Visual Studio Code.

1. Uncomment line 18. See that the application is now using a new node package which extracts the bearer token from an `authorization` header. This only extracts the token, it doesn't actually verify it is correct. The verification is a separate step.

1. Update line 38 starting `client_secret: ` with the secret value for the backend application you registered earlier. The application will use its clientID and secret to make a connection to KeyCloak to verify the access_token it received is valid (i.e. has not be changed or forged).
> This is possible because the access_token is digitially signed and the IdP checks the signature.

1. Review lines 39,40. Notice these are now commented out - leave them that way as this application won't be requesting new tokens (so doesn't need *redirect_uris* or *reponse_types*).

1. Review line 120 - this is the actual API page handler which returns the data back to the Front End. Notice that it now has an "auth" middlewear to check for valid tokens (you will look at that next).

1. Review line 122. See how this uses the `request.isTokenValid` value to decide wether to return the actual data or some error code if the token was invalid. In a real application you would have pulled the data from a database or similar.
> There is also an argument for returning an HTTP 401 error from the middlewear when the absense of an `authorization` header is detected or the access_token value is not valid. For the purposes of understanding the flow, it's been kept as simple as possible.

1. Uncomment lines 47 - 149. This is the middlewear which checks for the presence of an Authorization token & validates it.
> Some authentication libaries such as MSAL can validate the digital signature on the token locally because they downloaded the public key from the IdP when the application started up. Once done they can check the token is in date, that its really for them and not some other application. This is done by checking the `aud` audience claim in the token.
>
> The `openid-client` npm package used in this application doesn't have this feature (although there is nothing to stop you from writing something because the public key is avaialble from KeyCloak at `http://localhost:8080/auth/realms/myrealm/`).
>
> As an alternative this npm package relies on `Introspection`. This is the ability to call the IdP on it's *introspection_URL*, pass in it's *clientID* & *secret* along with the received token. The IdP will verify the token (digitial signature, time window validity etc) and return a decoded token. The middlewear will console.log() this decoded token for review.
>
> Introspection only says if the token is valid. It is now upto the application developer check the `aud` claim to understand if the receiced token really is for them.
>
> The access_token might also contain other data such as *Roles* etc. which can be used by the backend application to decide what data to return. This again must be written into the application to extract it.
