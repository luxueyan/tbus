var app = require('pm').createMaster({
 'pidfile' : './os.pid',
});

app.register('group1', __dirname + '/worker.js', {
 'listen' : [process.env.PORT || 4100]
});

app.on('giveup', function (name, num, pause) {
  // YOU SHOULD ALERT HERE!
  console.error(Array.prototype.concat.call(arguments, ['give up']));
});
app.dispatch();
