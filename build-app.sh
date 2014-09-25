#! /usr/bin/env bash

failure(){
	echo 'build failure' && exit 1;
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$DIR"
npm install;
node bundler.js


cd "$DIR"/ionic
cordova platform rm android || failure
cordova platform add android || failure
cordova build android || failure

echo 'great job.'
