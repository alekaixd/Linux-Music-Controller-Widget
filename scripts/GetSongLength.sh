#!/bin/bash

length_us=$(playerctl -p spotify metadata mpris:length)

length_s=$(echo "scale=0; $length_us / 1000000" | bc)

echo $length_s
