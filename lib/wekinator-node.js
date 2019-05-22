(function(){
  var osc = require('osc');
  var assert = require('assert');
  var self;
  wekinatorNode = function(wekinatorHost, wekinatorPort, localPort){
    self = this;
    self.host = wekinatorHost || '127.0.0.1';
    self.port = wekinatorPort || 6448;
    self.localPort = localPort || 12000;
    self.endpoint = '/wekinator';
    self.controlEndpoint = self.endpoint+'/control';
    self.WekaPort = {};
    self.WekaPort.send = self.queuePush = function(){
      throw new Error('Not connected to Wekinator. Please call `.connect()`');
    };
  };
  wekinatorNode.prototype.connect = function (callback) {
    self.WekaPort = new osc.UDPPort({
      localAddress: '0.0.0.0',
      localPort: self.localPort,
      remoteAddress: self.host,
      remotePort: self.port
    });
    self.WekaPort.open();
    self.queue = [];

    wekinatorNode.prototype.on = function(message,handler){
      self.WekaPort.on(message,handler);
    };

    self.queuePush = function(obj){
      self.queue.push(obj);
      self.queueExec();
    };

    self.queueExec = function(){
      if (self.queue.length>0) {
        if(typeof self.queue[0] == "function"){
          self.queue.shift()();
        }
        else {
          self.WekaPort.send(self.queue.shift(),self.host,self.port);
        }
        if(self.queue.length>0){
          self.queueExec();
        }
      }
    };
    callback();
  };
  wekinatorNode.prototype.disconnect = function(callback){
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
  wekinatorNode.prototype.close = wekinatorNode.prototype.disconnect;
  wekinatorNode.prototype.inputs = function(floats){
    assert(Array.isArray(floats));
    var address = '/wek/inputs';
    self.queuePush({
      address: address,
      args: floats
    });
  };
  wekinatorNode.prototype.outputs = function(floats){
    assert(Array.isArray(floats));
    var address = '/outputs';
    self.queuePush({
      address: self.controlEndpoint+address,
      args: floats
    });
  };
  wekinatorNode.prototype.startRecording = function(){
    var address = '/startRecording';
    self.queuePush({
      address: self.controlEndpoint+address
    });
  };
  wekinatorNode.prototype.stopRecording = function(){
    var address = '/stopRecording';
    self.queuePush({
      address: self.controlEndpoint+address
    });
  };
  wekinatorNode.prototype.startDtwRecording = function(number){
    assert(typeof number === 'number');
    var address = '/startDtwRecording';
    self.queuePush({
      address: self.controlEndpoint+address,
      args: number
    });
  };
  wekinatorNode.prototype.stopDtwRecording = function(){
    var address = '/stopDtwRecording';
    self.queuePush({
      address: self.controlEndpoint+address
    });
  };
  wekinatorNode.prototype.train = function(){
    var address = '/train';
    self.queuePush({
      address: self.controlEndpoint+address
    });
  };
  wekinatorNode.prototype.cancelTrain = function(){
    var address = '/cancelTrain';
    self.queuePush({
      address: self.controlEndpoint+address
    });
  };
  wekinatorNode.prototype.startRunning = function(){
    var address = '/startRunning';
    self.queuePush({
      address: self.controlEndpoint+address
    });
  };
  wekinatorNode.prototype.stopRunning = function(){
    var address = '/stopRunning';
    self.queuePush({
      address: self.controlEndpoint+address
    });
  };
  wekinatorNode.prototype.deleteAllExamples = function(){
    var address = '/deleteAllExamples';
    self.queuePush({
      address: self.controlEndpoint+address
    });
  };
  wekinatorNode.prototype.enableModelRunning = function(ints){
    assert(Array.isArray(ints));
    var address = '/enableModelRunning';
    self.queuePush({
      address: self.controlEndpoint+address,
      args: ints
    });
  };
  wekinatorNode.prototype.disableModelRunning = function(ints){
    assert(Array.isArray(ints));
    var address = '/disableModelRunning';
    self.queuePush({
      address: self.controlEndpoint+address,
      args: ints
    });
  };
  wekinatorNode.prototype.enableModelRecording = function(ints){
    assert(Array.isArray(ints));
    var address = '/enableModelRecording';
    self.queuePush({
      address: self.controlEndpoint+address,
      args: ints
    });
  };
  wekinatorNode.prototype.disableModelRecording = function(ints){
    assert(Array.isArray(ints));
    var address = '/disableModelRecording';
    self.queuePush({
      address: self.controlEndpoint+address,
      args: ints
    });
  };
  wekinatorNode.prototype.setInputNames = function(names){
    assert(Array.isArray(names));
    var address = '/setInputNames';
    self.queuePush({
      address: self.controlEndpoint+address,
      args: names
    });
  };
  wekinatorNode.prototype.setOutputNames = function(names){
    assert(Array.isArray(names));
    var address = '/setOutputNames';
    self.queuePush({
      address: self.controlEndpoint+address,
      args: names
    });
  };
  wekinatorNode.prototype.selectInputsForOutput = function(output, inputs){
    assert(Array.isArray(inputs) && typeof output === 'number');
    var address = '/selectInputsForOutput';
    self.queuePush({
      address: self.controlEndpoint+address,
      args: inputs.unshift(output)
    });
  };
  wekinatorNode.prototype.trainOnData = function(data){
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
  module.exports = wekinatorNode;
})();
