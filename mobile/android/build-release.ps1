$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$privateDirectory = Join-Path $projectRoot '.admin'
New-Item -ItemType Directory -Force -Path $privateDirectory | Out-Null
$keyFile = Join-Path $privateDirectory 'widgets-release.jks'
$passwordFile = Join-Path $privateDirectory 'widgets-signing.xml'
if (!(Test-Path -LiteralPath $passwordFile)) {
    $passwordBytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($passwordBytes)
    $secure = ConvertTo-SecureString ([Convert]::ToBase64String($passwordBytes)) -AsPlainText -Force
    $secure | Export-Clixml -LiteralPath $passwordFile
}
$secure = Import-Clixml -LiteralPath $passwordFile
$env:ARPIT_WIDGET_KEY_PASSWORD = [System.Net.NetworkCredential]::new('', $secure).Password
$env:ARPIT_WIDGET_KEYSTORE = $keyFile
try {
    if (!(Test-Path -LiteralPath $keyFile)) {
        & (Join-Path $env:JAVA_HOME 'bin/keytool.exe') -genkeypair -keystore $keyFile -alias arpit-widgets -keyalg RSA -keysize 3072 -validity 10000 -storepass:env ARPIT_WIDGET_KEY_PASSWORD -keypass:env ARPIT_WIDGET_KEY_PASSWORD -dname 'CN=Arpit Agarwala, O=Arpit Agarwala, C=IN'
        if ($LASTEXITCODE -ne 0) { throw 'Signing key generation failed.' }
    }
    & $env:ARPIT_GRADLE_EXECUTABLE -p $PSScriptRoot :app:assembleRelease :app:lintRelease --console=plain
    if ($LASTEXITCODE -ne 0) { throw 'The Android build failed.' }
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'app/build/outputs/apk/release/app-release.apk') -Destination (Join-Path $projectRoot 'public/downloads/Arpit-Agarwala.apk')
}
finally {
    Remove-Item Env:ARPIT_WIDGET_KEY_PASSWORD -ErrorAction SilentlyContinue
}
