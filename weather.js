#!/usr/bin/env node

/**
  Create a command line NodeJs application to present 
  weather information for a given location
  
 */

const inquirer = require("inquirer");
const request = require("request");
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

			let apiResult = await sendRequest(url).catch(e => { console.log(e) });

			//console.log(apiResult);

			//If weather is definted in result, then we will return true
			if (typeof apiResult.weather !== "undefined") {
				console.log("Today's weather forcast for " + apiResult.name + " is '" + apiResult.weather[0].description + "' ");
				let lon = apiResult.coord.lon;
				let lat = apiResult.coord.lat;

				/** Now we get weather report for the 7 days
				 */
				url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&appid=" + apiKey;
				apiResult = await sendRequest(url).catch(e => { console.log(e) });

				if (typeof apiResult.daily === "object") {
					console.log("Weather forecast for the next 7 days");
					apiResult.daily.forEach(function(item, index) {
						var date = msToTime(item.sunrise);
						console.log("On " + date + " there is " + item.weather[0].description + " with the UV Index of " + item.uvi);
					});
				}
				
				//End the recursive function
				return true;
			} else {
				if (typeof apiResult.message != "undefined") {
					console.log('Cannot get the weather forecast for ' + answers.city + ' : ' + capitaliseWords(apiResult.message));
					//console.log();
				} else {
					console.log("Cannot find weather forcast for " + answers.city);
				}
			}

			getAnswers("Please enter another city");


		})
		.catch();
}

/**
   Function to send API request
 */
async function sendRequest(url) {
	return new Promise(function(resolve, reject) {
		request(url, function(error, response, body) {
			let apiResult = JSON.parse(body);
			if (!error) {
				resolve(apiResult);
			} else {
				reject(apiResult);
			}
		});
	});

}

//Date format with zero filled
function msToTime(duration) {
	let nowDate = new Date(duration * 1000);
	let date = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+('0' + nowDate.getDate()).slice(-2); 
	return date ;
}

//Capitalise the first letter of each word
function capitaliseWords(words) {
	var separateWord = words.toLowerCase().split(' ');
	for (var i = 0; i < separateWord.length; i++) {
		separateWord[i] = separateWord[i].charAt(0).toUpperCase() +
			separateWord[i].substring(1);
	}
	return separateWord.join(' ');
}

//Call the main function
getAnswers()
	.catch(error => { throw error });



