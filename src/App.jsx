import { useState } from "react";

const SUPPLIERS = [
  { id:1, name:"Kamau Hardware", loc:"Thika Town", avatar:"KH", verified:true, open:true, cat:"cement", rating:4.8, reviews:63, phone:"0712345678", whatsapp:"254712345678", items:[{n:"Cement (Bamburi 50kg)",p:"KES 820"},{n:"River sand (tonne)",p:"KES 1,800"},{n:"Y12 steel (tonne)",p:"KES 115,000"}]},
  { id:2, name:"Githurai Builders Mart", loc:"Thika Rd, Km 18", avatar:"GB", verified:true, open:true, cat:"cement", rating:4.5, reviews:41, phone:"0723456789", whatsapp:"254723456789", items:[{n:"Cement (Mombasa 50kg)",p:"KES 800"},{n:"Hollow blocks (6 inch)",p:"KES 55/pc"},{n:"Ballast (tonne)",p:"KES 2,200"}]},
  { id:3, name:"Muigai Sand & Ballast", loc:"Thika River Road", avatar:"MS", verified:false, open:true, cat:"sand", rating:4.2, reviews:28, phone:"0734567890", whatsapp:"254734567890", items:[{n:"River sand (tonne)",p:"KES 1,600"},{n:"Ballast (tonne)",p:"KES 2,000"},{n:"Hardcore (tonne)",p:"KES 1,400"}]},
  { id:4, name:"Thika Steel Centre", loc:"Industrial Area, Thika", avatar:"TS", verified:true, open:false, cat:"steel", rating:4.7, reviews:55, phone:"0745678901", whatsapp:"254745678901", items:[{n:"Y12 deformed bar (tonne)",p:"KES 112,000"},{n:"Y16 deformed bar (tonne)",p:"KES 113,500"},{n:"Iron sheets (28G 8ft)",p:"KES 1,950/pc"}]},
  { id:5, name:"Njogu Quarry & Stones", loc:"Gatundu Road, Thika", avatar:"NQ", verified:true, open:true, cat:"stones", rating:4.4, reviews:19, phone:"0756789012", whatsapp:"254756789012", items:[{n:"Quarry stones (tonne)",p:"KES 3,200"},{n:"Chippings (tonne)",p:"KES 2,800"},{n:"Dust (tonne)",p:"KES 1,200"}]},
  { id:6, name:"Timber World Thika", loc:"Kenyatta Hwy, Thika", avatar:"TW", verified:true, open:true, cat:"timber", rating:4.6, reviews:37, phone:"0767890123", whatsapp:"254767890123", items:[{n:"Timber 2x3 (piece)",p:"KES 320"},{n:"Roofing sheets (box profile)",p:"KES 1,750/pc"},{n:"Fascia board (piece)",p:"KES 580"}]},
];

const CATS = [
  {id:"all",label:"All materials",icon:"🏗️"},
  {id:"cement",label:"Cement & blocks",icon:"🧱"},
  {id:"sand",label:"Sand & ballast",icon:"⛏️"},
  {id:"steel",label:"Steel & iron",icon:"🔩"},
  {id:"timber",label:"Timber & roofing",icon:"🪵"},
  {id:"stones",label:"Quarry stones",icon:"🪨"},
];

const s = {
  app:{fontFamily:"system-ui,sans-serif",minHeight:"100vh",background:"#f5f5f0",color:"#1a1a1a"},
  topbar:{background:"#fff",borderBottom:"1px solid #e8e8e0",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"56px",position:"sticky",top:0,zIndex:100},
  logo:{fontSize:"20px",fontWeight:"600",color:"#1D9E75"},
  nav:{display:"flex",gap:"4px"},
  navBtn:(active)=>({padding:"6px 14px",borderRadius:"8px",fontSize:"13px",cursor:"pointer",border:"none",background:active?"#f0f0e8":"none",color:active?"#1a1a1a":"#666",fontWeight:active?"500":"400"}),
  page:{maxWidth:"880px",margin:"0 auto",padding:"24px 16px"},
  hero:{background:"linear-gradient(135deg,#1D9E75,#0F6E56)",borderRadius:"12px",padding:"36px 28px",color:"#fff",marginBottom:"24px"},
  h1:{fontSize:"26px",fontWeight:"600",marginBottom:"8px",lineHeight:"1.2"},
  heroP:{fontSize:"14px",opacity:"0.85",marginBottom:"20px"},
  searchRow:{display:"flex",gap:"8px",flexWrap:"wrap"},
  searchInput:{flex:"1",minWidth:"200px",padding:"10px 14px",borderRadius:"8px",border:"none",fontSize:"14px",outline:"none"},
  searchSelect:{padding:"10px 12px",borderRadius:"8px",border:"none",fontSize:"14px",background:"#fff",cursor:"pointer"},
  searchBtn:{padding:"10px 20px",background:"#fff",color:"#1D9E75",border:"none",borderRadius:"8px",fontWeight:"600",fontSize:"14px",cursor:"pointer"},
  cats:{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"20px"},
  cat:(active)=>({padding:"7px 14px",borderRadius:"20px",border:`1px solid ${active?"#1D9E75":"#ddd"}`,fontSize:"13px",cursor:"pointer",background:active?"#e1f5ee":"#fff",color:active?"#0F6E56":"#555",display:"flex",alignItems:"center",gap:"6px"}),
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"12px",marginBottom:"24px"},
  card:{background:"#fff",border:"1px solid #e8e8e0",borderRadius:"12px",padding:"16px",cursor:"pointer",transition:"border-color 0.15s"},
  cardTop:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"12px"},
  avatar:{width:"42px",height:"42px",borderRadius:"8px",background:"#e1f5ee",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"600",color:"#0F6E56",flexShrink:0},
  shopInfo:{flex:1,marginLeft:"10px"},
  shopName:{fontSize:"14px",fontWeight:"600",marginBottom:"2px"},
  shopLoc:{fontSize:"12px",color:"#888"},
  badges:{display:"flex",flexDirection:"column",gap:"4px",alignItems:"flex-end"},
  badge:(color)=>({fontSize:"11px",padding:"2px 7px",borderRadius:"10px",fontWeight:"500",background:color==="green"?"#e1f5ee":color==="open"?"#eaf3de":"#f0f0e8",color:color==="green"?"#0F6E56":color==="open"?"#3B6D11":"#666"}),
  stars:{color:"#EF9F27",fontSize:"12px"},
  priceList:{borderTop:"1px solid #f0f0e8",paddingTop:"10px",display:"flex",flexDirection:"column",gap:"6px"},
  priceRow:{display:"flex",justifyContent:"space-between",fontSize:"13px"},
  priceItem:{color:"#666"},
  priceVal:{fontWeight:"500"},
  actions:{display:"flex",gap:"6px",marginTop:"12px"},
  actionBtn:(primary)=>({flex:1,padding:"7px",borderRadius:"8px",fontSize:"12px",cursor:"pointer",border:`1px solid ${primary?"#1D9E75":"#ddd"}`,background:primary?"#1D9E75":"none",color:primary?"#fff":"#555",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"}),
  sectionTitle:{fontSize:"16px",fontWeight:"600",marginBottom:"12px",marginTop:"4px"},
  statRow:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"24px"},
  statCard:{background:"#fff",border:"1px solid #e8e8e0",borderRadius:"10px",padding:"14px 16px"},
  statVal:{fontSize:"24px",fontWeight:"600",marginBottom:"2px",color:"#1D9E75"},
  statLbl:{fontSize:"12px",color:"#888"},
  quoteBox:{background:"#fff",border:"1px solid #e8e8e0",borderRadius:"12px",padding:"20px",marginBottom:"24px"},
  formGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"},
  formGroup:{display:"flex",flexDirection:"column",gap:"5px"},
  label:{fontSize:"12px",color:"#666",fontWeight:"500"},
  input:{padding:"9px 12px",borderRadius:"8px",border:"1px solid #ddd",fontSize:"14px",outline:"none"},
  textarea:{padding:"9px 12px",borderRadius:"8px",border:"1px solid #ddd",fontSize:"14px",outline:"none",minHeight:"80px",resize:"vertical"},
  submitBtn:{width:"100%",padding:"11px",background:"#1D9E75",color:"#fff",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:"pointer"},
  quoteItem:{background:"#fff",border:"1px solid #e8e8e0",borderRadius:"12px",padding:"14px 16px",display:"flex",alignItems:"center",gap:"12px",marginBottom:"8px"},
  quoteNum:{fontSize:"20px",fontWeight:"700",color:"#1D9E75",minWidth:"36px"},
  regBox:{background:"#fff",border:"1px solid #e8e8e0",borderRadius:"12px",padding:"20px",maxWidth:"540px"},
  steps:{display:"flex",gap:"6px",marginBottom:"20px"},
  step:(done)=>({flex:1,height:"4px",borderRadius:"2px",background:done?"#1D9E75":"#e8e8e0"}),
  pricingGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"24px"},
  pricingCard:(featured)=>({background:"#fff",border:`${featured?"2px solid #1D9E75":"1px solid #e8e8e0"}`,borderRadius:"12px",padding:"16px"}),
  planName:{fontSize:"13px",fontWeight:"600",marginBottom:"4px"},
  planPrice:{fontSize:"22px",fontWeight:"700",color:"#1D9E75",marginBottom:"8px"},
  planFeat:{fontSize:"12px",color:"#666",lineHeight:"2"},
  toast:{position:"fixed",bottom:"20px",right:"20px",background:"#1D9E75",color:"#fff",padding:"10px 18px",borderRadius:"8px",fontSize:"13px",zIndex:999},
};

export default function App() {
  const [page, setPage] = useState("home");
  const [cat, setCat] = useState("all");
  const [toast, setToast] = useState(null);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = SUPPLIERS.filter(s =>
    (cat === "all" || s.cat === cat) &&
    (search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.items.some(i => i.n.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div style={s.app}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div style={s.logo}>Jenga<span style={{color:"#1a1a1a"}}>Hub</span></div>
        <div style={s.nav}>
          <button style={s.navBtn(page==="home")} onClick={()=>setPage("home")}>Find suppliers</button>
          <button style={s.navBtn(page==="quotes")} onClick={()=>setPage("quotes")}>Get quotes</button>
          <button style={s.navBtn(page==="supplier")} onClick={()=>setPage("supplier")}>List your shop</button>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <button style={{...s.actionBtn(false),flex:"none",padding:"7px 14px"}} onClick={()=>showToast("Login coming soon!")}>Sign in</button>
          <button style={{...s.actionBtn(true),flex:"none",padding:"7px 14px"}} onClick={()=>showToast("Registration coming soon!")}>Get started</button>
        </div>
      </div>

      {/* HOME PAGE */}
      {page==="home" && (
        <div style={s.page}>
          <div style={s.hero}>
            <div style={s.h1}>Find building materials near you — at the best price</div>
            <div style={s.heroP}>Compare prices from verified hardware shops, quarries, and raw material suppliers in Thika. No middlemen.</div>
            <div style={s.searchRow}>
              <input style={s.searchInput} placeholder="Search cement, sand, ballast, steel..." value={search} onChange={e=>setSearch(e.target.value)} />
              <select style={s.searchSelect}><option>Thika</option><option>Ruiru</option><option>Juja</option></select>
              <button style={s.searchBtn}>Search</button>
            </div>
          </div>

          <div style={s.cats}>
            {CATS.map(c=>(
              <button key={c.id} style={s.cat(cat===c.id)} onClick={()=>setCat(c.id)}>
                <span>{c.icon}</span>{c.label}
              </button>
            ))}
          </div>

          {filtered.length===0 ? (
            <div style={{textAlign:"center",padding:"40px",color:"#aaa"}}>No suppliers found. Try a different search or category.</div>
          ) : (
            <div style={s.grid}>
              {filtered.map(sup=>(
                <div key={sup.id} style={s.card}>
                  <div style={s.cardTop}>
                    <div style={s.avatar}>{sup.avatar}</div>
                    <div style={s.shopInfo}>
                      <div style={s.shopName}>{sup.name}</div>
                      <div style={s.shopLoc}>📍 {sup.loc}</div>
                    </div>
                    <div style={s.badges}>
                      {sup.verified && <span style={s.badge("green")}>✓ Verified</span>}
                      <span style={s.badge(sup.open?"open":"closed")}>{sup.open?"Open":"Closed"}</span>
                    </div>
                  </div>
                  <div style={{...s.stars,marginBottom:"8px"}}>
                    {"★".repeat(Math.floor(sup.rating))}{"☆".repeat(5-Math.floor(sup.rating))}
                    <span style={{color:"#888",fontSize:"12px",marginLeft:"4px"}}>{sup.rating} ({sup.reviews} reviews)</span>
                  </div>
                  <div style={s.priceList}>
                    {sup.items.map((item,i)=>(
                      <div key={i} style={s.priceRow}>
                        <span style={s.priceItem}>{item.n}</span>
                        <span style={s.priceVal}>{item.p}</span>
                      </div>
                    ))}
                  </div>
                  <div style={s.actions}>
                    <button style={s.actionBtn(false)} onClick={()=>window.open(`https://wa.me/${sup.whatsapp}`)}>💬 WhatsApp</button>
                    <button style={s.actionBtn(false)} onClick={()=>window.open(`tel:${sup.phone}`)}>📞 Call</button>
                    <button style={s.actionBtn(true)} onClick={()=>showToast("Quote request sent to "+sup.name+"!")}>Get quote</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUOTES PAGE */}
      {page==="quotes" && (
        <div style={s.page}>
          <div style={s.statRow}>
            <div style={s.statCard}><div style={s.statVal}>6</div><div style={s.statLbl}>Suppliers in Thika</div></div>
            <div style={s.statCard}><div style={s.statVal}>1</div><div style={s.statLbl}>Town covered</div></div>
            <div style={s.statCard}><div style={s.statVal}>Free</div><div style={s.statLbl}>To get quotes</div></div>
          </div>

          <div style={s.sectionTitle}>Request quotes from multiple suppliers at once</div>
          <div style={s.quoteBox}>
            <div style={s.formGrid}>
              <div style={s.formGroup}>
                <label style={s.label}>Material needed</label>
                <select style={s.input}><option>Cement (bags)</option><option>River sand (tonnes)</option><option>Ballast (tonnes)</option><option>Quarry stones (tonnes)</option><option>Steel Y12 (tonnes)</option><option>Roofing sheets</option><option>Timber (pieces)</option></select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Quantity</label>
                <input style={s.input} type="number" placeholder="e.g. 200" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Delivery location</label>
                <input style={s.input} type="text" placeholder="e.g. Thika, near Blue Post" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Needed by</label>
                <input style={s.input} type="date" />
              </div>
              <div style={{...s.formGroup,gridColumn:"1/-1"}}>
                <label style={s.label}>Additional notes (optional)</label>
                <textarea style={s.textarea} placeholder="e.g. need delivery included, or I can pick up..." />
              </div>
            </div>
            <button style={s.submitBtn} onClick={()=>showToast("Quote request sent to all matching suppliers!")}>Send to all matching suppliers →</button>
          </div>

          <div style={s.sectionTitle}>Sample quotes — 200 bags of cement in Thika</div>
          {[
            {rank:1,name:"Githurai Builders Mart",price:"KES 160,000",unit:"200 bags @ KES 800",rating:4.5,delivery:"Pick-up only",tags:["Mombasa cement","Verified"]},
            {rank:2,name:"Kamau Hardware",price:"KES 164,000",unit:"200 bags @ KES 820",rating:4.8,delivery:"Delivery available — KES 3,500",tags:["Bamburi","Verified"]},
            {rank:3,name:"Thika Cement Depot",price:"KES 158,000",unit:"200 bags @ KES 790",rating:3.9,delivery:"Delivery available — KES 4,000",tags:["Bamburi"]},
          ].map(q=>(
            <div key={q.rank} style={s.quoteItem}>
              <div style={s.quoteNum}>#{q.rank}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:"14px",fontWeight:"600"}}>{q.name} — <span style={{color:"#1D9E75"}}>{q.price}</span></div>
                <div style={{fontSize:"12px",color:"#888",marginTop:"2px"}}>{q.unit} · {q.delivery}</div>
                <div style={{marginTop:"6px",display:"flex",gap:"4px"}}>
                  {q.tags.map(t=><span key={t} style={{fontSize:"11px",padding:"2px 8px",borderRadius:"8px",background:"#f0f0e8",color:"#666"}}>{t}</span>)}
                </div>
              </div>
              <button style={{...s.actionBtn(true),flex:"none",padding:"8px 14px",whiteSpace:"nowrap"}} onClick={()=>showToast("Contacting "+q.name+"!")}>Accept quote</button>
            </div>
          ))}
        </div>
      )}

      {/* SUPPLIER PAGE */}
      {page==="supplier" && (
        <div style={s.page}>
          <div style={s.sectionTitle}>List your shop on Jenga Hub</div>
          <p style={{fontSize:"14px",color:"#666",marginBottom:"20px"}}>Reach builders looking for materials in Thika. Free for the first 3 months.</p>

          <div style={s.pricingGrid}>
            {[
              {name:"Starter",price:"Free",sub:"3 months",feats:["Shop profile","Up to 10 products","Buyer inquiries","Basic listing"],featured:false},
              {name:"Growth",price:"KES 2,500",sub:"per month",feats:["Everything in Starter","Unlimited products","Quote requests","Priority listing","Analytics"],featured:true},
              {name:"Pro",price:"KES 5,000",sub:"per month",feats:["Everything in Growth","Featured placement","Bulk order leads","M-Pesa integration","Dedicated support"],featured:false},
            ].map(p=>(
              <div key={p.name} style={s.pricingCard(p.featured)}>
                {p.featured && <div style={{background:"#e1f5ee",color:"#0F6E56",fontSize:"11px",padding:"2px 8px",borderRadius:"8px",display:"inline-block",marginBottom:"8px"}}>Most popular</div>}
                <div style={s.planName}>{p.name}</div>
                <div style={s.planPrice}>{p.price} <span style={{fontSize:"12px",color:"#888",fontWeight:"400"}}>/ {p.sub}</span></div>
                <div style={s.planFeat}>{p.feats.map(f=><div key={f}>✓ {f}</div>)}</div>
                <button style={{...s.submitBtn,marginTop:"12px"}} onClick={()=>showToast("Registering for "+p.name+" plan!")}>Get started</button>
              </div>
            ))}
          </div>

          <div style={s.sectionTitle}>Register your shop</div>
          <div style={s.regBox}>
            <div style={s.steps}>
              <div style={s.step(step>=1)}></div>
              <div style={s.step(step>=2)}></div>
              <div style={s.step(step>=3)}></div>
            </div>
            {step===1 && (
              <>
                <div style={s.formGrid}>
                  <div style={s.formGroup}><label style={s.label}>Shop name</label><input style={s.input} placeholder="e.g. Kamau Hardware" /></div>
                  <div style={s.formGroup}><label style={s.label}>Town</label><select style={s.input}><option>Thika</option><option>Ruiru</option><option>Juja</option></select></div>
                  <div style={s.formGroup}><label style={s.label}>Phone number</label><input style={s.input} placeholder="07xx xxx xxx" /></div>
                  <div style={s.formGroup}><label style={s.label}>WhatsApp number</label><input style={s.input} placeholder="07xx xxx xxx" /></div>
                </div>
                <button style={s.submitBtn} onClick={()=>setStep(2)}>Continue →</button>
              </>
            )}
            {step===2 && (
              <>
                <p style={{fontSize:"13px",color:"#666",marginBottom:"12px"}}>What materials do you sell?</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"16px"}}>
                  {["Cement","Sand","Ballast","Quarry stones","Steel","Timber","Roofing sheets","Paint","Tiles","Plumbing"].map(m=>(
                    <span key={m} style={{padding:"6px 14px",borderRadius:"16px",border:"1px solid #ddd",fontSize:"13px",cursor:"pointer",background:"#f5f5f0"}}>{m}</span>
                  ))}
                </div>
                <button style={s.submitBtn} onClick={()=>setStep(3)}>Continue →</button>
              </>
            )}
            {step===3 && (
              <>
                <p style={{fontSize:"13px",color:"#666",marginBottom:"12px"}}>Add your first product and price</p>
                <div style={s.formGrid}>
                  <div style={s.formGroup}><label style={s.label}>Product name</label><input style={s.input} placeholder="e.g. Cement 50kg bag" /></div>
                  <div style={s.formGroup}><label style={s.label}>Price (KES)</label><input style={s.input} type="number" placeholder="e.g. 820" /></div>
                </div>
                <button style={s.submitBtn} onClick={()=>showToast("Shop registered! Welcome to Jenga Hub 🎉")}>Submit registration →</button>
              </>
            )}
          </div>
        </div>
      )}

      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}
