#!/usr/bin/env node

/**
  Create a command line NodeJs application to present 
  weather information for a given location
  
  version 1.0.1
  In this version axios is used instead of request
  
  DOCKER
  docker pull coderstevelee/nodejs-coates-image 
  docker run -dit --name nodeTest coderstevelee/nodejs-coates-image
  docker exec -it nodeTest sh
 */

const inquirer = require("inquirer");
const axios = require("axios");
const chalk = require("chalk");
const table = require('cli-table');
const apiKey = 'd604ab25a953daf809733b2a1a112efc';

/**
	getAnswer function to interact with user in CLI
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
			let url = "http://api.openweathermap.org/data/2.5/weather?q=" + answers.city + "&appid=" + apiKey;
			let repeat = 1;

			//Fetch the weather report
			axios.get(url)
				.then(function(response) {
					// handle success
					console.log(chalk.white("\nToday's weather forcast for " + chalk.blue.bold(response.data.name) + " is '" + response.data.weather[0].description + "' "));
					let lon = response.data.coord.lon;
					let lat = response.data.coord.lat;

					// Now we get weather report for the 7 days
					url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&appid=" + apiKey;
					axios.get(url)
						.then(function(response) {
							// handle success
							if (typeof response.data.daily === "object") {
								console.log("\nWeather forecast for the next 7 days");
								
								// instantiate table
								let t = new table({
									head: ['Date', 'Forecast', 'UV Index']
									, colWidths: [20, 20, 10]
								});

								response.data.daily.forEach(function(item, index) {
									let date = msToTime(item.sunrise);

									t.push(
										[date, item.weather[0].description, item.uvi]
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
function msToTime(timestamp) {
	let formatDate = new Date(timestamp * 1000);
	let date = formatDate.getFullYear() + '/' + ('0' + (formatDate.getMonth() + 1)).slice(-2) + '/' + ('0' + formatDate.getDate()).slice(-2);
	return date;
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



