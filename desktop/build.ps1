$ErrorActionPreference = 'Stop'
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (!(Test-Path -LiteralPath $compiler)) {
    throw 'The Windows .NET Framework 4.x compiler is required.'
}
$root = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $root 'public\downloads'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$output = Join-Path $outputDir 'Arpit-Agarwala.exe'
$source = Join-Path $PSScriptRoot 'Launcher.cs'
$icon = Join-Path $PSScriptRoot 'App.ico'
& $compiler /nologo /target:winexe /optimize+ /reference:System.Windows.Forms.dll "/win32icon:$icon" "/out:$output" $source
if ($LASTEXITCODE -ne 0) { throw 'The Windows launcher could not be built.' }
Get-Item -LiteralPath $output
