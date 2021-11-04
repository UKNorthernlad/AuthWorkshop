# Lab2 - Build Applications

## Exercise 4 - Background Services/Daemon Applications.
All the applications seen to far have had one thing in common - they all presented interactive login screens because the needed to support a real person performing the authentication.

From time to time you may need to create a background service or application that runs on a scheduled basis and connects to a remote service such as an API. OIDC supports this via the use of a `Client Credential Flow`. By registering a new client application and enabling it with a secret (as you did in a previous task) you are really providing credentials for a service/daemon type application to connect to the IdP. Note as there is no user present, the only permissions present are those which are assigned to the application.

### Task 1 (TODO) - Node.js Application with KeyCloak

1. Not yet available.

### Optional - Task 2 - Node.js Application with AAD.
Microsoft already has an suitable quickstart lab for this case.

2. Browse to https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-nodejs-console and follow the instructions, returning here afterwards.

### Optional - Task 3 - A Visual Studio C# application with AAD.
Microsoft already has an suitable quickstart lab for this case.

3. Browse to https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-netcore-daemon and follow the instructions, returning here afterwards.