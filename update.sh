#!/bin/bash

git add .; git commit -m $1;
git push origin master;
npm publish;
sudo npm install -g -f jamr;
