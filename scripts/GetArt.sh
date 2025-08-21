#!/bin/bash

url="$(playerctl -p spotify metadata mpris:artUrl)"

namePrefix="/com/spotify/track/"
fullName="$(playerctl -p spotify metadata mpris:trackid)"
name=${fullName#"$namePrefix"}

image_path="/tmp/${name}.jpg"

if [ ! -f "$image_path" ]; then
	curl -s $url > $image_path
	echo $image_path
else
	echo $image_path
fi

