# Lab2 - Build Applications

In this lab you are going to build a number of different applications that use OpenID Connect (OIDC) for user authentication. 

Real world development teams might use a mixture of different tools, frameworks and application architectures therefore this lab will attempt to introduce you to some of the more common combinations. 

Accordingly these programs will be written in C#, whilst others will use Node.js and there will be a mixture of different applications types (WebServer, Single Page Application, WebServer + Backend API, non-confidential client apps & Service/Daemon applications). Some applications will be created using Visual Studio, whilst others will use Visual Studio Code.

Where it is possible or praticle it will be shown how to use either AzureAD or KeyCloak as the identity provider and use either the **Microsoft Authentication Library (MSAL)** or the *npm* **Open-Client** package.

It will be assumed that the reader is already an experienced developer and is familiar with the Microsoft development world or the Node.js way of creating applications. This will mean that step by step "press here, click that" sorts of instructions won't be present except where it is covering a new authentication related topic that the reader probably won't have seen before.

Microsoft has extensive samples & documentation which guide a developer through the process of creating OIDC applications on a number of different platforms (Windows, MacOS, iOS, Android) using several diffent development languages (.NetCore, Node.js, Ruby, Python, etc) however all samples DO assume the developer is using Azure AD. 

Accordingly where an existing Microsoft lab excersise covers an indented area of learning, you will be directed to the appropriate page at http://docs.microsoft.com however for cases where you would be using the KeyCloak IdP, then a custom step-by-step set of instructions will be provided below.

See https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-overview for an extensive overview of OIDC, detailed samples & further reading.


* [Exercise 1 - Simple WebServer based app with user authentication](ex1.md)
* [Exercise 2 - Confidential Client Application that uses a backend API](ex2.md)
* [Exercise 3 - Single Page Web Applications ](ex1.md)
* [Exercise 4 - Background Services/Daemon Applications.](ex1.md)