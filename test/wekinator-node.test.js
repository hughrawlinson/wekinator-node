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
        address: 'inputs' === f ? `/wek/${f}` : `/wekinator/control/${f}`,
        args: []
      });
    });
  });
});

test('API throws errors when params are incorrect', () => {
  const wn = new Wekinator();

  wn.connect(() => {
    listArgFunctions.forEach((f, i) => {
      expect(() => {
        wn[f]();
      }).toThrow();
    });
  });
});

test('startDtwRecording sends correct OSC message', function() {
  const wn = new Wekinator();

  wn.connect(() => {
    wn.startDtwRecording(0)
    expect(oscMock.UDPPort.prototype.send.mock.calls[0][0]).toEqual({
      address: '/wekinator/control/startDtwRecording',
      args: 0
    });
    wn.startDtwRecording(1)
    expect(oscMock.UDPPort.prototype.send.mock.calls[1][0]).toEqual({
      address: '/wekinator/control/startDtwRecording',
      args: 1
    });
    // Calling without an arg throws
    expect(wn.startDtwRecording).toThrow()
  });
});

test('trainOnData sends correct OSC message', function() {
  const wn = new Wekinator();

  wn.connect(() => {
    expect(wn.trainOnData).toThrow();
    wn.trainOnData([])
    expect(oscMock.UDPPort.prototype.send.mock.calls[0][0]).toEqual({
      address: "/wekinator/control/startRecording"
    });
    expect(oscMock.UDPPort.prototype.send.mock.calls[1][0]).toEqual({
      address: "/wekinator/control/startRecording"
    });
    expect(oscMock.UDPPort.prototype.send.mock.calls[2][0]).toEqual({
      address: "/wekinator/control/stopRecording"
    });
    expect(oscMock.UDPPort.prototype.send.mock.calls[3][0]).toEqual({
      address: "/wekinator/control/train"
    });
    oscMock.UDPPort.prototype.send.mockReset();
    expect(() => wn.trainOnData(['this is a string'])).toThrow();
    expect(() => wn.trainOnData([0.01, 0.02])).toThrow();
    oscMock.UDPPort.prototype.send.mockReset();
    wn.trainOnData([{inputs:[0.01, 0.02], outputs:[0.99, 0.98]}]);
    expect(oscMock.UDPPort.prototype.send.mock.calls[0][0]).toEqual({
      address: "/wekinator/control/startRecording"
    });
    expect(oscMock.UDPPort.prototype.send.mock.calls[1][0]).toEqual({
      address: "/wekinator/control/outputs",
      args: [0.99, 0.98]
    });
    expect(oscMock.UDPPort.prototype.send.mock.calls[2][0]).toEqual({
      address: "/wek/inputs",
      args: [0.01, 0.02]
    });
    expect(oscMock.UDPPort.prototype.send.mock.calls[3][0]).toEqual({
      address: "/wekinator/control/stopRecording"
    });
    expect(oscMock.UDPPort.prototype.send.mock.calls[4][0]).toEqual({
      address: "/wekinator/control/train"
    });
    expect(oscMock.UDPPort.prototype.send.mock.calls[5])
      .toBe(undefined);
  });
});

test('selectInputsForOutput sends correct OSC message', function() {
  const wn = new Wekinator();

  wn.connect(() => {
    expect(wn.selectInputsForOutput).toThrow();
    wn.selectInputsForOutput(0,[1,2,-3]);
    //TODO: I believe this arg is a bug, see #4
    expect(oscMock.UDPPort.prototype.send.mock.calls[0][0]).toEqual({
      address: "/wekinator/control/selectInputsForOutput",
      args: 4
    });
  });
});

test('on correctly registers a callback for OSC events', function() {
  const wn = new Wekinator();
  const callback = () => {};
  wn.connect(() => {
    wn.on(callback);
    expect(oscMock.UDPPort.prototype.on.mock.calls[0][0]).toBe(callback);
  });
});

test.skip('All methods are covered by method tests', function() {
  expect(Object.keys(Wekinator.prototype).sort()).toEqual(
    noArgFunctions.concat(listArgFunctions).concat([
      'startDtwRecording',
      'trainOnData',
      'selectInputsForOutput',
      'on'
    ]).sort()
  );
});

test('sending a message before opening a connection throws an error', function() {
  const wn = new Wekinator();
  // TODO: this should actually throw the error in the send function in the
  // constructor. It doesn't, because queuePush isn't defined at this point,
  // so that code is unreachable.
  expect(wn.startRecording).toThrow();
});
