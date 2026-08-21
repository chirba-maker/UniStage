const http = require('http');

const BASE = 'localhost';
const PORT = 8080;

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: BASE, port: PORT, path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
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
    if (data) r.write(data);
    r.end();
  });
}

async function login(email, password) {
  const r = await req('POST', '/api/auth/login', { email, password });
  if (r.status === 200) return r.body.accessToken;
  throw new Error(`Login failed for ${email}: ${JSON.stringify(r.body)}`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('  TEST WORKFLOW COMPLET DE CONVENTION — UniStage');
  console.log('='.repeat(60));

  // ──────────────────────────────────────────────────────
  // ÉTAPE 1 : Étudiant voit ses conventions
  // ──────────────────────────────────────────────────────
  console.log('\n📚 ÉTAPE 1 — Connexion Étudiant (mamadou.barry)');
  const tokenEtu = await login('mamadou.barry@etud.univ-labe.edu.gn', 'password123');
  console.log('  ✅ Connexion OK');

  const convs = await req('GET', '/api/conventions/mes-conventions', null, tokenEtu);
  console.log(`  📄 Conventions de l'étudiant: ${convs.status}`);
  if (convs.status === 200) {
    convs.body.forEach(c => {
      console.log(`     → Convention #${c.id} | statut: ${c.statutValidation} | stage: ${c.candidature?.offre?.titre || 'N/A'}`);
    });
  } else {
    console.log('  ⚠️  Réponse:', JSON.stringify(convs.body));
  }

  // Convention N°6 en détail
  const conv6 = await req('GET', '/api/conventions/6', null, tokenEtu);
  console.log(`\n  🔍 Convention #6 en détail (étudiant): statut = ${conv6.body?.statutValidation}`);

  // ──────────────────────────────────────────────────────
  // ÉTAPE 2 : Entreprise BCRG valide
  // ──────────────────────────────────────────────────────
  console.log('\n🏢 ÉTAPE 2 — Validation Entreprise (BCRG)');
  const tokenEntreprise = await login('info@banque-bcrg.gn', 'password123');
  console.log('  ✅ Connexion OK');

  // Voir les candidatures entreprise
  const cands = await req('GET', '/api/candidatures/entreprise-candidatures', null, tokenEntreprise);
  console.log(`  📋 Candidatures entreprise: status=${cands.status}`);

  // Valider la convention N°6 en tant qu'entreprise
  const valEnt = await req('PUT', '/api/conventions/6/valider-entreprise', {}, tokenEntreprise);
  console.log(`  🖊️  Validation entreprise: status=${valEnt.status}`);
  if (valEnt.status === 200) {
    console.log(`  ✅ Nouveau statut: ${valEnt.body?.statutValidation}`);
  } else {
    console.log('  ⚠️  Erreur:', JSON.stringify(valEnt.body));
  }

  // ──────────────────────────────────────────────────────
  // ÉTAPE 3 : Admin assigne un tuteur
  // ──────────────────────────────────────────────────────
  console.log('\n🎓 ÉTAPE 3 — Admin assigne un tuteur');
  const tokenAdmin = await login('admin@univ-labe.edu.gn', 'password123');
  console.log('  ✅ Connexion OK');

  // Voir les tuteurs disponibles
  const tuteurs = await req('GET', '/api/tuteurs', null, tokenAdmin);
  console.log(`  👨‍🏫 Tuteurs disponibles: status=${tuteurs.status}`);
  let tuteurId = null;
  if (tuteurs.status === 200 && Array.isArray(tuteurs.body) && tuteurs.body.length > 0) {
    tuteurId = tuteurs.body[0].id;
    console.log(`  → Tuteur choisi: #${tuteurId} — ${tuteurs.body[0].nom || ''} ${tuteurs.body[0].prenom || ''}`);
  } else {
    console.log('  ⚠️  Réponse tuteurs:', JSON.stringify(tuteurs.body).substring(0, 200));
    // Try default tuteur id = 1
    tuteurId = 1;
    console.log('  → Essai avec tuteurId = 1');
  }

  const assignTuteur = await req('PUT', '/api/conventions/6/assigner-tuteur', { tuteurId }, tokenAdmin);
  console.log(`  🔗 Assignation tuteur: status=${assignTuteur.status}`);
  if (assignTuteur.status === 200) {
    console.log(`  ✅ Tuteur assigné. Statut convention: ${assignTuteur.body?.statutValidation}`);
    console.log(`     Tuteur: ${assignTuteur.body?.tuteur?.nom || ''} ${assignTuteur.body?.tuteur?.prenom || ''}`);
  } else {
    console.log('  ⚠️  Erreur:', JSON.stringify(assignTuteur.body));
  }

  // ──────────────────────────────────────────────────────
  // ÉTAPE 4 : Tuteur valide et génère le PDF
  // ──────────────────────────────────────────────────────
  console.log('\n✍️  ÉTAPE 4 — Tuteur valide et signe');
  const tokenTuteur = await login('prof.diallo@univ-labe.edu.gn', 'password123');
  console.log('  ✅ Connexion OK');

  const valTuteur = await req('PUT', '/api/conventions/6/valider-tuteur', {}, tokenTuteur);
  console.log(`  🖊️  Validation tuteur: status=${valTuteur.status}`);
  if (valTuteur.status === 200) {
    console.log(`  ✅ Nouveau statut: ${valTuteur.body?.statutValidation}`);
    console.log(`  📄 PDF URL: ${valTuteur.body?.pdfUrl || '(non disponible)'}`);
  } else {
    console.log('  ⚠️  Erreur:', JSON.stringify(valTuteur.body));
  }

  // ──────────────────────────────────────────────────────
  // ÉTAPE 5 : Vérification finale par l'étudiant
  // ──────────────────────────────────────────────────────
  console.log('\n🎉 ÉTAPE FINALE — Vérification étudiant');
  const tokenEtu2 = await login('mamadou.barry@etud.univ-labe.edu.gn', 'password123');
  const conv6Final = await req('GET', '/api/conventions/6', null, tokenEtu2);
  console.log(`  📋 Convention #6 statut final: ${conv6Final.body?.statutValidation}`);
  console.log(`  📄 PDF URL: ${conv6Final.body?.pdfUrl || '(vide)'}`);

  const mesConvsFinal = await req('GET', '/api/conventions/mes-conventions', null, tokenEtu2);
  if (mesConvsFinal.status === 200) {
    console.log(`\n  📑 Toutes les conventions de l'étudiant:`);
    mesConvsFinal.body.forEach(c => {
      console.log(`     Convention #${c.id}: ${c.statutValidation} | PDF: ${c.pdfUrl || 'non disponible'}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('  TEST TERMINÉ');
  console.log('='.repeat(60));
}

main().catch(e => console.error('ERREUR FATALE:', e.message));
