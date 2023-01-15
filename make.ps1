npm run clean:environment | out-null
npm run build:unzipped | out-null
if (Test-Path -Path C:\Games\SPT-DEV\user\mods\AlexAIO-Reboot\) {
    Remove-Item -Recurse -Force C:\Games\SPT-DEV\user\mods\AlexAIO-Reboot\ | out-null
}
mkdir C:\Games\SPT-DEV\user\mods\AlexAIO-Reboot\ | out-null
Copy-Item -Recurse -Path .\dist\* -Destination C:\Games\SPT-DEV\user\mods\AlexAIO-Reboot\ | out-null
Remove-Item C:\Games\SPT-DEV\user\mods\AlexAIO-Reboot\make.ps1 | out-null
Set-Location C:\Games\SPT-DEV\ | out-null
Start-Process powershell {./Aki.Server.exe}
Start-Process powershell {./Aki.Launcher.exe}
Set-Location C:\Users\TheEyeOfAr3s\Documents\coding\SPTarkov\AlexAIO-Reboot\ | out-null