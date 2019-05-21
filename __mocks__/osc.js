const UDPPort = jest.fn();

UDPPort.prototype.open = jest.fn()

module.exports = {
  UDPPort
};
