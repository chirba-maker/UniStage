const http = require('http');

function req(path, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 8080,
      path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      }
    };
    const r = http.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    r.on('error', reject);
    r.end();
  });
}

function login(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const opts = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const r = http.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        resolve(JSON.parse(raw).accessToken);
      });
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

async function testRole(name, email) {
  const token = await login(email, 'password123');
  const notifs = await req('/api/notifications', token);
  const count = await req('/api/notifications/unread-count', token);
  console.log(`\n👤 ${name} (${email})`);
  console.log(`   Total : ${notifs.body?.length || 0} notifications | Non lues : ${count.body?.count ?? 0}`);
  if (notifs.body && notifs.body.length > 0) {
    notifs.body.slice(0, 3).forEach((n, idx) => {
      console.log(`   ${idx + 1}. [${n.lue ? 'LUE' : 'NON LUE'}] ${n.titre} : ${n.message}`);
    });
  }
}

async function run() {
  console.log('='.repeat(60));
  console.log('  VÉRIFICATION DU SYSTÈME DE NOTIFICATIONS (4 RÔLES)');
  console.log('='.repeat(60));
  await testRole('ADMINISTRATEUR', 'admin@univ-labe.edu.gn');
  await testRole('ENTREPRISE (Sotelgui)', 'contact@sotelgui.gn');
  await testRole('ENTREPRISE (BCRG)', 'info@banque-bcrg.gn');
  await testRole('ÉTUDIANT (Mamadou Barry)', 'mamadou.barry@etud.univ-labe.edu.gn');
  await testRole('TUTEUR (Prof. Diallo)', 'prof.diallo@univ-labe.edu.gn');
  console.log('\n' + '='.repeat(60));
}

run().catch(console.error);
