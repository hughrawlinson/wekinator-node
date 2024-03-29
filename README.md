# wekinator-node

[![npm version](https://badge.fury.io/js/wekinator.svg)](https://badge.fury.io/js/wekinator)

An SDK to interface with [Wekinator](http://www.wekinator.org/), a system for users to build new interactive systems by demonstrating human actions and computer responses, over OSC.

## Usage

wekinator-node assumes that an instance of [Wekinator](http://www.wekinator.org/) is running. It communicates to the running instance of Wekinator via [OSC](https://en.wikipedia.org/wiki/Open_Sound_Control). By default it will use the default host and port, but these can be set via the constructor parameters `wekinatorHost` and `wekinatorPort`. Additionally, `localPort` can be specified to instruct Wekinator to send output messages [as documented](www.wekinator.org/detailed-instructions/Wekinator8217s_default_OSC_messages).

```javascript
var Wekinator = require("wekinator");
var wn = new Wekinator();
wn.connect(function () {
  wn.train();
  setTimeout(function () {
    wn.disconnect();
  }, 100);
});
```

Another example is available [here](https://github.com/hughrawlinson/wekinator-node/blob/master/examples/index.js).

## API

wekinator-node supports the Wekinator control messages [documented here](http://www.wekinator.org/detailed-instructions/#Controlling_Wekinator_via_OSC_messages) with the following Javascript method names.

<details>
  <summary>List of methods</summary>

- `WekinatorNode` \(constructor\) takes `wekinatorHost, wekinatorPort, localPort [optional]`
- `connect` takes a `callback`
  - Connects to Wekinator, calls the callback once it's done.
- `disconnect`
  - Closes the port to Wekinator
- `inputs` takes a list of `floats`, sets the inputs to them in order
  - Send Wekinator current input values to populate the boxes/sliders on its GUI. Attach one float per input, in order.
- `outputs` takes a list of `floats`, sets the outputs to them in order
  - Send Wekinator current output values to populate the boxes/sliders on its GUI. Attach one float per output, in order.
- `startRecording`
  - Start recording examples \(NOT used for dynamic time warping recording\)
- `stopRecording`
  - Stop recording examples \(NOT used for dynamic time warping recording\)
- `startDtwRecording` takes a `number`
  - Starts recording dynamic time warping examples for the gesture type given by the number \(gesture types are indexed starting from 1\)
- `stopDtwRecording`
  - Stops recording dynamic time warping examples \(no int required\)
- `train`
  - Train on current examples
- `cancelTrain`
  - Cancel current training \(if it’s in progress\)
- `startRunning`
  - Start running \(if possible\)
- `stopRunning`
  - Stop running \(if currently running\)
- `deleteAllExamples`
  - Delete all examples for all models
- `enableModelRunning` takes a list of `ints`
  - Enables running of all models whose indices are listed in the list of ints in the message. Model indices start with 1. This is equivalent to enabling the “play” button next to a model row.
- `disableModelRunning` takes a list of `ints`
  - Disables running of models with these indices. This is equivalent to disabling the “play” button next to a model row.
- `enableModelRecording` takes a list of `ints`
  - Enables recording of all models whose indices are listed in the list of ints in the message. Model indices start with 1. This is equivalent to enabling the “record” button next to a model row.
- `disableModelRecording` takes a list of `ints`
  - Disables recording of models with these indices. This is equivalent to disabling the “record” button next to a model row.
- `setInputNames` takes a list of `names`
  - Sets the Wekinator input names to those names, in order.
- `setOutputNames` takes a list of `names`
  - Sets the Wekinator output names to those names, in order.
- `selectInputsForOutput` takes `output, inputs`
  - Connects a list of inputs to a specific output.
- `trainOnData` takes a list of objects with the properties 'inputs' and 'outputs', each of which are arrays of floats like in `inputs` and `outputs`.
  
</details>
