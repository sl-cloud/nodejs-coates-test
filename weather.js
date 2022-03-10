#!/usr/bin/env node

/**
  Create a command line NodeJs application to present 
  weather information for a given location
  
  version 1.0.1
  In this version axios is used instead of request
  
  version 1.0.2
  Added output formatting
  
  version 1.0.3
  Added additional reports
  
  DOCKER
  docker pull coderstevelee/nodejs-coates-image 
  docker run -dit --name nodeTest coderstevelee/nodejs-coates-image
  docker exec -it nodeTest sh OR docker exec -it nodeTest /home/node/app/weather.js
 */

const inquirer = require("inquirer");
const axios = require("axios");
const chalk = require("chalk");
const table = require('cli-table');
const apiKey = 'd604ab25a953daf809733b2a1a112efc';

/**
	getAnswers function to interact with user in CLI
	This is a recursive function and will loop until a city with the correct reply is provided
	
	@param STRING message - the message to display on the interactive CLI
 */
async function getAnswers(message) {
	if (typeof message === "undefined") {
		//Default prompt
		message = "Please enter a city";
	}

	await inquirer
		.prompt([
			{
				type: 'input',
				name: 'city',
				message: message
			},
		])
		.then(async (answers) => {
			//We will query Open Weather Map once a user returns an input
			let url = "http://api.openweathermap.org/data/2.5/weather?units=metric&q=" + answers.city + "&appid=" + apiKey;
			let repeat = 1;

			//Fetch the weather report
			axios.get(url)
				.then(function(response) {
					// handle success
					console.log(chalk.white("\nToday at " + chalk.blue.bold(response.data.name) + " the weather has forecasts to have " + chalk.blue.bold(response.data.weather[0].description) + " "));
					console.log(chalk.white("\nThe current temperature is " + formatTemp(response.data.main.temp) + ' but it actually feels like ' + formatTemp(response.data.main.feels_like) + ' with high/low of ' + formatTemp(response.data.main.temp_min) + '/' + formatTemp(response.data.main.temp_max)));
					console.log(chalk.white("\nHumidity is " + chalk.blue.bold(response.data.main.humidity + '%') + ' with wind speed of ' + chalk.blue.bold(response.data.wind.speed + ' meter/second')));
					console.log(chalk.white("\nThe sun rises at " + chalk.blue.bold(msToTime(response.data.sys.sunrise)) + ' and sets at ' + chalk.blue.bold(msToTime(response.data.sys.sunset))));
					let lon = response.data.coord.lon;
					let lat = response.data.coord.lat;

					// Now we get weather report for the 7 days
					url = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&appid=" + apiKey;
					axios.get(url)
						.then(function(response) {
							// handle success
							if (typeof response.data.daily === "object") {
								console.log(chalk.yellow.bold("\nWeather forecast for the next 7 days"));
								
								// instantiate table
								let t = new table({
									head: ['Date', 'Forecast', 'UV Index', 'Temp Low', 'Temp High', 'Sunrise', 'Sunset']
									, colWidths: [20, 20, 10, 12, 12, 12, 12]
								});

								response.data.daily.forEach(function(item, index) {
									let date = msToDate(item.sunrise);
									let forecast = capitaliseWords(item.weather[0].description);
									let temp_min = formatTemp(item.temp.min);
									let temp_max = formatTemp(item.temp.max);
									let sunrise = msToTime(item.sunrise);
									let sunset = msToTime(item.sunset);

									t.push(
										[date, forecast, item.uvi, temp_min, temp_max, sunrise, sunset]
									);
								});
								console.log(t.toString());
							}
						})
						.catch(function(error) {
							// handle error
							console.log(error);
						})
						.then(function() {

						});


					//End the recursive function
					repeat = 0;
				})
				.catch(function(error) {
					// handle error
					console.log(error);
					console.log(chalk.bgRed.white("\nCannot get the weather forecast for " + answers.city + " : " + capitaliseWords(error.response.data.message)));

				})
				.then(function() {
					if (repeat) {
						//We will ask the user for input again
						getAnswers("Please enter another city");
					}

				});
		})
		.catch(function(error) {
			console.log(error)
		});
}

//Date format with zero filled
function msToDate(timestamp) {
	let sydneyTime = new Date(timestamp * 1000).toLocaleString("en-US", {timeZone: "Australia/Sydney"});
	let initDate = new Date(sydneyTime);
	let date = initDate.getFullYear() + '/' + ('0' + (initDate.getMonth() + 1)).slice(-2) + '/' + ('0' + initDate.getDate()).slice(-2);
	return date;
}

//Time format with zero filled
function msToTime(timestamp) {
	let sydneyTime = new Date(timestamp * 1000).toLocaleString("en-US", {timeZone: "Australia/Sydney"});
	let initDate = new Date(sydneyTime);
	let date = ('0' + (initDate.getHours() + 1)).slice(-2) + ':' + ('0' + (initDate.getMinutes() + 1)).slice(-2);
	return date;
}

//Format Temp
function formatTemp(temp) {
	return chalk.blue.bold(temp + String.fromCharCode(176));
}


//Capitalise the first letter of each word
function capitaliseWords(words) {
	let separateWord = words.toLowerCase().split(' ');
	for (var i = 0; i < separateWord.length; i++) {
		separateWord[i] = separateWord[i].charAt(0).toUpperCase() +
			separateWord[i].substring(1);
	}
	return separateWord.join(' ');
}

//Call the main function
getAnswers()
	.catch(function(error) {
		console.log(error);
	});



