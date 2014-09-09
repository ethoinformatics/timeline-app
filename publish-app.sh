#! /usr/bin/env bash

# HOCKEY_TOKEN must be an environment var
HOCKEY_APP_ID=fce2c0e86b0cd9989fb9d6db7688cba3
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

LOCAL_VERSION="$(cat $DIR/ionic/config.xml | head -2 | tail -1 | egrep -o '"[0-9]+\.[0-9]+.[0-9]+"' | tr -d '"')";

REMOTE_VERSION="$(curl \
	-H "X-HockeyAppToken: $HOCKEY_TOKEN" \
	https://rink.hockeyapp.net/api/2/apps/$HOCKEY_APP_ID/app_versions | json app_versions.0.shortversion)"

echo $LOCAL_VERSION
echo $REMOTE_VERSION

if [[ $LOCAL_VERSION != $REMOTE_VERSION ]]; then
	echo "Publishing $LOCAL_VERSION.";

	curl  \
		-F "ipa=@$DIR/ionic/platforms/android/ant-build/EthoTimeline-debug-unaligned.apk" \
		-F "notes=$(git -C $DIR log -1 --pretty=%B)" \
		-F "commit_sha=$(git -C $DIR rev-parse HEAD)" \
		-F "status=2" \
		-F "notify=1" \
		-F "manadatory=1" \
		-H "X-HockeyAppToken: $HOCKEY_TOKEN" \
		https://rink.hockeyapp.net/api/2/apps/upload \
		&& echo -e '\n\ngreat job.';
else
	echo "not releasing '$LOCAL_VERSION' because it matches the published version.";
fi



