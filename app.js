const { useState, useEffect } = React;

// ── CONSTANTES ──
const CE = {
  'Français':'🥐','Italien':'🍝','Japonais':'🍣','Thaïlandais':'🍜',
  'Indien':'🍛','Mexicain':'🌮','Américain':'🍔','Chinois':'🥡',
  'Méditerranéen':'🥗','Végétarien':'🥦','Pizzeria':'🍕',
  'Libanais':'🧆','Coréen':'🍱','Autres':'🍽️'
};
const CUISINES = Object.keys(CE);
const PL = [{v:1,l:'€ Bon marché'},{v:2,l:'€€ Moyen'},{v:3,l:'€€€ Cher'}];
const DEFAULT_CRITERIA = ['🌿 Végétarien','☀️ Terrasse','🛵 Livraison','♿ PMR','📶 Wifi','📅 Réservation'];

// ── THEME ──
function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark(d => !d)];
}

// ── TOAST ──
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, []);
  return (
    <div className={`toast ${type === 'success' ? 'ok' : 'err'}`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      <span>{msg}</span>
    </div>
  );
}

// ── STARS ──
function Stars({ value=0, onChange, readonly=false, size='md' }) {
  const [hov, setHov] = useState(0);
  const fs = { sm:13, md:15, lg:22, xl:26 }[size] || 15;
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i}
          className={`star ${(hov||value) >= i ? 'on' : ''}`}
          style={{ fontSize:fs, cursor:readonly?'default':'pointer' }}
          onClick={() => !readonly && onChange?.(i)}
          onMouseEnter={() => !readonly && setHov(i)}
          onMouseLeave={() => !readonly && setHov(0)}
        >★</span>
      ))}
    </div>
  );
}

// ── LIGHTBOX ──
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const fn = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>×</button>
      <img src={src} alt="" onClick={e => e.stopPropagation()} />
    </div>
  );
}

// ── MAP COMPONENT ──
function MapView({ address }) {
  const [show, setShow] = useState(false);
  if (!address) return null;

  const encoded = encodeURIComponent(address);
  const mapsUrl = `https://www.openstreetmap.org/search?query=${encoded}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=-0.1,48.8,0.1,48.9&layer=mapnik&marker=&query=${encoded}`;
  const embedSrc = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=html&limit=1`;

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <span style={{ fontSize:13, color:'var(--text2)' }}>📍 {address}</span>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="map-btn">
          🗺️ Voir sur la carte
        </a>
        <button className="map-btn" onClick={() => setShow(s => !s)}>
          {show ? '▲ Masquer' : '▼ Afficher la carte'}
        </button>
      </div>
      {show && (
        <iframe
          className="map-frame"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=-0.15,48.8,0.15,48.95&layer=mapnik&query=${encoded}&zoom=15`}
          title="Carte OpenStreetMap"
          loading="lazy"
          allowFullScreen
        />
      )}
    </div>
  );
}

// ── IMAGE URL INPUT ──
function ImageInput({ label, value, onChange, placeholder }) {
  const [valid, setValid] = useState(true);
  function check(url) {
    if (!url) { setValid(true); onChange(''); return; }
    const img = new Image();
    img.onload = () => { setValid(true); onChange(url); };
    img.onerror = () => setValid(false);
    img.src = url;
  }
  return (
    <div className="fr">
      {label && <label>{label}</label>}
      <input className="f" defaultValue={value} onBlur={e => check(e.target.value)} placeholder={placeholder || 'https://example.com/photo.jpg'} />
      {!valid && <p style={{fontSize:12,color:'var(--red)',marginTop:4}}>⚠️ URL invalide ou image inaccessible</p>}
      {value && valid && <img src={value} className="img-preview" alt="preview" onError={() => setValid(false)} />}
    </div>
  );
}

// ── CRITERIA SELECTOR ──
function CriteriaSelector({ selected=[], onChange, customList=[] }) {
  const [newCrit, setNewCrit] = useState('');
  const all = [...DEFAULT_CRITERIA, ...customList.filter(c => !DEFAULT_CRITERIA.includes(c))];

  function toggle(c) {
    onChange(selected.includes(c) ? selected.filter(x => x !== c) : [...selected, c]);
  }
  function addCustom() {
    const val = newCrit.trim();
    if (!val || all.includes(val)) return;
    onChange([...selected, val]);
    setNewCrit('');
  }

  return (
    <div>
      <div style={{display:'flex', flexWrap:'wrap', gap:8, marginBottom:10}}>
        {all.map(c => (
          <button key={c} type="button"
            className={`btn sm ${selected.includes(c) ? 'primary' : 'ghost'}`}
            style={{borderRadius:20, padding:'5px 12px', fontSize:12}}
            onClick={() => toggle(c)}
          >{c}</button>
        ))}
      </div>
      <div style={{display:'flex', gap:8}}>
        <input className="f" value={newCrit} onChange={e => setNewCrit(e.target.value)}
          placeholder="+ Ajouter un critère personnalisé"
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          style={{fontSize:13}}
        />
        <button type="button" className="btn ghost sm" onClick={addCustom} style={{flexShrink:0}}>Ajouter</button>
      </div>
    </div>
  );
}

// ── AUTH SCREEN ──
function AuthScreen({ fb, onToast }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const frErr = code => ({
    'auth/email-already-in-use':'Email déjà utilisé.',
    'auth/weak-password':'Mot de passe trop court (6 min).',
    'auth/user-not-found':'Aucun compte avec cet email.',
    'auth/wrong-password':'Mot de passe incorrect.',
    'auth/invalid-email':'Email invalide.',
    'auth/invalid-credential':'Identifiants incorrects.',
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
            <div className="ig"><label>Prénom / Pseudo</label>
              <input className="f" value={name} onChange={e => setName(e.target.value)} placeholder="Alex" required />
            </div>
          )}
          <div className="ig"><label>Email</label>
            <input className="f" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@boite.fr" required />
          </div>
          <div className="ig"><label>Mot de passe</label>
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
            : <><span>Déjà un compte ? </span><a onClick={() => setMode('login')}>Se connecter</a></>}
        </div>
      </div>
    </div>
  );
}

// ── ADD/EDIT RESTAURANT MODAL ──
function RestoModal({ fb, user, resto, allCriteria, onClose, onToast }) {
  const isEdit = !!resto;
  const [form, setForm] = useState({
    name: resto?.name || '',
    cuisine: resto?.cuisine || 'Français',
    address: resto?.address || '',
    priceLevel: resto?.priceLevel || 1,
    notes: resto?.notes || '',
    photoURL: resto?.photoURL || '',
    criteria: resto?.criteria || [],
  });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function save() {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const d = {
        ...form,
        priceLevel: Number(form.priceLevel),
        emoji: CE[form.cuisine] || '🍽️',
        updatedAt: fb.serverTimestamp()
      };
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
          <div className="fr"><label>Nom *</label>
            <input className="f" value={form.name} onChange={set('name')} placeholder="Le Petit Bistrot" />
          </div>
          <div className="fr two">
            <div><label>Cuisine</label>
              <select className="f" value={form.cuisine} onChange={set('cuisine')}>
                {CUISINES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label>Budget</label>
              <select className="f" value={form.priceLevel} onChange={set('priceLevel')}>
                {PL.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
            </div>
          </div>
          <div className="fr"><label>Adresse</label>
            <input className="f" value={form.address} onChange={set('address')} placeholder="12 rue de la Paix, Paris" />
          </div>
          <ImageInput
            label="Photo du restaurant (URL)"
            value={form.photoURL}
            onChange={url => setForm(f => ({ ...f, photoURL: url }))}
          />
          <div className="fr">
            <label>Critères</label>
            <CriteriaSelector
              selected={form.criteria}
              onChange={c => setForm(f => ({ ...f, criteria: c }))}
              customList={allCriteria}
            />
          </div>
          <div className="fr"><label>Notes (optionnel)</label>
            <textarea className="f" value={form.notes} onChange={set('notes')} placeholder="Réservation conseillée…" />
          </div>
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

// ── RESTAURANT DETAIL ──
function RestoDetail({ fb, user, resto, onClose, onToast }) {
  const [reviews, setReviews] = useState([]);
  const [myR, setMyR] = useState(0);
  const [myCom, setMyCom] = useState('');
  const [myPhotos, setMyPhotos] = useState(['']);
  const [myRev, setMyRev] = useState(null);
  const [sub, setSub] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const q = fb.query(fb.collection(fb.db, 'reviews'), fb.where('restaurantId', '==', resto.id), fb.orderBy('createdAt', 'desc'));
    return fb.onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReviews(all);
      const mine = all.find(r => r.userId === user.uid);
      if (mine) {
        setMyRev(mine); setMyR(mine.rating);
        setMyCom(mine.comment || '');
        setMyPhotos(mine.photos?.length ? mine.photos : ['']);
      }
    });
  }, [resto.id]);

  async function submit() {
    if (!myR) return; setSub(true);
    try {
      const photos = myPhotos.filter(p => p.trim());
      const d = {
        restaurantId: resto.id, userId: user.uid,
        userName: user.displayName || user.email, userPhoto: user.photoURL || null,
        rating: myR, comment: myCom, photos,
        createdAt: fb.serverTimestamp()
      };
      if (myRev) await fb.updateDoc(fb.doc(fb.db, 'reviews', myRev.id), d);
      else await fb.addDoc(fb.collection(fb.db, 'reviews'), d);
      const snap = await fb.getDocs(fb.query(fb.collection(fb.db, 'reviews'), fb.where('restaurantId', '==', resto.id)));
      const all = snap.docs.map(d => d.data());
      const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
      await fb.updateDoc(fb.doc(fb.db, 'restaurants', resto.id), {
        avgRating: Math.round(avg * 10) / 10, reviewCount: all.length
      });
      onToast('Avis enregistré ✓', 'success');
    } catch(e) { onToast('Erreur', 'error'); }
    setSub(false);
  }

  const ps = ['','€','€€','€€€'][resto.priceLevel] || '';
  const pc = ['','p1','p2','p3'][resto.priceLevel] || 'p1';

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
        <div className="mhead">
          <div style={{ flex:1, minWidth:0 }}>
            <h2 className="mtitle">{resto.emoji} {resto.name}</h2>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, flexWrap:'wrap' }}>
              <Stars value={Math.round(resto.avgRating || 0)} readonly />
              <span style={{ fontSize:12, color:'var(--text2)' }}>{resto.avgRating ? `${resto.avgRating}/5` : 'Pas encore noté'}</span>
              <span className="dot" /><span className={`ptag ${pc}`}>{ps}</span>
              <span className="dot" /><span className="tag">{resto.cuisine}</span>
            </div>
          </div>
          <button className="mclose" onClick={onClose}>×</button>
        </div>
        <div className="mbody">

          {/* Photo principale */}
          {resto.photoURL && (
            <div style={{ margin:'0 0 14px', borderRadius:12, overflow:'hidden', height:180, cursor:'pointer' }}
              onClick={() => setLightbox(resto.photoURL)}>
              <img src={resto.photoURL} alt={resto.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          )}

          {/* Adresse + carte OpenStreetMap */}
          {resto.address && <MapView address={resto.address} />}

          {/* Critères */}
          {resto.criteria?.length > 0 && (
            <div className="criteria-list" style={{ marginBottom:12 }}>
              {resto.criteria.map(c => <span key={c} className="criteria-badge">{c}</span>)}
            </div>
          )}

          {resto.notes && (
            <div style={{ background:'var(--bg3)', borderRadius:8, padding:'10px 12px', fontSize:13, color:'var(--text2)', marginBottom:14, borderLeft:'3px solid var(--accent)' }}>
              {resto.notes}
            </div>
          )}

          {/* Mon avis */}
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:14, marginBottom:16 }}>
            <h4 style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>{myRev ? '✏️ Mon avis' : '⭐ Laisser un avis'}</h4>
            <Stars value={myR} onChange={setMyR} size="xl" />
            <textarea className="f" style={{ marginTop:10 }} value={myCom}
              onChange={e => setMyCom(e.target.value)} placeholder="C'était comment ? (optionnel)" />
            <div style={{ marginTop:10 }}>
              <p style={{ fontSize:11, fontWeight:600, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>Photos (URLs, optionnel)</p>
              {myPhotos.map((p, i) => (
                <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
                  <input className="f" style={{ fontSize:13 }} value={p}
                    onChange={e => { const a=[...myPhotos]; a[i]=e.target.value; setMyPhotos(a); }}
                    placeholder="https://example.com/plat.jpg" />
                  {myPhotos.length > 1 && (
                    <button type="button" className="btn icon-btn sm danger"
                      onClick={() => setMyPhotos(myPhotos.filter((_,j) => j !== i))}>×</button>
                  )}
                </div>
              ))}
              {myPhotos.length < 4 && (
                <button type="button" className="btn ghost sm" style={{ marginTop:4 }}
                  onClick={() => setMyPhotos([...myPhotos, ''])}>+ Ajouter une photo</button>
              )}
            </div>
            <button className="btn primary sm" style={{ marginTop:12 }} onClick={submit} disabled={!myR || sub}>
              {sub ? '…' : myRev ? 'Mettre à jour' : 'Publier'}
            </button>
          </div>

          {/* Tous les avis */}
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
                {r.photos?.filter(p => p).length > 0 && (
                  <div className="photo-grid" style={{ gridTemplateColumns:`repeat(${Math.min(r.photos.filter(p=>p).length, 3)}, 1fr)` }}>
                    {r.photos.filter(p => p).map((p, i) => (
                      <div key={i} className="photo-thumb" onClick={() => setLightbox(p)}>
                        <img src={p} alt="" onError={e => e.target.parentElement.style.display='none'} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──
function App() {
  const [dark, toggleTheme] = useTheme();
  const [fb, setFb] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoad, setAuthLoad] = useState(true);
  const [page, setPage] = useState('restaurants');
  const [restos, setRestos] = useState([]);
  const [dataLoad, setDataLoad] = useState(true);
  const [search, setSearch] = useState('');
  const [fc, setFc] = useState('Tous');
  const [filterCrit, setFilterCrit] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editR, setEditR] = useState(null);
  const [detailR, setDetailR] = useState(null);
  const [favs, setFavs] = useState([]);
  const [toast, setToast] = useState(null);

  const T = (msg, type='success') => setToast({ msg, type });
  const allCriteria = [...new Set(restos.flatMap(r => r.criteria || []))];

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
      && (!filterCrit || r.criteria?.includes(filterCrit))
      && (page !== 'favorites' || favs.includes(r.id));
  });

  const ps = p => ['','€','€€','€€€'][p] || '';
  const pc = p => ['','p1','p2','p3'][p] || 'p1';

  if (!fb || authLoad) return (
    <div className="loading"><div className="spinner" /><p style={{ color:'var(--text2)', fontSize:14 }}>Chargement…</p></div>
  );
  if (!user) return <AuthScreen fb={fb} onToast={T} />;

  const ini = (user.displayName || user.email || '?').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  function bnav(id) {
    if (id === 'add') { setShowAdd(true); return; }
    if (id === 'account') { if (confirm('Se déconnecter ?')) fb.signOut(fb.auth); return; }
    setPage(id);
  }

  return (
    <div className="app">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── SIDEBAR desktop ── */}
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
        <div className="s-bottom">
          <div className="ucard">
            <div className="avatar">{user.photoURL ? <img src={user.photoURL} alt="" /> : ini}</div>
            <div>
              <div className="uname">{user.displayName || 'Utilisateur'}</div>
              <div className="uemail">{user.email}</div>
            </div>
          </div>
          <button className="theme-btn" onClick={toggleTheme}>
            {dark ? '☀️ Mode clair' : '🌙 Mode sombre'}
          </button>
          <button className="btn ghost sm" style={{ width:'100%' }} onClick={() => fb.signOut(fb.auth)}>→ Déconnexion</button>
        </div>
      </nav>

      {/* ── MAIN ── */}
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
          <button className="btn primary sm add-btn" onClick={() => setShowAdd(true)}>➕ Suggérer un resto</button>
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

        {/* Filtres cuisine */}
        <div className="ftabs">
          {['Tous', ...CUISINES].map(c => (
            <button key={c} className={`ftab ${fc === c ? 'on' : ''}`} onClick={() => setFc(c)}>
              {CE[c] ? `${CE[c]} ` : ''}{c}
            </button>
          ))}
        </div>

        {/* Filtres critères */}
        {allCriteria.length > 0 && (
          <div className="ftabs" style={{ marginBottom:20 }}>
            <button className={`ftab ${!filterCrit ? 'on' : ''}`} onClick={() => setFilterCrit('')}>Tous les critères</button>
            {allCriteria.map(c => (
              <button key={c} className={`ftab ${filterCrit === c ? 'on' : ''}`}
                onClick={() => setFilterCrit(filterCrit === c ? '' : c)}>{c}</button>
            ))}
          </div>
        )}

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
                        {r.photoURL && <img src={r.photoURL} alt={r.name} onError={e => e.target.style.display='none'} />}
                        <span className="emoji-fallback">{r.emoji || '🍽️'}</span>
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
                        {r.criteria?.length > 0 && (
                          <div className="criteria-list" style={{ marginBottom:8 }}>
                            {r.criteria.slice(0, 3).map(c => <span key={c} className="criteria-badge" style={{ fontSize:11, padding:'2px 8px' }}>{c}</span>)}
                            {r.criteria.length > 3 && <span className="criteria-badge" style={{ fontSize:11, padding:'2px 8px' }}>+{r.criteria.length - 3}</span>}
                          </div>
                        )}
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

      {/* ── BOTTOM NAV mobile ── */}
      <nav className="bnav">
        <div className="bnav-inner">
          <button className={`bnav-item ${page === 'restaurants' ? 'on' : ''}`} onClick={() => bnav('restaurants')}><span className="bni">🏪</span><span>Restos</span></button>
          <button className={`bnav-item ${page === 'favorites' ? 'on' : ''}`} onClick={() => bnav('favorites')}><span className="bni">❤️</span><span>Favoris</span></button>
          <button className="bnav-fab" onClick={() => bnav('add')}><div className="fab">➕</div></button>
          <button className="bnav-item" onClick={toggleTheme}><span className="bni">{dark ? '☀️' : '🌙'}</span><span>Thème</span></button>
          <button className="bnav-item" onClick={() => bnav('account')}><span className="bni">👤</span><span>Compte</span></button>
        </div>
      </nav>

      {/* ── MODALS ── */}
      {showAdd && <RestoModal fb={fb} user={user} allCriteria={allCriteria} onClose={() => setShowAdd(false)} onToast={T} />}
      {editR   && <RestoModal fb={fb} user={user} resto={editR} allCriteria={allCriteria} onClose={() => setEditR(null)} onToast={T} />}
      {detailR && <RestoDetail fb={fb} user={user} resto={detailR} onClose={() => setDetailR(null)} onToast={T} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
