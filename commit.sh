#!/bin/bash

git commit -am "$1" &&
git push heroku master &&
git push origin master