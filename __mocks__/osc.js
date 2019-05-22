const UDPPort = jest.fn();

UDPPort.prototype.open = jest.fn();
UDPPort.prototype.send = jest.fn();
UDPPort.prototype.on = jest.fn();
UDPPort.prototype.close = jest.fn();

module.exports = {
  UDPPort
};
