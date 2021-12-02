Connect-AzureAD

$passwordProfile = New-Object -TypeName Microsoft.Open.AzureAD.Model.PasswordProfile -ArgumentList "xxxxxx", $true

for ($user = 1; $user -le 20; $user++)
{
   $newuser = New-AzureADUser -DisplayName "User $user" -PasswordProfile $passwordProfile -AccountEnabled $true -MailNickName "user$user" -UserPrincipalName "user$user@xxxxxx.onmicrosoft.com"
   $newuser
}








