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

const defaultQuote = { material:"Cement (bags)", qty:"", location:"", phone:"", notes:"" };
const defaultReg = { name:"", town:"Thika", phone:"", whatsapp:"", materials:[] };

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
  const [regStep, setRegStep] = useState(1);
  const [regLoading, setRegLoading] = useState(false);

  // Supplier dashboard state
  const [supplierUser, setSupplierUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ phone:"", pin:"" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [dashProducts, setDashProducts] = useState([]);
  const [dashQuotes, setDashQuotes] = useState([]);
  const [newProduct, setNewProduct] = useState({ name:"", price:"" });
  const [addingProduct, setAddingProduct] = useState(false);
  const [dashLoading, setDashLoading] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => { loadSuppliers(); }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("suppliers").select("*, products(*)").order("created_at", { ascending:false });
      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      console.error(err);
      setSuppliers([]);
    }
    setLoading(false);
  };

  const loadDashboard = async (supplierId) => {
    setDashLoading(true);
    const { data: prods } = await supabase.from("products").select("*").eq("supplier_id", supplierId);
    const { data: quotes } = await supabase.from("quotes").select("*").order("created_at", { ascending:false }).limit(10);
    setDashProducts(prods || []);
    setDashQuotes(quotes || []);
    setDashLoading(false);
  };

  const handleLogin = async () => {
    if (!loginForm.phone || !loginForm.pin) { setLoginError("Please enter your phone number and PIN"); return; }
    setLoginLoading(true);
    setLoginError("");
    const { data, error } = await supabase.from("suppliers").select("*").eq("phone", loginForm.phone).eq("pin", loginForm.pin).single();
    setLoginLoading(false);
    if (error || !data) { setLoginError("Phone number or PIN is incorrect. Please try again."); return; }
    setSupplierUser(data);
    loadDashboard(data.id);
  };

  const handleLogout = () => { setSupplierUser(null); setLoginForm({ phone:"", pin:"" }); setPage("supplier"); };

  const toggleOpen = async () => {
    const { error } = await supabase.from("suppliers").update({ open: !supplierUser.open }).eq("id", supplierUser.id);
    if (!error) { setSupplierUser({ ...supplierUser, open: !supplierUser.open }); showToast(supplierUser.open ? "Shop marked as Closed" : "Shop marked as Open"); }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) { showToast("Please enter product name and price"); return; }
    setAddingProduct(true);
    const { data, error } = await supabase.from("products").insert({ supplier_id: supplierUser.id, name: newProduct.name, price: newProduct.price }).select().single();
    setAddingProduct(false);
    if (error) { showToast("Error adding product. Try again."); return; }
    setDashProducts([...dashProducts, data]);
    setNewProduct({ name:"", price:"" });
    showToast("Product added!");
    loadSuppliers();
  };

  const deleteProduct = async (productId) => {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (!error) { setDashProducts(dashProducts.filter(p => p.id !== productId)); showToast("Product removed."); loadSuppliers(); }
  };

  const submitQuote = async () => {
    if (!quoteForm.qty || !quoteForm.location || !quoteForm.phone) { showToast("Please fill in quantity, location and phone number"); return; }
    setQuoteLoading(true);
    const { error } = await supabase.from("quotes").insert({ material:quoteForm.material, quantity:quoteForm.qty, location:quoteForm.location, phone:quoteForm.phone, notes:quoteForm.notes });
    setQuoteLoading(false);
    if (error) { showToast("Error submitting. Please try again."); return; }
    setQuoteSubmitted(true);
  };

  const toggleMaterial = (mat) => {
    setRegForm(prev => ({ ...prev, materials: prev.materials.includes(mat) ? prev.materials.filter(m => m !== mat) : [...prev.materials, mat] }));
  };

  const submitReg = async () => {
    if (!regForm.name || !regForm.phone) { showToast("Please fill in shop name and phone number"); return; }
    if (regForm.materials.length === 0) { showToast("Please select at least one material you sell"); return; }
    setRegLoading(true);
    const category = regForm.materials[0].toLowerCase().includes("cement") ? "cement"
      : regForm.materials[0].toLowerCase().includes("sand") || regForm.materials[0].toLowerCase().includes("ballast") ? "sand"
      : regForm.materials[0].toLowerCase().includes("steel") || regForm.materials[0].toLowerCase().includes("iron") ? "steel"
      : regForm.materials[0].toLowerCase().includes("timber") || regForm.materials[0].toLowerCase().includes("roof") ? "timber"
      : regForm.materials[0].toLowerCase().includes("stone") ? "stones" : "cement";
    const { error } = await supabase.from("suppliers").insert({ name:regForm.name, town:regForm.town, phone:regForm.phone, whatsapp:regForm.whatsapp||regForm.phone, verified:false, open:true, category, rating:0, reviews:0, pin:"1234" });
    setRegLoading(false);
    if (error) { showToast("Error submitting. Please try again."); console.error(error); return; }
    setRegStep(2);
    loadSuppliers();
  };

  const filtered = suppliers.filter(s => {
    const matchCat = cat === "all" || s.category === cat;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || (s.products||[]).some(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const inp = (extra={}) => ({ width:"100%", padding:"9px 12px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"14px", boxSizing:"border-box", fontFamily:"system-ui,sans-serif", ...extra });

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", background:"#f5f5f5", color:"#1a1a1a" }}>

      {/* Topbar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #eee", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"56px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ fontSize:"20px", fontWeight:"700", color:"#1D9E75", cursor:"pointer" }} onClick={() => setPage("home")}>Jenga<span style={{ color:"#1a1a1a" }}>Hub</span></div>
        <div style={{ display:"flex", gap:"4px" }}>
          {["home","quotes","supplier","dashboard"].map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ padding:"6px 14px", borderRadius:"8px", border:"none", background: page===p ? "#f0f0f0" : "none", fontWeight: page===p ? "600" : "400", cursor:"pointer", fontSize:"13px", color: page===p ? "#1a1a1a" : "#666" }}>
              {p==="home" ? "Find suppliers" : p==="quotes" ? "Get quotes" : p==="supplier" ? "List your shop" : "Supplier login"}
            </button>
          ))}
        </div>
        {supplierUser && <button onClick={handleLogout} style={{ padding:"7px 16px", borderRadius:"8px", background:"#f5f5f5", color:"#666", border:"1px solid #ddd", cursor:"pointer", fontSize:"13px" }}>Logout</button>}
        {!supplierUser && <button onClick={() => setPage("supplier")} style={{ padding:"7px 16px", borderRadius:"8px", background:"#1D9E75", color:"#fff", border:"none", fontWeight:"600", cursor:"pointer", fontSize:"13px" }}>Get started</button>}
      </div>

      {/* HOME */}
      {page === "home" && (
        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"24px 20px" }}>
          <div style={{ background:"linear-gradient(135deg,#1D9E75,#0F6E56)", borderRadius:"12px", padding:"36px 32px", color:"#fff", marginBottom:"24px" }}>
            <h1 style={{ fontSize:"26px", fontWeight:"700", marginBottom:"8px", lineHeight:"1.3" }}>Find building materials near you — at the best price</h1>
            <p style={{ fontSize:"14px", opacity:"0.85", marginBottom:"20px" }}> Compare prices from verified hardware shops, quarries and raw material suppliers across Kenya. No middlemen.</p>
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
              {filtered.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"40px", color:"#999" }}>No suppliers found.</div>}
              {filtered.map((sup, idx) => (
                <div key={sup.id||idx} style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"16px" }}>
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
                  {(sup.products||[]).length > 0 && (
                    <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:"10px", display:"flex", flexDirection:"column", gap:"6px", marginBottom:"12px" }}>
                      {(sup.products||[]).map((item,i) => (
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
          <p style={{ fontSize:"14px", color:"#888", marginBottom:"20px" }}>Fill in what you need — all matching suppliers near you will receive your request.</p>
          {!quoteSubmitted ? (
            <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"20px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Material needed</label>
                  <select value={quoteForm.material} onChange={e => setQuoteForm({...quoteForm, material:e.target.value})} style={inp()}>
                    <option>Cement (bags)</option><option>River sand (tonnes)</option><option>Ballast (tonnes)</option><option>Quarry stones (tonnes)</option><option>Steel Y12 (tonnes)</option><option>Roofing sheets</option><option>Timber (pieces)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Quantity</label>
                  <input type="number" placeholder="e.g. 200" value={quoteForm.qty} onChange={e => setQuoteForm({...quoteForm, qty:e.target.value})} style={inp()} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Your phone number</label>
                  <input placeholder="07xx xxx xxx" value={quoteForm.phone} onChange={e => setQuoteForm({...quoteForm, phone:e.target.value})} style={inp()} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Delivery location</label>
                  <input placeholder="e.g. Thika, near Blue Post Hotel" value={quoteForm.location} onChange={e => setQuoteForm({...quoteForm, location:e.target.value})} style={inp()} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Additional notes (optional)</label>
                  <textarea placeholder="e.g. need delivery included..." value={quoteForm.notes} onChange={e => setQuoteForm({...quoteForm, notes:e.target.value})} style={inp({ minHeight:"80px", resize:"vertical" })} />
                </div>
              </div>
              <button onClick={submitQuote} disabled={quoteLoading} style={{ width:"100%", padding:"11px", background:"#1D9E75", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"700", fontSize:"14px", cursor:"pointer", opacity:quoteLoading?0.7:1 }}>
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
          <p style={{ fontSize:"14px", color:"#888", marginBottom:"20px" }}>Reach builders looking for materials near you. Free for the first 3 months.</p>
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
                  <input placeholder="e.g. Kamau Hardware" value={regForm.name} onChange={e => setRegForm({...regForm, name:e.target.value})} style={inp()} />
                </div>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Town *</label>
                  <select value={regForm.town} onChange={e => setRegForm({...regForm, town:e.target.value})} style={inp()}>
                    <option>Thika</option><option>Ruiru</option><option>Juja</option><option>Kitengela</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Phone number *</label>
                  <input placeholder="07xx xxx xxx" value={regForm.phone} onChange={e => setRegForm({...regForm, phone:e.target.value})} style={inp()} />
                </div>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>WhatsApp number</label>
                  <input placeholder="07xx xxx xxx" value={regForm.whatsapp} onChange={e => setRegForm({...regForm, whatsapp:e.target.value})} style={inp()} />
                </div>
              </div>
              <div style={{ marginBottom:"16px" }}>
                <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"8px" }}>What materials do you sell? * (select all that apply)</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {allMaterials.map(mat => (
                    <button key={mat} onClick={() => toggleMaterial(mat)} style={{ padding:"6px 12px", borderRadius:"20px", border: regForm.materials.includes(mat) ? "1.5px solid #1D9E75" : "1px solid #ddd", background: regForm.materials.includes(mat) ? "#E1F5EE" : "#f9f9f9", color: regForm.materials.includes(mat) ? "#0F6E56" : "#555", fontSize:"12px", cursor:"pointer", fontWeight: regForm.materials.includes(mat) ? "600" : "400" }}>
                      {regForm.materials.includes(mat) ? "✓ " : ""}{mat}
                    </button>
                  ))}
                </div>
                {regForm.materials.length > 0 && <div style={{ fontSize:"12px", color:"#1D9E75", marginTop:"8px", fontWeight:"600" }}>Selected: {regForm.materials.join(", ")}</div>}
              </div>
              <div style={{ background:"#FFF8E1", border:"1px solid #FFE082", borderRadius:"8px", padding:"12px", marginBottom:"14px", fontSize:"13px", color:"#7B5800" }}>
                📌 Your default login PIN is <strong>1234</strong>. Please change it after your first login in the Supplier Dashboard.
              </div>
              <button onClick={submitReg} disabled={regLoading} style={{ width:"100%", padding:"11px", background:"#1D9E75", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"700", fontSize:"14px", cursor:"pointer", opacity:regLoading?0.7:1 }}>
                {regLoading ? "Submitting..." : "Submit registration →"}
              </button>
            </div>
          ) : (
            <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"32px", textAlign:"center" }}>
              <div style={{ fontSize:"48px", marginBottom:"12px" }}>🎉</div>
              <h3 style={{ fontSize:"16px", fontWeight:"700", marginBottom:"6px" }}>Registration received!</h3>
              <p style={{ fontSize:"14px", color:"#888", marginBottom:"8px" }}>Welcome to Jenga Hub! Your shop <strong>{regForm.name}</strong> has been listed.</p>
              <p style={{ fontSize:"14px", color:"#888", marginBottom:"20px" }}>Login to your dashboard using your phone number and PIN: <strong>1234</strong></p>
              <div style={{ display:"flex", gap:"8px", justifyContent:"center" }}>
                <button onClick={() => { setRegStep(1); setRegForm(defaultReg); }} style={{ padding:"9px 20px", background:"#f5f5f5", color:"#555", border:"1px solid #ddd", borderRadius:"8px", fontWeight:"600", fontSize:"14px", cursor:"pointer" }}>Register another shop</button>
                <button onClick={() => { setRegStep(1); setRegForm(defaultReg); setPage("dashboard"); }} style={{ padding:"9px 20px", background:"#1D9E75", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"600", fontSize:"14px", cursor:"pointer" }}>Go to Dashboard →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUPPLIER DASHBOARD */}
      {page === "dashboard" && (
        <div style={{ maxWidth:"700px", margin:"0 auto", padding:"24px 20px" }}>
          {!supplierUser ? (
            <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"32px", maxWidth:"400px", margin:"0 auto" }}>
              <div style={{ fontSize:"32px", marginBottom:"12px", textAlign:"center" }}>🔐</div>
              <h2 style={{ fontSize:"18px", fontWeight:"700", marginBottom:"4px", textAlign:"center" }}>Supplier Login</h2>
              <p style={{ fontSize:"14px", color:"#888", marginBottom:"20px", textAlign:"center" }}>Log in to manage your shop and products</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"16px" }}>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Phone number</label>
                  <input placeholder="07xx xxx xxx" value={loginForm.phone} onChange={e => setLoginForm({...loginForm, phone:e.target.value})} style={inp()} />
                </div>
                <div>
                  <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>PIN</label>
                  <input type="password" placeholder="Enter your PIN" value={loginForm.pin} onChange={e => setLoginForm({...loginForm, pin:e.target.value})} style={inp()} />
                </div>
              </div>
              {loginError && <div style={{ background:"#FFF0F0", border:"1px solid #FFCCCC", borderRadius:"8px", padding:"10px 12px", fontSize:"13px", color:"#CC0000", marginBottom:"12px" }}>{loginError}</div>}
              <button onClick={handleLogin} disabled={loginLoading} style={{ width:"100%", padding:"11px", background:"#1D9E75", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"700", fontSize:"14px", cursor:"pointer", opacity:loginLoading?0.7:1 }}>
                {loginLoading ? "Logging in..." : "Login →"}
              </button>
              <p style={{ fontSize:"12px", color:"#aaa", textAlign:"center", marginTop:"12px" }}>Default PIN is 1234. Contact Jenga Hub to reset your PIN.</p>
            </div>
          ) : (
            <div>
              {/* Dashboard header */}
              <div style={{ background:"linear-gradient(135deg,#1D9E75,#0F6E56)", borderRadius:"12px", padding:"20px 24px", color:"#fff", marginBottom:"20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:"18px", fontWeight:"700", marginBottom:"2px" }}>{supplierUser.name}</div>
                  <div style={{ fontSize:"13px", opacity:"0.85" }}>📍 {supplierUser.town} · {supplierUser.phone}</div>
                </div>
                <button onClick={toggleOpen} style={{ padding:"8px 16px", borderRadius:"8px", border:"2px solid rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:"600", fontSize:"13px", cursor:"pointer" }}>
                  {supplierUser.open ? "🟢 Open — click to close" : "🔴 Closed — click to open"}
                </button>
              </div>

              {dashLoading ? (
                <div style={{ textAlign:"center", padding:"40px", color:"#999" }}>Loading your dashboard...</div>
              ) : (
                <>
                  {/* Stats */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginBottom:"20px" }}>
                    <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"16px", textAlign:"center" }}>
                      <div style={{ fontSize:"28px", fontWeight:"700", color:"#1D9E75" }}>{dashProducts.length}</div>
                      <div style={{ fontSize:"12px", color:"#888" }}>Products listed</div>
                    </div>
                    <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"16px", textAlign:"center" }}>
                      <div style={{ fontSize:"28px", fontWeight:"700", color:"#1D9E75" }}>{dashQuotes.length}</div>
                      <div style={{ fontSize:"12px", color:"#888" }}>Buyer requests</div>
                    </div>
                    <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"16px", textAlign:"center" }}>
                      <div style={{ fontSize:"28px", fontWeight:"700", color: supplierUser.verified ? "#1D9E75" : "#999" }}>{supplierUser.verified ? "✓" : "⏳"}</div>
                      <div style={{ fontSize:"12px", color:"#888" }}>{supplierUser.verified ? "Verified" : "Pending verification"}</div>
                    </div>
                  </div>

                  {/* Products */}
                  <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"20px", marginBottom:"20px" }}>
                    <div style={{ fontWeight:"700", fontSize:"15px", marginBottom:"16px" }}>My Products & Prices</div>
                    {dashProducts.length === 0 && <div style={{ textAlign:"center", padding:"20px", color:"#999", fontSize:"14px" }}>No products yet. Add your first product below.</div>}
                    {dashProducts.map(p => (
                      <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f5f5f5" }}>
                        <div>
                          <div style={{ fontSize:"14px", fontWeight:"500" }}>{p.name}</div>
                          <div style={{ fontSize:"13px", color:"#1D9E75", fontWeight:"600" }}>{p.price}</div>
                        </div>
                        <button onClick={() => deleteProduct(p.id)} style={{ padding:"4px 10px", borderRadius:"6px", border:"1px solid #ddd", background:"none", color:"#CC0000", fontSize:"12px", cursor:"pointer" }}>Remove</button>
                      </div>
                    ))}

                    {/* Add product form */}
                    <div style={{ marginTop:"16px", paddingTop:"16px", borderTop:"1px solid #f0f0f0" }}>
                      <div style={{ fontWeight:"600", fontSize:"13px", marginBottom:"10px", color:"#888" }}>ADD NEW PRODUCT</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:"8px", alignItems:"end" }}>
                        <div>
                          <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Product name</label>
                          <input placeholder="e.g. Cement (Bamburi 50kg)" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name:e.target.value})} style={inp()} />
                        </div>
                        <div>
                          <label style={{ fontSize:"12px", color:"#888", fontWeight:"600", display:"block", marginBottom:"4px" }}>Price</label>
                          <input placeholder="e.g. KES 820" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price:e.target.value})} style={inp()} />
                        </div>
                        <button onClick={addProduct} disabled={addingProduct} style={{ padding:"9px 16px", background:"#1D9E75", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"600", fontSize:"13px", cursor:"pointer", whiteSpace:"nowrap" }}>
                          {addingProduct ? "..." : "+ Add"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent quote requests */}
                  <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:"12px", padding:"20px" }}>
                    <div style={{ fontWeight:"700", fontSize:"15px", marginBottom:"16px" }}>Recent Buyer Requests</div>
                    {dashQuotes.length === 0 && <div style={{ textAlign:"center", padding:"20px", color:"#999", fontSize:"14px" }}>No buyer requests yet.</div>}
                    {dashQuotes.map(q => (
                      <div key={q.id} style={{ padding:"12px 0", borderBottom:"1px solid #f5f5f5" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                          <div style={{ fontWeight:"600", fontSize:"14px" }}>{q.quantity} {q.material}</div>
                          <a href={`tel:${q.phone}`} style={{ fontSize:"12px", color:"#1D9E75", fontWeight:"600", textDecoration:"none" }}>📞 {q.phone}</a>
                        </div>
                        <div style={{ fontSize:"12px", color:"#888" }}>📍 {q.location} {q.notes && `· ${q.notes}`}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
