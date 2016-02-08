(function(){
  var osc = require('osc');
  var assert = require('assert');
  var self;
  wekinatorNode = function(wekinatorHost, wekinatorPort, localPort){
    self = this;
    self.host = wekinatorHost || '0.0.0.0';
    self.port = wekinatorPort || 6448;
    self.localPort = localPort || 6449;
    self.endpoint = '/wekinator';
    self.controlEndpoint = self.endpoint+'/control';
    self.WekaPort = {};
    self.WekaPort.send = function(){
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
    callback();
  };
  wekinatorNode.prototype.disconnect = function(){
    self.WekaPort.close();
  };
  wekinatorNode.prototype.inputs = function(floats){
    assert(Array.isArray(floats));
    var address = '/inputs';
    self.WekaPort.send({
      address: self.endpoint+address,
      args: floats
    }, self.host, self.port);
  };
  wekinatorNode.prototype.outputs = function(floats){
    assert(Array.isArray(floats));
    var address = '/outputs';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: floats
    }, self.host, self.port);
  };
  wekinatorNode.prototype.startRecording = function(){
    var address = '/startRecording';
    self.WekaPort.send({
      address: self.controlEndpoint+address
    }, self.host, self.port);
  };
  wekinatorNode.prototype.stopRecording = function(){
    var address = '/stopRecording';
    self.WekaPort.send({
      address: self.controlEndpoint+address
    }, self.host, self.port);
  };
  wekinatorNode.prototype.startDtwRecording = function(number){
    assert(typeof number === 'number');
    var address = '/startDtwRecording';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: number
    }, self.host, self.port);
  };
  wekinatorNode.prototype.stopDtwRecording = function(){
    var address = '/stopDtwRecording';
    self.WekaPort.send({
      address: self.controlEndpoint+address
    }, self.host, self.port);
  };
  wekinatorNode.prototype.train = function(){
    var address = '/train';
    self.WekaPort.send({
      address: self.controlEndpoint+address
    }, self.host, self.port);
  };
  wekinatorNode.prototype.cancelTrain = function(){
    var address = '/cancelTrain';
    self.WekaPort.send({
      address: self.controlEndpoint+address
    }, self.host, self.port);
  };
  wekinatorNode.prototype.startRunning = function(){
    var address = '/startRunning';
    self.WekaPort.send({
      address: self.controlEndpoint+address
    }, self.host, self.port);
  };
  wekinatorNode.prototype.stopRunning = function(){
    var address = '/stopRunning';
    self.WekaPort.send({
      address: self.controlEndpoint+address
    }, self.host, self.port);
  };
  wekinatorNode.prototype.deleteAllExamples = function(){
    var address = '/deleteAllExamples';
    self.WekaPort.send({
      address: self.controlEndpoint+address
    }, self.host, self.port);
  };
  wekinatorNode.prototype.enableModelRunning = function(ints){
    assert(Array.isArray(ints));
    var address = '/enableModelRunning';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: ints
    }, self.host, self.port);
  };
  wekinatorNode.prototype.disableModelRunning = function(ints){
    assert(Array.isArray(ints));
    var address = '/disableModelRunning';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: ints
    }, self.host, self.port);
  };
  wekinatorNode.prototype.enableModelRecording = function(ints){
    assert(Array.isArray(ints));
    var address = '/enableModelRecording';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: ints
    }, self.host, self.port);
  };
  wekinatorNode.prototype.disableModelRecording = function(ints){
    assert(Array.isArray(ints));
    var address = '/disableModelRecording';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: ints
    }, self.host, self.port);
  };
  wekinatorNode.prototype.setInputNames = function(names){
    assert(Array.isArray(names));
    var address = '/setInputNames';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: names
    }, self.host, self.port);
  };
  wekinatorNode.prototype.setOutputNames = function(names){
    assert(Array.isArray(names));
    var address = '/setOutputNames';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: names
    }, self.host, self.port);
  };
  wekinatorNode.prototype.selectInputsForOutput = function(output, inputs){
    assert(Array.isArray(inputs) && typeof output === 'number');
    var address = '/selectInputsForOutput';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: inputs.unshift(output)
    }, self.host, self.port);
  };
  module.exports = wekinatorNode;
})();
