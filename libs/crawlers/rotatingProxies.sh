#!/bin/bash

# this script assume that you are using nordvpn. If you are using other vpn provider, you have to write your own
countries=(Albania Chile Georgia Israel New_Zealand Slovenia Ukraine Argentina Costa_Rica Germany Italy North_Macedonia South_Africa United_Kingdom Australia Croatia Greece Japan Norway South_Korea United_States Austria Cyprus Hong_Kong Latvia Poland Spain Vietnam Belgium Czech_Republic Hungary Luxembourg Portugal Sweden Bosnia_And_Herzegovina	Denmark Iceland Malaysia Romania Switzerland Brazil Estonia India Mexico Serbia Taiwan Bulgaria Finland Indonesia Moldova Singapore Thailand Canada France Ireland Netherlands Slovakia Turkey)
index=0
len=${#countries[@]}
interval_sec=600

while true
do
    echo ${countries[index]};
    nordvpn connect ${countries[index]}
    index=$((($index+1)%$len));
    sleep $interval_sec;
done