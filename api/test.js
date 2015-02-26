var fs = require('fs');
var path = require('path');

var writeInfo = function() {
  var name = 'Fancy Quote';
  // write to Info.json file
  var info = {
      id: '25bc5b5d-e6a7-4429-b4f5-5cb77d741e3d',
      version: '1.0.0.0',
      providerName: 'Harry Sun @ IRESS',
      defaultLocale: 'en-US',
      runtimeGroupId: 'Oth',
      displayName: name,
      runtimeIcon: 'fa-tree',
      description: 'This widget analyse the quote data.',
      sourceLocation: 'https://localhost/ExternalTraderPlusWidget/'
  };
  var store = '\\\\AU03-PLI-PC1\\TraderPlus$\\';
  var text = JSON.stringify(info, null, 4);
  name = name.replace(/ /g, '');
  var dir = path.join(store + '\\AppStore\\Apps\\', name);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  var fd = fs.openSync(path.join(dir, 'Info.json'), 'w', 0666);
  fs.writeSync(fd, text, 0);
  fs.closeSync(fd);
}

writeInfo();