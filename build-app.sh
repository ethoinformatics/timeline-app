#! /usr/bin/env bash


DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$DIR"
npm install;
node bundler.js


cd "$DIR"/ionic
cordova platform rm android
cordova platform add android
cordova build android

echo 'great job.'
