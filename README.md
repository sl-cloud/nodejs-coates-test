# nodejs-coates-test
https://github.com/CooderSteve/nodejs-coates-test

This cli application developed using:

node v12.20.0
npm 6.14.8

Version 1.0.1, axios is used instead of request

Version 1.0.2, added output formatting


Unfortunately during development I tried to downgrade my home development environment from node v12.20.0
to node 8 which caused some issues and wasted some of my time so I decided to do this script using node v12.

Also originally I was using simple functions and decided to use aysnc functions when more than 1 day 
of forecast was required.

The coding part took approximately 4 hours as I have never done a CLI APP using NodeJS before and needed
to find the right library for it

Moving this into Docker for easy installation

To Run:

docker pull coderstevelee/nodejs-coates-image

docker run -dit --name nodeTest coderstevelee/nodejs-coates-image

docker exec -it nodeTest sh OR docker exec -it nodeTest /home/node/app/weather.js
