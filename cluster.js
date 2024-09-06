const cluster = require('cluster');
const os = require('os');
const http = require('http');
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  
  for (let i = 0; i < 2; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Work ${worker.process.pid} died`);
    console.log('start a new work');
    cluster.fork();
  });

} else {
  
  require('./server');
}
