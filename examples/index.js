#!/usr/bin/env node

// A closure to let us use `let`. Don't worry if you don't understand it.
(function(){
	'use strict';
	var Wekinator = require('wekinator');
	var repl = require("repl");

	// You can pass a host and ports here, but WekinatorJS knows the defaults
	var wn = new Wekinator();

	// Connect to Wekinator
	wn.connect(function(){
		// Register a handler for messages from Wekinator
		wn.on("osc", function(a){
			// When we recieve a message from Wekinator, log it
			console.log(a);
		});
		// Make some data to train on
		var data = [];
		for(let i = 0; i < 5; i++){
			data.push({
				inputs:[i/5],
				outputs:[0.8-i/5]
			});
		}
		// Send the data to Wekinator for training
		wn.trainOnData(data);
		// Delay running to wait for training
		setTimeout(function(){
			// Start running our model
			wn.startRunning();
			for(let i = 0; i < 5; i++){
				// Send an input to Wekinator so we get sent an output
				wn.inputs([i/5]);
			}
			// Once the inputs are sent, stop running the model
			wn.stopRunning();
			// Close our socket connection to Wekinator
			wn.disconnect();
		}, 200);
	});
})();
