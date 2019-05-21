const wn = require('../index.js');

test('exports something', function() {
  expect(wn).not.toBeNull();
});

test('exports the right functions', function() {
  expect(Object.keys(wn.prototype).sort()).toEqual([
    "cancelTrain",
    "close",
    "connect",
    "deleteAllExamples",
    "disableModelRecording",
    "disableModelRunning",
    "disconnect",
    "enableModelRecording",
    "enableModelRunning",
    "inputs",
    "outputs",
    "selectInputsForOutput",
    "setInputNames",
    "setOutputNames",
    "startDtwRecording",
    "startRecording",
    "startRunning",
    "stopDtwRecording",
    "stopRecording",
    "stopRunning",
    "train",
    "trainOnData"
  ]);
});

test('All functions error if called before connect', function() {
  const functions = Object.keys(wn.prototype)
    .map(a => wn.prototype[a])
    .forEach(f => expect(f).toThrow());
});
