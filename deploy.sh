#!/bin/bash
cd /srv/all-seeing-eye/
# Download latest deploy
wget https://drone.io/github.com/justinabrahms/all-seeing-eye/files/all-seeing-eye.tar.bz2 -O /srv/all-seeing-eye/all-seeing-eye.tgz -O /srv/all-seeing-eye/all-seeing-eye.tar.bz2
# Check it out
tar xjf all-seeing-eye.tar.bz2
# Determine the latest build number (eg the thing we just downloaded)
HIGHEST_BUILD_NUMBER=$(find .  -maxdepth 1 -name  "ase-*" | tr "./ase-" " " | sed "s/ //g" | sort -nr | head -n 1 )
# Update symlink to use it.
rm ase && ln -s $PWD/ase{-$HIGHEST_BUILD_NUMBER,}
sudo cp -r ase/deploy/all-seeing-eye.conf /etc/init/
sudo service all-seeing-eye restart
