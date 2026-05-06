const { useState, useEffect } = React;

const CE = {
  'Français':'🥐','Italien':'🍝','Japonais':'🍣','Thaïlandais':'🍜',
  'Indien':'🍛','Mexicain':'🌮','Américain':'🍔','Chinois':'🥡',
  'Méditerranéen':'🥗','Végétarien':'🥦','Pizzeria':'🍕',
  'Libanais':'🧆','Coréen':'🍱','Autres':'🍽️'
};
const CUISINES = Object.keys(CE);
const PL = [{v:1,l:'€ Bon marché'},{v:2,l:'€€ Moyen'},{v:3,l:'€€€ Cher'}];

/* ── Toast ── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, []);
  return (
    <div className={`toast ${type === 'success' ? 'ok' : 'err'}`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      <span>{msg}</span>
    </div>
  );
}

/* ── Stars ── */
function Stars({ value=0, onChange, readonly=false, size='md' }) {
  const [hov, setHov] = useState(0);
  const fs = { sm:13, md:15, lg:22, xl:26 }[size] || 15;
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i}
          className={`star ${(hov||value) >= i ? 'on' : ''}`}
          style={{ fontSize: fs, cursor: readonly ? 'default' : 'pointer' }}
          onClick={() => !readonly && onChange?.(i)}
          onMouseEnter={() => !readonly && setHov(i)}
          onMouseLeave={() => !readonly && setHov(0)}
        >★</span>
      ))}
    </div>
  );
}

/* ── Auth Screen ── */
function AuthScreen({ fb, onToast }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const frErr = code => ({
    'auth/email-already-in-use': 'Email déjà utilisé.',
    'auth/weak-password': 'Mot de passe trop court (6 min).',
    'auth/user-not-found': 'Aucun compte avec cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-email': 'Email invalide.',
    'auth/invalid-credential': 'Identifiants incorrects.',
  }[code] || 'Erreur, réessaie.');

  async function handleEmail(e) {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      if (mode === 'register') {
        const c = await fb.createUserWithEmailAndPassword(fb.auth, email, pw);
        await fb.updateProfile(c.user, { displayName: name });
        await fb.setDoc(fb.doc(fb.db, 'users', c.user.uid), { name, email, createdAt: new Date() });
      } else {
        await fb.signInWithEmailAndPassword(fb.auth, email, pw);
      }
    } catch(e) { setErr(frErr(e.code)); }
    setLoading(false);
  }

  async function handleGoogle() {
    setErr(''); setLoading(true);
    try {
      const p = new fb.GoogleAuthProvider();
      const c = await fb.signInWithPopup(fb.auth, p);
      await fb.setDoc(fb.doc(fb.db, 'users', c.user.uid), {
        name: c.user.displayName, email: c.user.email,
        photoURL: c.user.photoURL, createdAt: new Date()
      }, { merge: true });
    } catch(e) { setErr(frErr(e.code)); }
    setLoading(false);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🍽️</div>
          <h1>Les Restos <span>du Taf</span></h1>
        </div>
        <p className="auth-sub">Découvrez, notez et votez pour les restos du bureau. Fini les débats au moment du déj' !</p>
        {err && <div className="err">{err}</div>}
        <form onSubmit={handleEmail}>
          {mode === 'register' && (
            <div className="ig">
              <label>Prénom / Pseudo</label>
              <input className="f" value={name} onChange={e => setName(e.target.value)} placeholder="Alex" required />
            </div>
          )}
          <div className="ig">
            <label>Email</label>
            <input className="f" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@boite.fr" required />
          </div>
          <div className="ig">
            <label>Mot de passe</label>
            <input className="f" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn primary full" type="submit" disabled={loading}>
            {loading ? '…' : mode === 'login' ? '→ Se connecter' : '→ Créer mon compte'}
          </button>
        </form>
        <div className="divider">ou</div>
        <button className="btn google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuer avec Google
        </button>
        <div className="auth-sw">
          {mode === 'login'
            ? <><span>Pas de compte ? </span><a onClick={() => setMode('register')}>S'inscrire</a></>
            : <><span>Déjà un compte ? </span><a onClick={() => setMode('login')}>Se connecter</a></>
          }
        </div>
      </div>
    </div>
  );
}

/* ── Add/Edit Restaurant Modal ── */
function RestoModal({ fb, user, resto, onClose, onToast }) {
  const isEdit = !!resto;
  const [form, setForm] = useState({
    name: resto?.name || '', cuisine: resto?.cuisine || 'Français',
    address: resto?.address || '', priceLevel: resto?.priceLevel || 1, notes: resto?.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function save() {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const d = { ...form, priceLevel: Number(form.priceLevel), emoji: CE[form.cuisine] || '🍽️', updatedAt: fb.serverTimestamp() };
      if (isEdit) {
        await fb.updateDoc(fb.doc(fb.db, 'restaurants', resto.id), d);
        onToast('Restaurant mis à jour ✓', 'success');
      } else {
        await fb.addDoc(fb.collection(fb.db, 'restaurants'), {
          ...d, addedBy: user.uid, addedByName: user.displayName || user.email,
          avgRating: 0, reviewCount: 0, createdAt: fb.serverTimestamp()
        });
        onToast('Restaurant ajouté ! 🎉', 'success');
      }
      onClose();
    } catch(e) { onToast('Erreur : ' + e.message, 'error'); }
    setLoading(false);
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mhead">
          <h2 className="mtitle">{isEdit ? '✏️ Modifier' : '➕ Nouveau resto'}</h2>
          <button className="mclose" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          <div className="fr"><label>Nom *</label><input className="f" value={form.name} onChange={set('name')} placeholder="Le Petit Bistrot" /></div>
          <div className="fr two">
            <div><label>Cuisine</label><select className="f" value={form.cuisine} onChange={set('cuisine')}>{CUISINES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label>Budget</label><select className="f" value={form.priceLevel} onChange={set('priceLevel')}>{PL.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}</select></div>
          </div>
          <div className="fr"><label>Adresse</label><input className="f" value={form.address} onChange={set('address')} placeholder="12 rue de la Paix" /></div>
          <div className="fr"><label>Notes (optionnel)</label><textarea className="f" value={form.notes} onChange={set('notes')} placeholder="Réservation conseillée…" /></div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <button className="btn ghost sm" onClick={onClose}>Annuler</button>
            <button className="btn primary sm" onClick={save} disabled={loading || !form.name.trim()}>
              {loading ? '…' : isEdit ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Restaurant Detail ── */
function RestoDetail({ fb, user, resto, onClose, onToast }) {
  const [reviews, setReviews] = useState([]);
  const [myR, setMyR] = useState(0);
  const [myCom, setMyCom] = useState('');
  const [myRev, setMyRev] = useState(null);
  const [sub, setSub] = useState(false);

  useEffect(() => {
    const q = fb.query(fb.collection(fb.db, 'reviews'), fb.where('restaurantId', '==', resto.id), fb.orderBy('createdAt', 'desc'));
    return fb.onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReviews(all);
      const mine = all.find(r => r.userId === user.uid);
      if (mine) { setMyRev(mine); setMyR(mine.rating); setMyCom(mine.comment || ''); }
    });
  }, [resto.id]);

  async function submit() {
    if (!myR) return; setSub(true);
    try {
      const d = {
        restaurantId: resto.id, userId: user.uid,
        userName: user.displayName || user.email, userPhoto: user.photoURL || null,
        rating: myR, comment: myCom, createdAt: fb.serverTimestamp()
      };
      if (myRev) await fb.updateDoc(fb.doc(fb.db, 'reviews', myRev.id), d);
      else await fb.addDoc(fb.collection(fb.db, 'reviews'), d);
      const snap = await fb.getDocs(fb.query(fb.collection(fb.db, 'reviews'), fb.where('restaurantId', '==', resto.id)));
      const all = snap.docs.map(d => d.data());
      const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
      await fb.updateDoc(fb.doc(fb.db, 'restaurants', resto.id), { avgRating: Math.round(avg * 10) / 10, reviewCount: all.length });
      onToast('Avis enregistré ✓', 'success');
    } catch(e) { onToast('Erreur', 'error'); }
    setSub(false);
  }

  const ps = ['','€','€€','€€€'][resto.priceLevel] || '';
  const pc = ['','p1','p2','p3'][resto.priceLevel] || 'p1';

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mhead">
          <div style={{ flex:1, minWidth:0 }}>
            <h2 className="mtitle">{resto.emoji} {resto.name}</h2>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, flexWrap:'wrap' }}>
              <Stars value={Math.round(resto.avgRating || 0)} readonly />
              <span style={{ fontSize:12, color:'var(--text2)' }}>{resto.avgRating ? `${resto.avgRating}/5` : 'Pas encore noté'}</span>
              <span className="dot" />
              <span className={`ptag ${pc}`}>{ps}</span>
              <span className="dot" />
              <span className="tag">{resto.cuisine}</span>
            </div>
          </div>
          <button className="mclose" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          {resto.address && <div style={{ fontSize:13, color:'var(--text2)', marginBottom:12 }}>📍 {resto.address}</div>}
          {resto.notes && <div style={{ background:'var(--bg3)', borderRadius:8, padding:'10px 12px', fontSize:13, color:'var(--text2)', marginBottom:14, borderLeft:'3px solid var(--accent)' }}>{resto.notes}</div>}

          {/* Mon avis */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:14, marginBottom:16 }}>
            <h4 style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>{myRev ? '✏️ Mon avis' : '⭐ Laisser un avis'}</h4>
            <Stars value={myR} onChange={setMyR} size="xl" />
            <textarea className="f" style={{ marginTop:10 }} value={myCom} onChange={e => setMyCom(e.target.value)} placeholder="C'était comment ? (optionnel)" />
            <button className="btn primary sm" style={{ marginTop:10 }} onClick={submit} disabled={!myR || sub}>
              {sub ? '…' : myRev ? 'Mettre à jour' : 'Publier'}
            </button>
          </div>

          {/* Avis équipe */}
          <h4 style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>💬 Avis de l'équipe ({reviews.length})</h4>
          {reviews.length === 0
            ? <p style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:'16px 0' }}>Soyez le premier à noter ce restaurant !</p>
            : reviews.map(r => (
              <div key={r.id} className="ri">
                <div className="rih">
                  <div className="avatar" style={{ width:26, height:26, fontSize:11 }}>
                    {r.userPhoto ? <img src={r.userPhoto} alt="" /> : (r.userName?.[0] || '?').toUpperCase()}
                  </div>
                  <span className="ria">{r.userId === user.uid ? 'Moi' : r.userName}</span>
                  <Stars value={r.rating} readonly size="sm" />
                  <span className="rid">{r.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || ''}</span>
                </div>
                {r.comment && <p className="rit">{r.comment}</p>}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

/* ── Vote Modal ── */
function VoteModal({ fb, user, restaurants, onClose, onToast }) {
  const [sessions, setSessions] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title:'', date:'', options:[] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return fb.onSnapshot(
      fb.query(fb.collection(fb.db, 'votes'), fb.orderBy('createdAt', 'desc')),
      snap => setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  async function create() {
    if (!form.title || form.options.length < 2) return;
    setLoading(true);
    try {
      await fb.addDoc(fb.collection(fb.db, 'votes'), {
        title: form.title, date: form.date, options: form.options, votes: {},
        createdBy: user.uid, createdByName: user.displayName || user.email,
        createdAt: fb.serverTimestamp(), active: true
      });
      setCreating(false); setForm({ title:'', date:'', options:[] });
      onToast('Session créée ! 🗳️', 'success');
    } catch(e) { onToast('Erreur', 'error'); }
    setLoading(false);
  }

  async function vote(sid, rid) {
    await fb.updateDoc(fb.doc(fb.db, 'votes', sid), { [`votes.${user.uid}`]: rid });
    onToast('Vote enregistré ✓', 'success');
  }

  const tog = id => setForm(f => ({
    ...f, options: f.options.includes(id) ? f.options.filter(x => x !== id) : [...f.options, id]
  }));

  const rm = Object.fromEntries(restaurants.map(r => [r.id, r]));

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mhead">
          <h2 className="mtitle">🗳️ Votes déjeuner</h2>
          <button className="mclose" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          {!creating
            ? <button className="btn primary full" style={{ marginBottom:14 }} onClick={() => setCreating(true)}>➕ Créer une session de vote</button>
            : (
              <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:14, marginBottom:14 }}>
                <h4 style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Nouvelle session</h4>
                <div className="fr"><label>Titre</label><input className="f" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Déj' vendredi" /></div>
                <div className="fr"><label>Date (optionnel)</label><input type="date" className="f" style={{ colorScheme:'dark' }} value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                <div className="fr">
                  <label>Choix proposés (min 2)</label>
                  <div style={{ maxHeight:170, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
                    {restaurants.map(r => (
                      <label key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'var(--bg2)', borderRadius:8, cursor:'pointer', border:`1px solid ${form.options.includes(r.id) ? 'var(--accent)' : 'var(--border)'}` }}>
                        <input type="checkbox" checked={form.options.includes(r.id)} onChange={() => tog(r.id)} style={{ accentColor:'var(--accent)', width:16, height:16 }} />
                        <span style={{ fontSize:14 }}>{r.emoji} {r.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn ghost sm" onClick={() => setCreating(false)}>Annuler</button>
                  <button className="btn primary sm" onClick={create} disabled={loading || !form.title || form.options.length < 2}>{loading ? '…' : 'Créer'}</button>
                </div>
              </div>
            )
          }
          {sessions.length === 0
            ? <div className="empty"><div className="ei">🗳️</div><p>Aucune session active.<br />Crée-en une pour le prochain déj' collectif !</p></div>
            : sessions.map(s => {
              const tot = Object.keys(s.votes || {}).length;
              const myV = s.votes?.[user.uid];
              return (
                <div key={s.id} className="vsession">
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                    <h4 style={{ fontFamily:'Syne', fontWeight:700, fontSize:15 }}>{s.title}</h4>
                    <span style={{ fontSize:11, color:'var(--text3)' }}>{tot} vote{tot !== 1 ? 's' : ''}</span>
                  </div>
                  {s.date && <p style={{ fontSize:12, color:'var(--text3)', marginBottom:10 }}>📅 {new Date(s.date).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}</p>}
                  {(s.options || []).map(rid => {
                    const r = rm[rid]; if (!r) return null;
                    const cnt = Object.values(s.votes || {}).filter(v => v === rid).length;
                    const pct = tot > 0 ? (cnt / tot) * 100 : 0;
                    return (
                      <div key={rid} className={`vopt ${myV === rid ? 'on' : ''}`} onClick={() => vote(s.id, rid)}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span>{r.emoji}</span>
                          <span style={{ fontSize:14, fontWeight:500 }}>{r.name}</span>
                          {myV === rid && <span style={{ fontSize:10, color:'var(--green)' }}>✓</span>}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="vbw"><div className="vb" style={{ width:`${pct}%` }} /></div>
                          <span style={{ fontSize:12, color:'var(--text2)', minWidth:14, textAlign:'right' }}>{cnt}</span>
                        </div>
                      </div>
                    );
                  })}
                  <p style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>Par {s.createdByName}</p>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

/* ── MAIN APP ── */
function App() {
  const [fb, setFb] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoad, setAuthLoad] = useState(true);
  const [page, setPage] = useState('restaurants');
  const [restos, setRestos] = useState([]);
  const [dataLoad, setDataLoad] = useState(true);
  const [search, setSearch] = useState('');
  const [fc, setFc] = useState('Tous');
  const [showAdd, setShowAdd] = useState(false);
  const [editR, setEditR] = useState(null);
  const [detailR, setDetailR] = useState(null);
  const [showVote, setShowVote] = useState(false);
  const [favs, setFavs] = useState([]);
  const [toast, setToast] = useState(null);

  const T = (msg, type='success') => setToast({ msg, type });

  useEffect(() => {
    const init = () => { if (window.__firebaseReady && window.__firebase) setFb(window.__firebase); };
    if (window.__firebaseReady) init();
    else window.addEventListener('firebase-ready', init);
    return () => window.removeEventListener('firebase-ready', init);
  }, []);

  useEffect(() => {
    if (!fb) return;
    return fb.onAuthStateChanged(fb.auth, u => { setUser(u); setAuthLoad(false); });
  }, [fb]);

  useEffect(() => {
    if (!fb || !user) return;
    return fb.onSnapshot(
      fb.query(fb.collection(fb.db, 'restaurants'), fb.orderBy('createdAt', 'desc')),
      snap => { setRestos(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setDataLoad(false); }
    );
  }, [fb, user]);

  useEffect(() => {
    if (!fb || !user) return;
    return fb.onSnapshot(fb.doc(fb.db, 'favorites', user.uid), snap => {
      if (snap.exists()) setFavs(snap.data().list || []);
    });
  }, [fb, user]);

  async function toggleFav(id, e) {
    e?.stopPropagation();
    const ref = fb.doc(fb.db, 'favorites', user.uid);
    const is = favs.includes(id);
    await fb.setDoc(ref, { list: is ? favs.filter(x => x !== id) : [...favs, id] }, { merge: true });
    T(is ? 'Retiré des favoris' : '❤️ Ajouté aux favoris');
  }

  async function delResto(id, e) {
    e?.stopPropagation();
    if (!confirm('Supprimer ce restaurant ?')) return;
    await fb.deleteDoc(fb.doc(fb.db, 'restaurants', id));
    T('Supprimé');
  }

  const avgR = (() => {
    const r = restos.filter(x => x.avgRating);
    return r.length ? (r.reduce((s, x) => s + x.avgRating, 0) / r.length).toFixed(1) : '—';
  })();

  const filtered = restos.filter(r => {
    const q = search.toLowerCase();
    return (!q || r.name.toLowerCase().includes(q) || r.cuisine?.toLowerCase().includes(q))
      && (fc === 'Tous' || r.cuisine === fc)
      && (page !== 'favorites' || favs.includes(r.id));
  });

  const ps = p => ['','€','€€','€€€'][p] || '';
  const pc = p => ['','p1','p2','p3'][p] || 'p1';

  if (!fb || authLoad) return (
    <div className="loading">
      <div className="spinner" />
      <p style={{ color:'var(--text2)', fontSize:14 }}>Chargement…</p>
    </div>
  );
  if (!user) return <AuthScreen fb={fb} onToast={T} />;

  const ini = (user.displayName || user.email || '?').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  function bnav(id) {
    if (id === 'add') { setShowAdd(true); return; }
    if (id === 'vote') { setShowVote(true); return; }
    if (id === 'account') { if (confirm('Se déconnecter ?')) fb.signOut(fb.auth); return; }
    setPage(id);
  }

  return (
    <div className="app">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sidebar desktop */}
      <nav className="sidebar">
        <div className="s-logo">
          <div className="s-logo-icon">🍽️</div>
          <h2>Les Restos <span>du Taf</span></h2>
        </div>
        {[
          { id:'restaurants', icon:'🏪', l:'Tous les restos' },
          { id:'favorites',   icon:'❤️', l:'Mes favoris' },
        ].map(n => (
          <div key={n.id} className={`nav-item ${page === n.id ? 'on' : ''}`} onClick={() => setPage(n.id)}>
            <span className="nav-icon">{n.icon}</span>{n.l}
          </div>
        ))}
        <div className={`nav-item ${showVote ? 'on' : ''}`} onClick={() => setShowVote(true)}>
          <span className="nav-icon">🗳️</span>Votes déjeuner
        </div>
        <div className="s-bottom">
          <div className="ucard">
            <div className="avatar">{user.photoURL ? <img src={user.photoURL} alt="" /> : ini}</div>
            <div>
              <div className="uname">{user.displayName || 'Utilisateur'}</div>
              <div className="uemail">{user.email}</div>
            </div>
          </div>
          <button className="btn ghost sm" style={{ width:'100%' }} onClick={() => fb.signOut(fb.auth)}>→ Déconnexion</button>
        </div>
      </nav>

      {/* Main */}
      <main className="main">
        <div className="ph">
          <div>
            <h1 className="ph-title">{page === 'favorites' ? '❤️ Mes favoris' : '🏪 Restaurants'}</h1>
            <p className="ph-sub">
              {page === 'favorites'
                ? `${filtered.length} restaurant${filtered.length !== 1 ? 's' : ''} sauvegardé${filtered.length !== 1 ? 's' : ''}`
                : `${restos.length} resto${restos.length !== 1 ? 's' : ''} référencé${restos.length !== 1 ? 's' : ''} par l'équipe`}
            </p>
          </div>
          <button className="btn primary sm" onClick={() => setShowAdd(true)}>➕ Suggérer un resto</button>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="sc"><div className="sv ca">{restos.length}</div><div className="sl">Restaurants</div></div>
          <div className="sc"><div className="sv cg">{favs.length}</div><div className="sl">Mes favoris</div></div>
          <div className="sc"><div className="sv co">{avgR}</div><div className="sl">Note moy.</div></div>
          <div className="sc"><div className="sv cb">{restos.reduce((s, r) => s + (r.reviewCount || 0), 0)}</div><div className="sl">Avis total</div></div>
        </div>

        {/* Search */}
        <div className="search">
          <span style={{ color:'var(--text3)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un restaurant ou une cuisine…" />
          {search && <button className="clr-btn" onClick={() => setSearch('')}>×</button>}
        </div>

        {/* Filtres */}
        <div className="ftabs">
          {['Tous', ...CUISINES].map(c => (
            <button key={c} className={`ftab ${fc === c ? 'on' : ''}`} onClick={() => setFc(c)}>
              {CE[c] ? `${CE[c]} ` : ''}{c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {dataLoad
          ? <div style={{ display:'flex', justifyContent:'center', padding:50 }}><div className="spinner" /></div>
          : filtered.length === 0
            ? (
              <div className="empty">
                <div className="ei">{page === 'favorites' ? '❤️' : '🍽️'}</div>
                <p>{page === 'favorites' ? "Aucun favori pour l'instant." : "Aucun restaurant ne correspond."}</p>
                {page !== 'favorites' && <button className="btn primary sm" onClick={() => setShowAdd(true)}>➕ Suggérer un resto</button>}
              </div>
            )
            : (
              <div className="grid">
                {filtered.map(r => {
                  const isFav = favs.includes(r.id);
                  return (
                    <div key={r.id} className="rcard" onClick={() => setDetailR(r)}>
                      <div className="rcard-img">
                        <span style={{ fontSize:44 }}>{r.emoji || '🍽️'}</span>
                        <div className={`rbadge ${isFav ? 'fav' : ''}`}>{isFav ? '❤️' : '☆'}</div>
                      </div>
                      <div className="rcard-body">
                        <div className="rname">{r.name}</div>
                        <div className="rmeta">
                          <span className="tag" style={{ fontSize:11, padding:'2px 7px' }}>{r.cuisine}</span>
                          <span className="dot" />
                          <span className={`ptag ${pc(r.priceLevel)}`}>{ps(r.priceLevel)}</span>
                          {r.address && <><span className="dot" /><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:110, fontSize:11 }}>📍 {r.address}</span></>}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <Stars value={Math.round(r.avgRating || 0)} readonly size="sm" />
                          <span style={{ fontSize:12, color:'var(--text2)' }}>{r.avgRating ? `${r.avgRating}/5` : 'Non noté'}</span>
                        </div>
                      </div>
                      <div className="rfoot" onClick={e => e.stopPropagation()}>
                        <span className="rct">💬 {r.reviewCount || 0} avis</span>
                        <div className="ract">
                          <button className={`btn icon-btn sm ${isFav ? 'danger' : 'ghost'}`} onClick={e => toggleFav(r.id, e)}>{isFav ? '❤️' : '🤍'}</button>
                          {r.addedBy === user.uid && <>
                            <button className="btn icon-btn sm ghost" onClick={e => { e.stopPropagation(); setEditR(r); }}>✏️</button>
                            <button className="btn icon-btn sm danger" onClick={e => delResto(r.id, e)}>🗑️</button>
                          </>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
        }
      </main>

      {/* Bottom nav mobile */}
      <nav className="bnav">
        <div className="bnav-inner">
          <button className={`bnav-item ${page === 'restaurants' ? 'on' : ''}`} onClick={() => bnav('restaurants')}><span className="bni">🏪</span><span>Restos</span></button>
          <button className={`bnav-item ${page === 'favorites' ? 'on' : ''}`} onClick={() => bnav('favorites')}><span className="bni">❤️</span><span>Favoris</span></button>
          <button className="bnav-fab" onClick={() => bnav('add')}><div className="fab">➕</div></button>
          <button className={`bnav-item ${showVote ? 'on' : ''}`} onClick={() => bnav('vote')}><span className="bni">🗳️</span><span>Voter</span></button>
          <button className="bnav-item" onClick={() => bnav('account')}><span className="bni">👤</span><span>Compte</span></button>
        </div>
      </nav>

      {/* Modals */}
      {showAdd   && <RestoModal fb={fb} user={user} onClose={() => setShowAdd(false)} onToast={T} />}
      {editR     && <RestoModal fb={fb} user={user} resto={editR} onClose={() => setEditR(null)} onToast={T} />}
      {detailR   && <RestoDetail fb={fb} user={user} resto={detailR} onClose={() => setDetailR(null)} onToast={T} />}
      {showVote  && <VoteModal fb={fb} user={user} restaurants={restos} onClose={() => setShowVote(false)} onToast={T} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
