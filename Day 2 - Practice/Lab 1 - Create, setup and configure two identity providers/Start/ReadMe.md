# Lab 1 - Create & setup your development machine and configure two identity providers.

## Part 1 - Setup your development environment

To avoid any local installation/setup/permissions problems, the labs will be completed on a Windows VM running in Azure.

* VM Size = D4s_v4
* OS = Windows Server 2019 Datacenter

Your instructor will provide the logon details (IP/Username/Password) which you can use to Remote Desktop (RDP) into the server however you will need to ensure this machine has all the required software installed as the supplied image will have none of the tools you need.

If you have an existing development machine you may also use that, espeically if it's got all the software you need setup already or just as you like. The provided machine is a Windows OS however you can just as easy run these labs on MacOS or Linux. You'll have to make your own adjustments in the setup section but the labs to actually create OIDC based applications will be the same.

Most of the setup steps are initialed from the command line but there are a couple of places where UI interaction is required.

Follow these steps to setup your machine:

### Visual Studio

1. Connect to your VM using RDP and logon with the supplied admin credentials.
2. Open a PowerShell (PS) prompt.
3. Install **Visual Studio** by pasting the two lines below into the PS console window. Accept any default prompts and press `Install`.
```
(New-Object System.Net.WebClient).DownloadFile("https://authstore100.blob.core.windows.net/software/vs_community.exe","$env:USERPROFILE\Downloads\vs_community.exe")

& "$env:USERPROFILE\Downloads\vs_community.exe" --add Microsoft.VisualStudio.Workload.Azure --add Microsoft.VisualStudio.Workload.NetCoreTools --add Microsoft.VisualStudio.Workload.NetWeb --includeRecommended
```
### Docker Desktop

1. Install **Docker Desktop** by pasting the two lines below into the PS console window. Accept any default prompts and press `Install`.
```
(New-Object System.Net.WebClient).DownloadFile("https://authstore100.blob.core.windows.net/software/DockerDesktopInstaller.exe","$env:USERPROFILE\Downloads\DockerDesktopInstaller.exe")

Invoke-Item "$env:USERPROFILE\Downloads\DockerDesktopInstaller.exe"
```
2. When install completes, press the blue button to restart your machine.
3. Connect to your VM using RDP and logon with the supplied admin credentials.
4. Open a PowerShell (PS) prompt.
5. Type `Invoke-Item 'C:\Program Files\Docker\Docker\Docker Desktop.exe'` to start **Docker Desktop** - *Ignore warnings about depricated versions of Windows or failing to start Docker*.
6. Accept the Licence Agreement and press `Install`.

### Other Configs

1. Disable the built-in firewall
```
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

### Chocolatey

1. Download & install Chocolatey package manager
```
Set-ExecutionPolicy Bypass -Scope Process -Force;
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072;

Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```
2. Close and reopen the PowerShell console to pickup changes in the PATH environment variable.

### Other Software

1. Install some key choco packages we are going to need.
```
choco install nodejs -y
choco install vscode -y
choco install git -y
choco install postman -y
choco install googlechrome -y
```
> The Chrome install sometimes throws a SHA256 error when installing so you might need to do it manually but it should still however download the installer to C:\Users\XXXXXXX\AppData\Local\Temp\2\chocolatey\GoogleChrome\94.0.4606.81\googlechromestandaloneenterprise64.msi. Just double-click the .msi to install it if fails to install using Choco.

## Part 2 - Creating Identity Providers
When you create web & API applications in the following labs you will need an identity provider to create and sign the ID/Access tokens.

In this workshop you will create two providers

1. A cloud based provider using AzureAD
2. An on-premises provder using KeyCloak running inside a Docker container.

Whilst the setup & administration of these two products is different, there are many similar concepts between the two as both are designed to issue JWT tokens using the OIDC protocol. You will notice there is a difference in terminology for the same concept across the two, but in other areas they are the same.

The aim of the workshop is not to get hung-up on the details of which identity provider will be used but to understand the key concepts of how authentication using OIDC works and how to build applications that use it.

### Create an Azure AD Tenant

You will need an **outlook.com** email address to complete this part of the lab. If you don't have one, [click here to create one](https://outlook.live.com/owa/?nlp=1&signup=1).

1. Sign in to the [Azure portal](https://portal.azure.com/) using your new account. You won't be able to create any Azure Resources as this account won't have an Azure subscription however it will have created a new Azure AD Free tenant for you.
> The domain name of the tenant is based on your username, e.g if you signed-in as *workshopuser99@outlook.com*, a new tenant called **workshopuser99outlook.onmicrosoft.com** is created.
2. From the blue search bar at the top of the screen type `Azure Active Directory` and click the link which appears under *Services*. This will take you to the homepage for your new AAD tenant. If under **Basic Information** the *Name* and *Primary Domain* values are blank, logoff, wait 5 minutes then log back-in again.
3. From the menu on the left hand side, under **Manage** click *Users*.
4. From the top menu, click **+ New User**.
5. Under *Identity*, set the **Username** to be *bobsmith*.
6. Enter **Bob Smith** as the *Name*.
7. Make a note of the *Password*.
8. Click **Create** at the bottom of the page.

This concludes the creation of the Azure AD tenent. You will in a later lab come back and configure it further.

### Setup & configure KeyCloak IdP

This section will setup an on-premises identity provider running inside a Docker container. On-prem IdPs are commonly used when the applications that rely on them are located on closed networks without internet access or when you have other reasons for not wanting to use a cloud provider.

> A good beginner tutorial for running KeyCloak and configuring a user can be found on the KeyCloak website. Rather than copy the instructions here, follow the guide at https://www.keycloak.org/getting-started/getting-started-docker to create a docker container, create a new user and even test the application is working by making use of a test application hosted on the KeyCloak website.

>> Don't worry if you don't get the test application working, as long as you have started the container, created a Realm and a test user called `myuser` you can consider this stage to be completed. You will create a Client application in a later lab.

## Part 3 - Create a MongoDB
A MongoDB will be used by some of the Node.js/Express applications you will build to store session cookies. As MongoDB is available as a Docker image, it's simply a case of running:
```
docker run --name mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=mongoadminpassword mongo
```
Now download the MongoDB management UI:
```
(New-Object System.Net.WebClient).DownloadFile("https://downloads.mongodb.com/compass/mongodb-compass-1.28.4-win32-x64.zip","$env:USERPROFILE\Downloads\mongodb-compass-1.28.4-win32-x64.zip")

Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\mongodb-compass-1.28.4-win32-x64.zip" -DestinationPath "$env:USERPROFILE\Downloads\mongodb-compass"

Invoke-Item "$env:USERPROFILE\Downloads\mongodb-compass\MongoDBCompass.exe"
```
When prompted for a connection string, use `mongodb://mongoadmin:mongoadminpassword@127.0.0.1:27017/?authSource=admin`. Ensure you can browser the databases.


