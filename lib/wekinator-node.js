(function(){
  var osc = require('osc');
  var assert = require('assert');
  wekinatorNode = function(wekinatorHost, wekinatorPort){
    var self = this;
    self.host = wekinatorHost;
    self.port = wekinatorPort;
    self.endpoint = '/wekinator';
    self.controlEndpoint = endpoint+'/control';
    self.wekaPort = {};
    self.wekaPort.send = function(){
      throw new Error('Not connected to Wekinator. Please call `.connect()`');
    };
  };
  wekinatorNode.prototype.connect = function () {
    self.WekaPort = new osc.UDPPort({
      localAddress: self.host,
      localPort: self.port
    });
  };
  wekinatorNode.prototype.inputs = function(floats){
    assert(Array.isArray(floats));
    var address = '/inputs';
    self.WekaPort.send({
      address: self.endpoint+address,
      args: floats
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.outputs = function(floats){
    assert(Array.isArray(floats));
    var address = '/outputs';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: floats
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.startRecording = function(){
    var address = '/startRecording';
    self.WekaPort.send({
      address: address
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.stopRecording = function(){
    var address = '/stopRecording';
    self.WekaPort.send({
      address: address
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.startDtwRecording = function(number){
    assert(typeof number === 'number');
    var address = '/startDtwRecording';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: number
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.stopDtwRecording = function(){
    var address = '/stopDtwRecording';
    self.WekaPort.send({
      address: address
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.train = function(){
    var address = '/train';
    self.WekaPort.send({
      address: address
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.cancelTrain = function(){
    var address = '/cancelTrain';
    self.WekaPort.send({
      address: address
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.startRunning = function(){
    var address = '/startRunning';
    self.WekaPort.send({
      address: address
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.stopRunning = function(){
    var address = '/stopRunning';
    self.WekaPort.send({
      address: address
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.deleteAllExamples = function(){
    var address = '/deleteAllExamples';
    self.WekaPort.send({
      address: address
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.enableModelRunning = function(ints){
    assert(Array.isArray(ints));
    var address = '/enableModelRunning';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: ints
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.disableModelRunning = function(ints){
    assert(Array.isArray(ints));
    var address = '/disableModelRunning';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: ints
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.enableModelRecording = function(ints){
    assert(Array.isArray(ints));
    var address = '/enableModelRecording';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: ints
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.disableModelRecording = function(ints){
    assert(Array.isArray(ints));
    var address = '/disableModelRecording';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: ints
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.setInputNames = function(names){
    assert(Array.isArray(names));
    var address = '/setInputNames';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: names
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.setOutputNames = function(names){
    assert(Array.isArray(names));
    var address = '/setOutputNames';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: names
    }, self.localAddress, self.localPort);
  };
  wekinatorNode.prototype.selectInputsForOutput = function(output, inputs){
    assert(Array.isArray(inputs) && typeof output === 'number');
    var address = '/selectInputsForOutput';
    self.WekaPort.send({
      address: self.controlEndpoint+address,
      args: inputs.unshift(output)
    }, self.localAddress, self.localPort);
  };
})();
