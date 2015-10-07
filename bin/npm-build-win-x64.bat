@echo off

cd ..

REM Set Windows SDK Environment
call "c:\Program Files\Microsoft SDKs\Windows\v7.1\Bin\SetEnv.Cmd" /x64 /release

REM Install modules with MS Visual Studio 2010
call npm install --msvs_version=2010
