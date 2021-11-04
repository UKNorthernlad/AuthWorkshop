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

1. Open the starter content at `.\AuthWorkshop\Day 2 - Practice\Lab 2 - Create Applications\Start\Ex2\backend` in **A SECOND INSTANCE**  of Visual Studio Code.
