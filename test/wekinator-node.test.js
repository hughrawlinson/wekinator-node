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
  oscMock.UDPPort.prototype.close.mockReset();
});

test('exports something', function() {
  expect(Wekinator).not.toBeNull();
});

test('exports the right functions', function() {
  expect(Object.getOwnPropertyNames(Wekinator.prototype).sort()).toEqual([
    "cancelTrain",
    "close",
    "connect",
    "constructor",
    "deleteAllExamples",
    "disableModelRecording",
    "disableModelRunning",
    "disconnect",
    "enableModelRecording",
    "enableModelRunning",
    "inputs",
    "on",
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
  const wn = new Wekinator();
  wn.connect(() => {
    expect(Wekinator.prototype).toHaveProperty('on');
    expect(typeof wn.on).toBe('function');
  });
  wn.disconnect();
});

test('connect function requires a callback', function() {
  const wn = new Wekinator();
  expect(() => wn.connect()).toThrowError("callback is not a function");
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
      address: "/wekinator/control/stopRecording"
    });
    expect(oscMock.UDPPort.prototype.send.mock.calls[2][0]).toEqual({
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
    wn.selectInputsForOutput(0,[1,2,3]);
    expect(oscMock.UDPPort.prototype.send.mock.calls[0][0]).toEqual({
      address: "/wekinator/control/selectInputsForOutput",
      args: [0,1,2,3]
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

test("disconnect and close call close on port after timeout", function (done) {
  jest.useFakeTimers();

  const disconnectCallback = jest.fn();

  const wn = new Wekinator();
  wn.connect(() => {
    wn.disconnect(disconnectCallback);
  });

  jest.runAllTimers();

  expect(disconnectCallback).toHaveBeenCalledTimes(1);
  expect(oscMock.UDPPort.prototype.close).toHaveBeenCalledTimes(1);
  done();
});

/*
 * It's no longer considered best practice to spy on setTimeout so I guess this
 * type of test isn't best practice anymore :yikes:
 */
test.skip("disconnect and close call close on port after timeout without callback", function () {
  jest.useFakeTimers();

  const wn = new Wekinator();
  wn.connect(() => {
    wn.disconnect();

    jest.runOnlyPendingTimers();

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout.mock.calls[0][1]).toEqual(10);
    expect(oscMock.UDPPort.prototype.close).toHaveBeenCalledTimes(1);
  });
});

test('close is an alias for disconnect', function() {
  expect(Wekinator.prototype.close).toBe(Wekinator.prototype.disconnect);
});

test('All methods are covered by method tests', function() {
  expect(Object.getOwnPropertyNames(Wekinator.prototype).sort()).toEqual(
    noArgFunctions.concat(listArgFunctions).concat([
      'startDtwRecording',
      'trainOnData',
      'selectInputsForOutput',
      'on',
      'disconnect',
      'close',
      'connect',
      'constructor'
    ]).sort()
  );
});

test('connect correctly opens an OSC port', function() {
  oscMock.UDPPort.prototype.open.mockReset();

  const wn = new Wekinator();

  wn.connect(() => {
    expect(oscMock.UDPPort.mock.calls[0][0]).toStrictEqual({
      localAddress: "0.0.0.0",
      localPort: 12000,
      remoteAddress: "127.0.0.1",
      remotePort: 6448
    });
    expect(oscMock.UDPPort.prototype.open).toHaveBeenCalledTimes(1);

    expect(Wekinator.prototype.on).toBeDefined();
    expect(typeof Wekinator.prototype.on).toBe('function');
  });
});

test('sending a message before opening a connection throws an error', function() {
  const wn = new Wekinator();

  expect(() => wn.startRecording()).toThrow();
});
