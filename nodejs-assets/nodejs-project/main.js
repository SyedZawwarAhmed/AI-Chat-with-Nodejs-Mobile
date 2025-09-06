var rn_bridge = require('rn-bridge');
var express = require('express');

var app = express();
var port = 3000;

app.use(express.json());

app.post('/api/data', (req, res) => {
  console.log('Received POST data:', req.body);

  rn_bridge.channel.send(
    JSON.stringify({
      type: 'POST_DATA',
      data: req.body,
    }),
  );

  res.json({
    success: true,
    message: 'Data received and sent to React Native',
    receivedData: req.body,
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Express server running on port ${port}`);
  rn_bridge.channel.send(`Express server started on port ${port}`);
});

rn_bridge.channel.on('message', msg => {
  rn_bridge.channel.send(msg);
});

rn_bridge.channel.send('Node was initialized.');
