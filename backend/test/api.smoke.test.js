const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const http = require('http');

const TEST_PORT = 14210;
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ept-test-'));
const DB_PATH = path.join(TMP_DIR, 'test.db');

function request(method, urlPath, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: urlPath,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...headers
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let parsed = raw;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch {
            /* leave as string (csv) */
          }
          resolve({ status: res.statusCode, body: parsed, raw, headers: res.headers });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

let child;
let childLogs = '';

describe('API smoke tests', () => {
  before(async () => {
    childLogs = '';
    child = spawn('node', [path.join(__dirname, '..', 'server.js')], {
      env: {
        ...process.env,
        PORT: String(TEST_PORT),
        NODE_ENV: 'test',
        DATABASE_URL: DB_PATH,
        APP_AUTH_TOKEN: ''
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const onChunk = (chunk) => {
      childLogs += chunk.toString();
    };
    child.stdout.on('data', onChunk);
    child.stderr.on('data', onChunk);

    // wait for health
    let ready = false;
    for (let i = 0; i < 40; i++) {
      if (child.exitCode !== null) {
        break;
      }
      try {
        const res = await request('GET', '/api/health');
        if (res.status === 200 && res.body?.status === 'OK') {
          ready = true;
          break;
        }
      } catch {
        /* retry */
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    if (!ready) {
      throw new Error(
        `Server failed to start (exit=${child.exitCode}): ${childLogs.slice(-2000)}`
      );
    }
  });

  after(async () => {
    if (child) {
      child.kill('SIGTERM');
    }
    try {
      fs.rmSync(TMP_DIR, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('health check returns OK', async () => {
    const res = await request('GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'OK');
  });

  it('creates plant, log, archive, export', async () => {
    const plantRes = await request('POST', '/api/plants', {
      name: `Test Plant ${Date.now()}`,
      strain: 'Test Strain',
      stage: 'vegetative',
      planted_date: '2024-01-01',
      grow_tent: 'Tent A'
    });
    assert.equal(plantRes.status, 201, JSON.stringify(plantRes.body));
    const plantId = plantRes.body.id;

    const logRes = await request('POST', '/api/logs', {
      plant_id: plantId,
      type: 'watering',
      notes: 'test water',
      water_amount: 1.5
    });
    assert.equal(logRes.status, 201, JSON.stringify(logRes.body));

    const statsRes = await request('GET', `/api/logs/stats/${plantId}`);
    assert.equal(statsRes.status, 200);
    assert.ok(Array.isArray(statsRes.body));
    assert.ok(statsRes.body.some((s) => s.type === 'watering'));

    const archRes = await request('POST', `/api/plants/${plantId}/archive`, {
      reason: 'completed',
      final_yield: 100,
      harvest_date: '2024-04-01'
    });
    assert.equal(archRes.status, 200, JSON.stringify(archRes.body));
    assert.ok(archRes.body.archivedGrowId);

    const listRes = await request('GET', '/api/plants/archived');
    assert.equal(listRes.status, 200);
    assert.ok(listRes.body.some((g) => g.id === archRes.body.archivedGrowId));

    const exportRes = await request('GET', `/api/plants/archived/${archRes.body.archivedGrowId}/export`);
    assert.equal(exportRes.status, 200);
    assert.ok(String(exportRes.raw).includes('Plant Information'));
    assert.ok(String(exportRes.raw).includes('Test Strain'));

    const gone = await request('GET', `/api/plants/${plantId}`);
    assert.equal(gone.status, 404);
  });

  it('rejects soft-archive via PUT', async () => {
    const plantRes = await request('POST', '/api/plants', {
      name: `Soft ${Date.now()}`,
      stage: 'seedling'
    });
    const id = plantRes.body.id;
    const put = await request('PUT', `/api/plants/${id}`, { archived: true });
    assert.equal(put.status, 400);
  });

  it('csv helper escapes commas', () => {
    const { csvEscape, csvRow } = require('../utils/csv');
    assert.equal(csvEscape('a,b'), '"a,b"');
    assert.equal(csvEscape('=1+1'), "'=1+1");
    assert.equal(csvRow(['a', 'b,c']), 'a,"b,c"');
  });

  it('addDaysToDateString works', () => {
    const { addDaysToDateString } = require('../utils/dbHelpers');
    assert.equal(addDaysToDateString('2024-01-01', 120), '2024-04-30');
    assert.equal(addDaysToDateString(null, 120), null);
  });
});
