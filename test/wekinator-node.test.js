const Wekinator = require('../index.js');

test('exports something', function() {
  expect(Wekinator).not.toBeNull();
});

test('exports the right functions', function() {
  expect(Object.keys(Wekinator.prototype).sort()).toEqual([
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
  const functions = Object.keys(Wekinator.prototype)
    .map(a => Wekinator.prototype[a])
    .forEach(f => expect(f).toThrow());
});

test.skip('Constructor', function() {
  const functions = Object.keys(Wekinator.prototype)
    .filter(f => !['connect'].includes(f))
    .map(a => Wekinator.prototype[a])
    // .forEach(f => expect(f).toThrow());
    .forEach(f => {
      try { f() } catch(e) { console.log(e.message) }
    });
});

test('on function appears after connect', function() {
  expect(Wekinator.prototype).not.toHaveProperty('on');
  const wn = new Wekinator();
  expect(Wekinator.prototype).not.toHaveProperty('on');
  wn.connect(() => {
    expect(typeof wn.on).toBe('function');
  });
  wn.disconnect();
});

test('connect function requires a callback', function() {
  const wn = new Wekinator();
  expect(wn.connect).toThrowError("callback is not a function");
  wn.disconnect()
});
