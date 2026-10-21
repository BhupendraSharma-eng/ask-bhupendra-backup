const C = window.DOUBTS_CONFIG;
const H = () => ({ apikey: C.SUPABASE_ANON_KEY, Authorization: "Bearer " + C.SUPABASE_ANON_KEY, "Content-Type": "application/json" });
const LS = "doubts_mock";
const load = () => JSON.parse(localStorage.getItem(LS) || "[]");
const save = (a) => localStorage.setItem(LS, JSON.stringify(a));
window.DoubtsAPI = {
  async submit(name, text) {
    if (C.MODE === "mock") { const a = load(); a.push({ id: Date.now(), name, text, status: "pending", votes: 0, created_at: new Date().toISOString() }); save(a); return; }
    const r = await fetch(C.SUPABASE_URL + "/rest/v1/doubts", { method: "POST", headers: { ...H(), Prefer: "return=minimal" }, body: JSON.stringify({ name, text }) });
    if (!r.ok) throw new Error("Submit failed " + r.status);
  },
  async approved() {
    if (C.MODE === "mock") return load().filter(d => d.status === "approved").reverse();
    const r = await fetch(C.SUPABASE_URL + "/rest/v1/doubts?select=id,name,text,created_at&status=eq.approved&order=created_at.desc&limit=50", { headers: H() });
    return r.json();
  },
  async modList(pass) {
    if (C.MODE === "mock") return load().reverse();
    const r = await fetch(C.SUPABASE_URL + "/rest/v1/rpc/mod_list", { method: "POST", headers: H(), body: JSON.stringify({ pass }) });
    if (!r.ok) throw new Error("Bad passphrase or error " + r.status); return r.json();
  },
  async modSet(pass, id, status) {
    if (C.MODE === "mock") { const a = load(); const d = a.find(x => x.id === id); if (d) d.status = status; save(a); return; }
    const r = await fetch(C.SUPABASE_URL + "/rest/v1/rpc/mod_set", { method: "POST", headers: H(), body: JSON.stringify({ pass, doubt_id: id, new_status: status }) });
    if (!r.ok) throw new Error("Update failed " + r.status);
  }
};
// Tiny client-side filter (English + common Hinglish). Server-side moderation is still the real gate.
window.isAbusive = (s) => /\b(f+u+c+k+|sh[i1]t|b[i1]tch|bastard|asshole|dick|porn|sex|chut[iy]a?|madarchod|mc|bc|bhenchod|behenchod|gaand|gandu|randi|lund|bsdk|harami|kutta|kamina)\b/i.test(s.replace(/[*@$]/g, "a"));
