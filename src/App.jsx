import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const categories = [
  { key:"all", label:"All materials", icon:"🧱" },
  { key:"cement", label:"Cement & blocks", icon:"🏗️" },
  { key:"sand", label:"Sand & ballast", icon:"⛏️" },
  { key:"steel", label:"Steel & iron", icon:"🔩" },
  { key:"timber", label:"Timber & roofing", icon:"🪵" },
  { key:"stones", label:"Quarry stones", icon:"🪨" },
  { key:"paint", label:"Paint & finishes", icon:"🎨" },
];

const allMaterials = [
  "Cement","Sand","Ballast","Quarry stones","Steel bars","Iron sheets",
  "Timber","Roofing sheets","Hollow blocks","Paint","Tiles","Plumbing fittings",
  "Hardcore","Chippings","Fascia boards","Wire mesh"
];

const sampleSuppliers = [
  { name:"Kamau Hardware", town:"Thika", phone:"0712345678", whatsapp:"254712345678", verified:true, open:true, category:"cement", rating:4.8, reviews:63, products:[{name:"Cement (Bamburi 50kg)",price:"KES 820"},{name:"River sand (tonne)",price:"KES 1,800"},{name:"Y12 steel (tonne)",price:"KES 115,000"}]},
  { name:"Githurai Builders Mart", town:"Thika", phone:"0723456789", whatsapp:"254723456789", verified:true, open:true, category:"cement", rating:4.5, reviews:41, products:[{name:"Cement (Mombasa 50kg)",price:"KES 800"},{name:"Hollow blocks (6 inch)",price:"KES 55/pc"},{name:"Ballast (tonne)",price:"KES 2,200"}]},
  { name:"Muigai Sand & Ballast", town:"Thika", phone:"0734567890", whatsapp:"254734567890", verified:false, open:true, category:"sand", rating:4.2, reviews:28, products:[{name:"River sand (tonne)",price:"KES 1,600"},{name:"Ballast (tonne)",price:"KES 2,000"},{name:"Hardcore (tonne)",price:"KES 1,400"}]},
  { name:"Thika Steel Centre", town:"Thika", phone:"0745678901", whatsapp:"254745678901", verified:true, open:false, category:"steel", rating:4.7, reviews:55, products:[{name:"Y12 deformed bar (tonne)",price:"KES 112,000"},{name:"Y16 deformed bar (tonne)",price:"KES 113,500"},{name:"Iron sheets (28G 8ft)",price:"KES 1,950/pc"}]},
  { name:"Njogu Quarry & Stones", town:"Thika", phone:"0756789012", whatsapp:"254756789012", verified:true, open:true, category:"stones", rating:4.4, reviews:19, products:[{name:"Quarry stones (tonne)",price:"KES 3,200"},{name:"Chippings (tonne)",price:"KES 2,800"},{name:"Dust (tonne)",price:"KES 1,200"}]},
  { name:"Timber World Thika", town:"Thika", phone:"0767890123", whatsapp:"254767890123", verified:true, open:true, category:"timber", rating:4.6, reviews:37, products:[{name:"Timber 2x3 (piece)",price:"KES 320"},{name:"Roofing sheets (box profile)",price:"KES 1,750/pc"},{name:"Fascia board (piece)",price:"KES 580"}]},
];

const defaultReg = { name:"", town:"Thika", phone:"", whatsapp:"", materials:[] };
const defaultQuote = { material:"Cement (bags)", qty:"", location:"", phone:"", notes:"" };

export default function App() {
  const [page, setPage] = useState("home");
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteForm, setQuoteForm] = useState(defaultQuote);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [regForm, setRegForm] = useState(defaultReg);
  const [regStep, setRegStep] = useState(1); // 1=form, 2=success
  const [regLoading, setRegLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => { loadSuppliers(); }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*, products(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setSuppliers(data);
      } else {
        await seedSampleData();
      }
    } catch (err) {
      console.error(err);
      setSuppliers(sampleSuppliers.map((s, i) => ({ ...s, id: i + 1 })));
    }
    setLoading(false);
  };

  const seedSampleData = async () => {
    for (const s of sampleSuppliers) {
      const { data: sup } = await supabase
        .from("suppliers")
        .insert({ name:s.name, town:s.town, phone:s.phone, whatsapp:s.whatsapp, verified:s.verified, open:s.open, category:s.category, rating:s.rating, reviews:s.reviews })
        .select().single();
      if (sup) {
        await supabase.from("products").insert(s.products.map(p => ({ supplier_id:sup.id, name:p.name, price:p.price })));
      }
    }
    const { data } = await supabase.from("suppliers").select("*, products(*)");
    if (data) setSuppliers(data);
  };

  const toggleMaterial = (mat) => {
    setRegForm(prev => ({
      ...prev,
      materials: prev.materials.includes(mat)
        ? prev.materials.filter(m => m !== mat)
        : [...prev.materials, mat]
    }));
  };

  const submitReg = async () => {
    if (!regForm.name || !regForm.phone) {
      showToast("Please fill in shop name and phone number");
      return;
    }
    if (regForm.materials.length === 0) {
      showToast("Please select at least one material you sell");
      return;
    }
    setRegLoading(true);
    const category = regForm.materials[0].toLowerCase().includes("cement") ? "cement"
      : regForm.materials[0].toLowerCase().includes("sand") || regForm.materials[0].toLowerCase().includes("ballast") ? "sand"
      : regForm.materials[0].toLowerCase().includes("steel") || regForm.materials[0].toLowerCase().includes("iron") ? "steel"
      : regForm.materials[0].toLowerCase().includes("timber") || regForm.materials[0].toLowerCase().includes("roof") ? "timber"
      : regForm.materials[0].toLowerCase().includes("stone") ? "stones" : "cement";

    const { error } = await supabase.from("suppliers").insert({
      name: regForm.name,
      town: regForm.town,
      phone: regForm.phone,
      whatsapp: regForm.whatsapp || regForm.phone,
      verified: false,
      open: true,
      category,
      rating: 0,
      reviews: 0,
    });
    setRegLoading(false);
    if (error) {
      showToast("Error submitting. Please try again.");
      console.error(error);
      return;
    }
    setRegStep(2);
    loadSuppliers();
  };

  const submitQuote = async () => {
    if (!quoteForm.qty || !quoteForm.location || !quoteForm.phone) {
      showToast("Please fill in quantity, location and phone number");
      return;
    }
    setQuoteLoading(true);
    const { error } = await supabase.from("quotes").insert({
      material: quoteForm.material,
      quantity: quoteForm.qty,
      location: quoteForm.location,
      phone: quoteForm.phone,
      notes: quoteForm.notes,
    });
    setQuoteLoading(false);
    if (error) { showToast("Error submitting. Please try again."); return; }
    setQuoteSubmitted(true);
  };

  const filtered = suppliers.filter(s => {
    const matchCat = cat === "all" || s.category === cat;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.products || []).some(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const s = (extra={}) => ({ width:"100%", padding:"9px 12px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"14px", boxSizing:"border-box", fontFamily:"system-ui,sans-serif", ...extra });

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", background:"#f5f5f5", color:"#1a1a1a" }}>

      {/* Topbar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #eee", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"56px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ fontSize:"20px", fontWeight:"700", color:"#1D9E75", cursor:"pointer" }} onClick={() => setPage("home")}>Jenga<span style={{ color:"#1a1a1a" }}>Hub</span></div>
        <div style={{ display:"flex", gap:"4px" }}>
          {["home","quotes","supplier"].map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ padding:"6px 14px", borderRadius:"8px", border:"none", background: page===p ? "#f0f0f0" : "none", fontWeight: page===p ? "600" : "400", cursor:"pointer", fontSize:"13px", color: page===p ? "#1a1a1a" : "#666" }}>
              {p === "home" ? "Find suppliers" : p === "quotes" ? "Get quotes" : "List your shop"}
            </button>
          ))}
        </div>
        <button style={{ padding:"7px 16px", borderRadius:"8px", background:"#1D9E75", color:"#fff", border:"none", fontWeight:"600", cursor:"pointer", fontSize:"13px" }}>Get started</button>
      </div>

      {/* HOME */}
      {page === "home" && (
        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"24px 20px" }}>
          <div style={{ background:"linear-gradient(135deg,#1D9E75,#0F6E56)", borderRadius:"12px", padding:"36px 32px", color:"#fff", marginBottom:"24px" }}>
            <h1 style={{ fontSize:"26px", fontWeight:"700", marginBottom:"8px", lineHeight:"1.3" }}>Find building materials in Thika — at the best price</h1>
            <p style={{ fontSize:"14px", opacity:"0.85", marginBottom:"20px" }}>Compare prices from verified hardware shops, quarries and raw material suppliers. No middlemen.</p>
            <div style={{ display:"flex", gap:"8px", maxWidth:"540px" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cement, sand, ballast, steel..." style={{ flex:1, padding:"10px 14px", borderRadius:"8px", border:"none", fontSize:"14px", outline:"none" }} />
              <button style={{ padding:"10px 20px", background:"#fff", color:"#1D9E75", border:"none", borderRadius:"8px", fontWeight:"700", fontSize:"14px", cursor:"pointer" }}>Search</button>
            </div>
          </div>

          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"20px" }}>
            {categories.map(c => (
              <button key={c.key} onClick={() => setCat(c.key)} style={{ padding:"7px 14px", borderRadius:"20px", border: cat===c.key ? "1.5px solid #1D9E75" : "1px solid #ddd", background: cat===c.key ? "#E1F5EE" : "#fff", color: cat===c.key ? "#0F6E56" : "#555", fontSize:"13px", cursor:"pointer", fontWeight: cat===c.key ? "600" : "400" }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:"40px", color:"#999" }}>⏳ Loading suppliers...</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"12px" }}>
              {filtered.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"40px", color:"#999" }}>No suppliers found. Try a different search or category.</div>}
              {filtered.map((sup, idx) => (
                <div key={sup.id || idx} style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"16px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"10px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <div style={{ width:"42px", height:"42px", borderRadius:"8px", background:"#E1F5EE", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700", color:"#0F6E56", fontSize:"14px", flexShrink:0 }}>
                        {sup.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <div style={{ fontWeight:"600", fontSize:"14px" }}>{sup.name}</div>
                        <div style={{ fontSize:"12px", color:"#888" }}>📍 {sup.town}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:"3px", alignItems:"flex-end" }}>
                      {sup.verified && <span style={{ fontSize:"11px", background:"#E1F5EE", color:"#0F6E56", padding:"2px 7px", borderRadius:"8px", fontWeight:"600" }}>✓ Verified</span>}
                      <span style={{ fontSize:"11px", background: sup.open ? "#EAF3DE" : "#f5f5f5", color: sup.open ? "#3B6D11" : "#999", padding:"2px 7px", borderRadius:"8px" }}>{sup.open ? "Open" : "Closed"}</span>
                    </div>
                  </div>
                  {sup.rating > 0 && <div style={{ fontSize:"12px", color:"#888", marginBottom:"10px" }}>⭐ {sup.rating} ({sup.reviews} reviews)</div>}
                  {(sup.products || []).length > 0 && (
                    <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:"10px", display:"flex", flexDirection:"column", gap:"6px", marginBottom:"12px" }}>
                      {(sup.products || []).map((item, i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:"13px" }}>
                          <span style={{ color:"#666" }}>{item.name}</span>
                          <span style={{ fontWeight:"600" }}>{item.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display:"flex", gap:"6px" }}>
                    <a href={`https://wa.me/${sup.whatsapp}`} target="_blank" rel="noreferrer" style={{ flex:1, padding:"7px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"12px", textAlign:"center", textDecoration:"none", color:"#555" }}>💬 WhatsApp</a>
                    <a href={`tel:${sup.phone}`} style={{ flex:1, padding:"7px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"12px", textAlign:"center", textDecoration:"none", color:"#555" }}>📞 Call</a>
                    <button onClick={() => setPage("quotes")} style={{ flex:1, padding:"7px", borderRadius:"8px", border:"none", background:"#1D9E75", color:"#fff", fontSize:"12px", cursor:"pointer", fontWeight:"600" }}>Get quote</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUOTES */}
      {page === "quotes" && (
        <div style={{ maxWidth:"700px", margin:"0 auto", padding:"24px 20px" }}>
          <h2 style={{ fontSize:"18px", fontWeight:"700", marginBottom:"4px" }}>Request quotes from multiple suppliers</h2>
          <p style={{ fontSize:"14px", color:"#888", marginBottom:"20px" }}>Fill in what you need — all matching suppliers in Thika will receive your request.</p>
          {!quoteSubmitted ? (
            <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"20px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Material needed</label>
                  <select value={quoteForm.material} onChange={e => setQuoteForm({...quoteForm, material:e.target.value})} style={s()}>
                    <option>Cement (bags)</option><option>River sand (tonnes)</option><option>Ballast (tonnes)</option>
                    <option>Quarry stones (tonnes)</option><option>Steel Y12 (tonnes)</option><option>Roofing sheets</option><option>Timber (pieces)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Quantity</label>
                  <input type="number" placeholder="e.g. 200" value={quoteForm.qty} onChange={e => setQuoteForm({...quoteForm, qty:e.target.value})} style={s()} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Your phone number</label>
                  <input placeholder="07xx xxx xxx" value={quoteForm.phone} onChange={e => setQuoteForm({...quoteForm, phone:e.target.value})} style={s()} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Delivery location</label>
                  <input placeholder="e.g. Thika, near Blue Post Hotel" value={quoteForm.location} onChange={e => setQuoteForm({...quoteForm, location:e.target.value})} style={s()} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Additional notes (optional)</label>
                  <textarea placeholder="e.g. need delivery included..." value={quoteForm.notes} onChange={e => setQuoteForm({...quoteForm, notes:e.target.value})} style={s({ minHeight:"80px", resize:"vertical" })} />
                </div>
              </div>
              <button onClick={submitQuote} disabled={quoteLoading} style={{ width:"100%", padding:"11px", background:"#1D9E75", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"700", fontSize:"14px", cursor:"pointer", opacity: quoteLoading ? 0.7 : 1 }}>
                {quoteLoading ? "Sending..." : "Send to all matching suppliers →"}
              </button>
            </div>
          ) : (
            <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"32px", textAlign:"center" }}>
              <div style={{ fontSize:"48px", marginBottom:"12px" }}>✅</div>
              <h3 style={{ fontSize:"16px", fontWeight:"700", marginBottom:"6px" }}>Quote request sent!</h3>
              <p style={{ fontSize:"14px", color:"#888", marginBottom:"20px" }}>Your request for <strong>{quoteForm.qty} {quoteForm.material}</strong> has been saved. Suppliers will contact you on <strong>{quoteForm.phone}</strong> within 2 hours.</p>
              <button onClick={() => { setQuoteSubmitted(false); setQuoteForm(defaultQuote); }} style={{ padding:"9px 20px", background:"#1D9E75", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"600", fontSize:"14px", cursor:"pointer" }}>Send another request</button>
            </div>
          )}
        </div>
      )}

      {/* SUPPLIER REGISTRATION */}
      {page === "supplier" && (
        <div style={{ maxWidth:"600px", margin:"0 auto", padding:"24px 20px" }}>
          <h2 style={{ fontSize:"18px", fontWeight:"700", marginBottom:"4px" }}>List your shop on Jenga Hub</h2>
          <p style={{ fontSize:"14px", color:"#888", marginBottom:"20px" }}>Reach builders looking for materials in Thika. Free for the first 3 months.</p>

          {/* Pricing */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"24px" }}>
            {[
              { name:"Starter", price:"Free", sub:"3 months", feats:["Shop profile","Up to 10 products","Buyer inquiries"] },
              { name:"Growth", price:"KES 2,500", sub:"/month", feats:["Unlimited products","Quote requests","Priority listing","Analytics"], featured:true },
              { name:"Pro", price:"KES 5,000", sub:"/month", feats:["Featured placement","Bulk order leads","M-Pesa integration","Dedicated support"] },
            ].map(plan => (
              <div key={plan.name} style={{ background:"#fff", border: plan.featured ? "2px solid #1D9E75" : "1px solid #eee", borderRadius:"12px", padding:"14px" }}>
                {plan.featured && <div style={{ fontSize:"11px", background:"#E1F5EE", color:"#0F6E56", padding:"2px 8px", borderRadius:"8px", display:"inline-block", marginBottom:"6px", fontWeight:"600" }}>Most popular</div>}
                <div style={{ fontWeight:"600", fontSize:"13px", marginBottom:"3px" }}>{plan.name}</div>
                <div style={{ fontSize:"18px", fontWeight:"700", color:"#1D9E75" }}>{plan.price} <span style={{ fontSize:"12px", color:"#888", fontWeight:"400" }}>{plan.sub}</span></div>
                <div style={{ marginTop:"8px", fontSize:"12px", color:"#666", lineHeight:"1.9" }}>{plan.feats.map(f => <div key={f}>✓ {f}</div>)}</div>
                <button onClick={() => showToast(`${plan.name} plan selected!`)} style={{ width:"100%", marginTop:"10px", padding:"7px", background:"#1D9E75", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"600", fontSize:"12px", cursor:"pointer" }}>Select</button>
              </div>
            ))}
          </div>

          {regStep === 1 ? (
            <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"20px" }}>
              <div style={{ fontWeight:"700", fontSize:"15px", marginBottom:"16px" }}>Register your shop</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Shop name *</label>
                  <input placeholder="e.g. Kamau Hardware" value={regForm.name} onChange={e => setRegForm({...regForm, name:e.target.value})} style={s()} />
                </div>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Town *</label>
                  <select value={regForm.town} onChange={e => setRegForm({...regForm, town:e.target.value})} style={s()}>
                    <option>Thika</option><option>Ruiru</option><option>Juja</option><option>Kitengela</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Phone number *</label>
                  <input placeholder="07xx xxx xxx" value={regForm.phone} onChange={e => setRegForm({...regForm, phone:e.target.value})} style={s()} />
                </div>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>WhatsApp number</label>
                  <input placeholder="07xx xxx xxx" value={regForm.whatsapp} onChange={e => setRegForm({...regForm, whatsapp:e.target.value})} style={s()} />
                </div>
              </div>

              {/* Materials selector */}
              <div style={{ marginBottom:"16px" }}>
                <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"8px" }}>What materials do you sell? * (select all that apply)</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {allMaterials.map(mat => (
                    <button key={mat} onClick={() => toggleMaterial(mat)} style={{ padding:"6px 12px", borderRadius:"20px", border: regForm.materials.includes(mat) ? "1.5px solid #1D9E75" : "1px solid #ddd", background: regForm.materials.includes(mat) ? "#E1F5EE" : "#f9f9f9", color: regForm.materials.includes(mat) ? "#0F6E56" : "#555", fontSize:"12px", cursor:"pointer", fontWeight: regForm.materials.includes(mat) ? "600" : "400" }}>
                      {regForm.materials.includes(mat) ? "✓ " : ""}{mat}
                    </button>
                  ))}
                </div>
                {regForm.materials.length > 0 && (
                  <div style={{ fontSize:"12px", color:"#1D9E75", marginTop:"8px", fontWeight:"600" }}>
                    Selected: {regForm.materials.join(", ")}
                  </div>
                )}
              </div>

              <button onClick={submitReg} disabled={regLoading} style={{ width:"100%", padding:"11px", background:"#1D9E75", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"700", fontSize:"14px", cursor:"pointer", opacity: regLoading ? 0.7 : 1 }}>
                {regLoading ? "Submitting..." : "Submit registration →"}
              </button>
            </div>
          ) : (
            <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"32px", textAlign:"center" }}>
              <div style={{ fontSize:"48px", marginBottom:"12px" }}>🎉</div>
              <h3 style={{ fontSize:"16px", fontWeight:"700", marginBottom:"6px" }}>Registration received!</h3>
              <p style={{ fontSize:"14px", color:"#888", marginBottom:"20px" }}>Welcome to Jenga Hub! We'll contact <strong>{regForm.name}</strong> on <strong>{regForm.phone}</strong> within 24 hours to verify your shop and get you listed.</p>
              <button onClick={() => { setRegStep(1); setRegForm(defaultReg); }} style={{ padding:"9px 20px", background:"#1D9E75", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"600", fontSize:"14px", cursor:"pointer" }}>Register another shop</button>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div style={{ position:"fixed", bottom:"20px", right:"20px", background:"#1D9E75", color:"#fff", padding:"10px 18px", borderRadius:"8px", fontSize:"13px", fontWeight:"500", zIndex:999 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
