const fs = require('fs');

const content = 'Hello from Node.js demo!';

fs.writeFile('message.txt', content, (err) => {
  if (err) {
    console.error('Error writing file:', err);
    process.exit(1);
  }
  console.log('message.txt written successfully');
});
