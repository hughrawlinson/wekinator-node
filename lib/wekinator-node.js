(function(){
  var osc = require('osc');
  var assert = require('assert');
  var self;

  var arrayIntsValidation = arrayFloatsValidation = arrayStringsValidation =
    arg => assert(Array.isArray(arg));
  var numberValidation = number => assert(typeof number === "number");

  var methodsToArgValidation = {
    outputs: arrayFloatsValidation,
    startRecording: null,
    stopRecording: null,
    startDtwRecording: numberValidation,
    stopDtwRecording: null,
    train: null,
    cancelTrain: null,
    startRunning: null,
    stopRunning: null,
    deleteAllExamples: null,
    enableModelRunning: arrayIntsValidation,
    disableModelRunning: arrayIntsValidation,
    enableModelRecording: arrayIntsValidation,
    disableModelRecording: arrayIntsValidation,
    setInputNames: arrayStringsValidation,
    setOutputNames: arrayStringsValidation,
  };

  class Wekinator {
    constructor(wekinatorHost, wekinatorPort, localPort) {
      self = this;
      self.host = wekinatorHost || '127.0.0.1';
      self.port = wekinatorPort || 6448;
      self.localPort = localPort || 12000;
      self.endpoint = '/wekinator';
      self.controlEndpoint = self.endpoint+'/control';
      self.WekaPort = {};
      self.WekaPort.send = self.WekaPort.on = self.queuePush = function(){
        throw new Error('Not connected to Wekinator. Please call `.connect()`');
      };
    }

    connect (callback) {
      self.WekaPort = new osc.UDPPort({
        localAddress: '0.0.0.0',
        localPort: self.localPort,
        remoteAddress: self.host,
        remotePort: self.port
      });
      self.WekaPort.open();
      self.queue = [];

      self.queuePush = function(obj){
        self.queue.push(obj);
        self.queueExec();
      };

      self.queueExec = function(){
        if(typeof self.queue[0] == "function"){
          self.queue.shift()();
        }
        else {
          self.WekaPort.send(self.queue.shift(),self.host,self.port);
        }
      };
      callback();
    };

    on (message, handler){
      self.WekaPort.on(message, handler);
    };

    disconnect (callback) {
      self.queuePush(function(){
        // I'm so sorry, this is such a hack. It seems to reliably work though.
        setTimeout(function(){
          self.WekaPort.close();
          if (typeof callback === 'function') {
            callback();
          }
        },10+5*self.queue.length);
      });
    };

    inputs (floats) {
      assert(Array.isArray(floats));
      var address = '/wek/inputs';
      self.queuePush({
        address: address,
        args: floats
      });
    };

    selectInputsForOutput (output, inputs) {
      assert(Array.isArray(inputs) && typeof output === 'number');
      var address = '/selectInputsForOutput';
      self.queuePush({
        address: self.controlEndpoint+address,
        args: [output].concat(inputs)
      });
    };

    trainOnData (data) {
      self.startRecording();
      for(var i = 0; i < data.length; i++){
        // We're not *too* worried about the input arriving before the output
        // because we handle queueing internally.
        self.outputs(data[i].outputs);
        self.inputs(data[i].inputs);
      }
      self.stopRecording();
      self.train();
    };
  }

  Wekinator.prototype.close = Wekinator.prototype.disconnect;

  Object.entries(methodsToArgValidation).forEach(([key, validation]) => {
    Wekinator.prototype[key] = function(arg) {
      validation && validation(arg);
      self.queuePush({
        address: `${self.controlEndpoint}/${key}`,
        args: arg
      });
    }
  });

  module.exports = Wekinator;
})();
