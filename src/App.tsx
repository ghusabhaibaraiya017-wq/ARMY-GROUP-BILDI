import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'

const languages = [
  ['gu','ગુજરાતી'],['hi','हिन्दी'],['bn','বাংলা'],['mr','मराठी'],['ta','தமிழ்'],['te','తెలుగు'],
  ['kn','ಕನ್ನಡ'],['ml','മലയാളം'],['pa','ਪੰਜਾਬੀ'],['ur','اردو'],['or','ଓଡ଼ିଆ'],['as','অসমীয়া'],
  ['kok','कोंकणी'],['mai','मैथिली'],['mni','মৈতৈলোন্'],['ne','नेपाली'],['ks','कॉशुर'],
  ['sat','ᱥᱟᱱᱛᱟᱲᱤ'],['sd','سنڌي'],['brx','बड़ो'],['doi','डोगरी']
] as const
const fallbackCategories = [
  ['youth','યુવાનો','👥'],['students','વિદ્યાર્થીઓ','🎓'],['farmers','ખેડૂતો','🌾'],
  ['jobs','સરકારી નોકરી','💼'],['disability-support','દિવ્યાંગ સહાય','♿'],
  ['schemes','સરકારી યોજનાઓ','🏛️'],['education','શિક્ષણ','📚'],['agriculture','ખેતી','🚜']
]
type Post = { id:string; slug:string; original_title:string; original_description:string; translatedTitle?:string; translatedDescription?:string; published_at:string|null; is_featured:boolean; categories?:{name:string;slug:string}|null }
export default function App() {
  const [language,setLanguage] = useState(localStorage.getItem('agb-language') || 'gu')
  const [category,setCategory] = useState('')
  const [search,setSearch] = useState('')
  const [posts,setPosts] = useState<Post[]>([])
  const [loading,setLoading] = useState(false)
  const [dark,setDark] = useState(false)
  const [selected,setSelected] = useState<Post|null>(null)
  const [notice,setNotice] = useState('')
  useEffect(() => {
    localStorage.setItem('agb-language',language)
  },[language])
  useEffect(() => {
    if (!supabase) return
    let active = true
    setLoading(true)
    async function fetchFeed() {
      const {data,error} = await supabase.from('posts').select('id,slug,original_title,original_description,published_at,is_featured,categories(name,slug)')
        .eq('status','published').not('published_at','is',null).lte('published_at',new Date().toISOString())
        .order('published_at',{ascending:false}).limit(40)
      if (!active) return
      if (error) setNotice('માહિતી લોડ થઈ શકી નથી. કૃપા કરીને પછી ફરી પ્રયાસ કરો.')
      else {
        let rows = (data || []) as unknown as Post[]
        if (language !== 'gu' && rows.length) {
          const {data:translations} = await supabase.from('post_translations')
            .select('post_id,title,description,translation_status')
            .in('post_id',rows.map(p=>p.id)).eq('language_code',language)
            .in('translation_status',['reviewed','published'])
          const byPost = new Map((translations || []).map(t=>[t.post_id,t]))
          rows = rows.map(p=>({...p,translatedTitle:byPost.get(p.id)?.title,translatedDescription:byPost.get(p.id)?.description}))
        }
        if (active) setPosts(rows)
      }
      if (active) setLoading(false)
    }
    fetchFeed()
    return () => { active = false }
  },[language])
  const visible = useMemo(() => posts.filter(p =>
    (!category || p.categories?.slug === category) &&
    ((p.translatedTitle || p.original_title).toLowerCase().includes(search.toLowerCase()) || (p.translatedDescription || p.original_description).toLowerCase().includes(search.toLowerCase()))
  ),[posts,category,search])
  const activeLanguage = languages.find(x=>x[0]===language)?.[1] || 'ગુજરાતી'
  return <main className={dark?'app dark':'app'}>
    <header className="topbar">
      <div className="brand-mark">🇮🇳</div>
      <div className="brand"><strong>ARMY GROUP BILDI</strong><span>માહિતી દરેક માટે, દરેક ભાષામાં, દરરોજ.</span></div>
      <div className="top-actions">
        <select aria-label="ભાષા પસંદ કરો" value={language} onChange={e=>setLanguage(e.target.value)}>{languages.map(([code,name])=><option key={code} value={code}>{name}</option>)}</select>
        <button className="icon-button" onClick={()=>setDark(!dark)} aria-label="થીમ બદલો">{dark?'☀️':'🌙'}</button>
      </div>
    </header>
    <section className="hero">
      <div className="flag-line"><i/><i/><i/></div>
      <p className="eyebrow">ભારત માટે વિશ્વસનીય માહિતી</p>
      <h1>માહિતી દરેક માટે.<br/><em>દરેક ભાષામાં.</em></h1>
      <p className="hero-copy">યુવાનો, વિદ્યાર્થીઓ, ખેડૂતો અને નોકરી શોધનારાઓ માટે ઉપયોગી માહિતી એક જ જગ્યાએ.</p>
      <div className="search-box"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="નોકરી, યોજના, શિક્ષણ વિશે શોધો..." /></div>
    </section>
    <section className="section">
      <div className="section-heading"><div><p className="eyebrow">તમારા માટે</p><h2>મુખ્ય વિભાગો</h2></div><span className="language-pill">{activeLanguage}</span></div>
      <div className="category-grid">{fallbackCategories.map(([slug,label,icon])=><button key={slug} onClick={()=>setCategory(category===slug?'':slug)} className={category===slug?'category-card chosen':'category-card'}><span>{icon}</span><b>{label}</b><small>માહિતી જુઓ ↗</small></button>)}</div>
    </section>
    <section className="section feed-section">
      <div className="section-heading"><div><p className="eyebrow">નવીનતમ અપડેટ</p><h2>{category?'પસંદ કરેલો વિભાગ':'તાજેતરની માહિતી'}</h2></div>{category&&<button className="text-button" onClick={()=>setCategory('')}>બધું જુઓ</button>}</div>
      {!supabase && <div className="notice">Supabase કનેક્શન સેટ કરવાનું બાકી છે. <code>.env</code> માં Project URL અને Publishable Key ઉમેર્યા પછી લાઇવ માહિતી દેખાશે.</div>}
      {notice&&<div className="notice">{notice}</div>}
      {loading&&<p className="muted">માહિતી લોડ થઈ રહી છે...</p>}
      {!loading&&supabase&&visible.length===0&&<div className="empty"><span>📭</span><b>હજુ પ્રકાશિત માહિતી ઉપલબ્ધ નથી</b><p>નવી માહિતી પ્રકાશિત થતાં અહીં દેખાશે.</p></div>}
      <div className="post-grid">{visible.map(post=><button className="post-card" key={post.id} onClick={()=>setSelected(post)}><span className="post-category">{post.categories?.name || 'માહિતી'}</span><h3>{post.translatedTitle || post.original_title}</h3><p>{post.translatedDescription || post.original_description}</p><small>{post.published_at?new Date(post.published_at).toLocaleDateString('gu-IN'):''} · સંપૂર્ણ માહિતી વાંચો ↗</small></button>)}</div>
    </section>
    <footer><b>🇮🇳 ARMY GROUP BILDI</b><span>સાચી માહિતી • દરેક નાગરિક માટે</span><small>© {new Date().getFullYear()} ARMY GROUP BILDI</small></footer>
    {selected&&<div className="modal-backdrop" role="presentation" onClick={()=>setSelected(null)}><article className="modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>✕</button><span className="post-category">{selected.categories?.name}</span><h2>{selected.translatedTitle || selected.original_title}</h2><p>{selected.translatedDescription || selected.original_description}</p><small>મૂળ માહિતી હાલમાં ગુજરાતી ભાષામાં ઉપલબ્ધ છે.</small></article></div>}
    <nav className="bottom-nav"><button className="active">⌂<span>હોમ</span></button><button onClick={()=>setCategory('jobs')}>▤<span>નોકરી</span></button><button onClick={()=>setCategory('schemes')}>◈<span>યોજનાઓ</span></button><button onClick={()=>setNotice('બુકમાર્ક માટે લોગિન સુવિધા આગળના તબક્કામાં ઉમેરાશે.')}>♡<span>સેવ</span></button></nav>
  </main>
}