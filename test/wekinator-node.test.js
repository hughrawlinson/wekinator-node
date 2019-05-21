const Wekinator = require('../index.js');
const oscMock = require('osc');

const noArgFunctions = [
  'startRecording',
  'stopRecording',
  'stopDtwRecording',
  'train',
  'cancelTrain',
  'startRunning',
  'stopRunning',
  'deleteAllExamples'
];

const listArgFunctions = [
  'inputs',
  'outputs',
  'enableModelRecording',
  'disableModelRecording',
  'enableModelRunning',
  'disableModelRunning',
  'setInputNames',
  'setOutputNames',
]

afterEach(() => {
  oscMock.UDPPort.mockReset();
  oscMock.UDPPort.prototype.send.mockReset();
});

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

test('constructor doesn\'t open an OSC port', function() {
  const wn = new Wekinator();

  expect(oscMock.UDPPort.mock.calls).toHaveLength(0);
});

test('connect method opens a UDP port with default creds', function() {
  const wn = new Wekinator();

  wn.connect(() => {
    expect(oscMock.UDPPort.mock.calls).toHaveLength[1];
    expect(oscMock.UDPPort.mock.calls[0][0]).toEqual({
      localAddress: "0.0.0.0",
      localPort: 12000,
      remoteAddress: "127.0.0.1",
      remotePort: 6448
    });
  });
});

test('constructor allows setting other weka server config', function() {
  const wekinatorHost = '192.168.0.50';
  const wekinatorPort = 8081;
  const localPort = 8080;
  const wn = new Wekinator(wekinatorHost, wekinatorPort, localPort);

  wn.connect(() => {
    expect(oscMock.UDPPort.mock.calls).toHaveLength[1];
    expect(oscMock.UDPPort.mock.calls[0][0]).toEqual({
      localAddress: "0.0.0.0",
      localPort: localPort,
      remoteAddress: wekinatorHost,
      remotePort: wekinatorPort
    });
  });
});

test('API sends correct OSC messages for nonparam calls', () => {
  const wn = new Wekinator();

  wn.connect(() => {
    noArgFunctions.forEach((f, i) => {
      wn[f]();
      expect(oscMock.UDPPort.prototype.send.mock.calls[i][0]).toEqual({
        address: `/wekinator/control/${f}`
      });
    });
  });
});

test('API sends correct OSC messages for list param calls', () => {
  const wn = new Wekinator();

  wn.connect(() => {
    listArgFunctions.forEach((f, i) => {
      wn[f]([]);
      expect(oscMock.UDPPort.prototype.send.mock.calls[i][0]).toEqual({
        // address: `/wekinator/control/${f}`
        address: 'inputs' === f ? `/wek/${f}` : `/wekinator/control/${f}`,
        args: []
      });
    });
  });
});

test.skip('All methods are covered by method tests', function() {
  expect(Object.keys(Wekinator.prototype)).toEqual(
    noArgFunctions.concat(listArgFunctions)
  );
});
