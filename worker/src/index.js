const WorkerPool = require('wrecker');
const path = require('path');
const polka = require('polka');
const send = require('@polka/send-type');
const calculateStats = require('./quizstats/calculate.js');

const PORT = parseInt(process.env.PORT || 80, 10);
const WORKER_JOBS_PATH = path.join(__dirname, 'worker_jobs.js');

const workerPool = new WorkerPool(WORKER_JOBS_PATH);

polka().get('/users/:userId/quizstats', async (req, res) => {
  try {
    const result = await calculateStats(workerPool, req.params.userId);
    return send(res, 200, result);
  } catch (err) {
    return send(res, 500, err.message);
  }
}).listen(PORT, (err) => {
  if (err) {
    console.warn('Error starting');
    console.warn(err);
    process.exit(1);
  }
});
