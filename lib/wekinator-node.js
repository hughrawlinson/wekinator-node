(function(){
  var osc = require('osc');
  var assert = require('assert');

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
      this.host = wekinatorHost || '127.0.0.1';
      this.port = wekinatorPort || 6448;
      this.localPort = localPort || 12000;
      this.endpoint = '/wekinator';
      this.controlEndpoint = this.endpoint+'/control';
      this.queue = [];
      this.WekaPort = {};
      this.WekaPort.send = this.WekaPort.on = this.queuePush = function(){
        throw new Error('Not connected to Wekinator. Please call `.connect()`');
      };
    }

    connect (callback) {
      this.WekaPort = new osc.UDPPort({
        localAddress: '0.0.0.0',
        localPort: this.localPort,
        remoteAddress: this.host,
        remotePort: this.port
      });
      this.WekaPort.open();

      this.queuePush = function(obj){
        this.queue.push(obj);
        this.queueExec();
      };

      this.queueExec = function(){
        if(typeof this.queue[0] == "function"){
          this.queue.shift()();
        }
        else {
          this.WekaPort.send(this.queue.shift(),this.host,this.port);
        }
      };
      callback();
    };

    on (message, handler){
      this.WekaPort.on(message, handler);
    };

    disconnect (callback) {
      this.queuePush(() => {
        // I'm so sorry, this is such a hack. It seems to reliably work though.
        setTimeout(() => {
          this.WekaPort.close();
          if (typeof callback === 'function') {
            callback();
          }
        },10+5*this.queue.length);
      });
    };

    inputs (floats) {
      assert(Array.isArray(floats));
      var address = '/wek/inputs';
      this.queuePush({
        address: address,
        args: floats
      });
    };

    selectInputsForOutput (output, inputs) {
      assert(Array.isArray(inputs) && typeof output === 'number');
      var address = '/selectInputsForOutput';
      this.queuePush({
        address: this.controlEndpoint+address,
        args: [output].concat(inputs)
      });
    };

    trainOnData (data) {
      this.startRecording();
      for(var i = 0; i < data.length; i++){
        // We're not *too* worried about the input arriving before the output
        // because we handle queueing internally.
        this.outputs(data[i].outputs);
        this.inputs(data[i].inputs);
      }
      this.stopRecording();
      this.train();
    };
  }

  Wekinator.prototype.close = Wekinator.prototype.disconnect;

  Object.entries(methodsToArgValidation).forEach(function ([key, validation]) {
    Wekinator.prototype[key] = function(arg) {
      validation && validation(arg);
      this.queuePush(Object.assign({
        address: `${this.controlEndpoint}/${key}`,
      }, arg !== undefined ? {args: arg} : null));
    }
  });

  module.exports = Wekinator;
})();
