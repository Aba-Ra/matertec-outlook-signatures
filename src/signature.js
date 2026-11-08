const domain = "matertec.com";
export const normalise = value => typeof value === "string" ? value.trim().toLowerCase() : "";
export function isEmployee(address) {
  const email = normalise(address);
  return /^[a-z0-9][a-z0-9._+-]*@matertec\.com$/.test(email) &&
    !/^(?:admin|info|accounts|all|emergency-access-[^@]*|admin_emergency|[^@]*-admin)@/.test(email);
}
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function clean(value, max = 160) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";
}
export function fromGraph(data, expectedEmail, includeMobile = false) {
  const email = normalise(expectedEmail);
  // Never use a profile belonging to a different signed-in account or delegated sender.
  if (!data || !isEmployee(email) || normalise(data.mail) !== email) throw Error("Profile identity mismatch");
  const name = clean(data.displayName);
  if (!name) throw Error("Missing employee name");
  const workPhone = Array.isArray(data.businessPhones) ? data.businessPhones.find(p => typeof p === "string" && p.trim()) : "";
  return {name, title:clean(data.jobTitle), email, phone:clean(workPhone || (includeMobile ? data.mobilePhone : "" ), 60)};
}
export function render(profile, role = false) {
  const name = escapeHtml(profile.name), title = escapeHtml(profile.title || "");
  const email = normalise(profile.email);
  if (!/^[a-z0-9][a-z0-9._+-]*@matertec\.com$/.test(email)) throw Error("Invalid contact email");
  const phone = escapeHtml(profile.phone || "");
  const details = `<strong style="font-size:15px;line-height:22px;color:#142843">${name}</strong><br>` +
    (role ? "<br>" : title ? `<span style="font-size:12px">${title}</span><br>` : "") +
    `<span style="font-size:12px">Matertec Pty Ltd | Perth WA</span><br><a href="mailto:${email}" style="color:#2155D8;text-decoration:none">${email}</a><br>` +
    (phone ? phone + "<br>" : "") + `<a href="https://matertec.com" style="color:#2155D8;text-decoration:none">matertec.com</a>`;
  return {
    html:`<table role="presentation" width="450" height="150" cellpadding="0" cellspacing="0" border="0" style="width:450px;height:150px;table-layout:fixed;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#526177"><tr><td width="126" height="150" align="center" valign="middle" style="width:126px;height:150px;padding:0 18px 0 0;border-right:1px solid #D9D9D9;text-align:center;vertical-align:middle"><img src="https://matertec.com/brand/matertec-email-logo-v05.png" width="108" height="150" alt="Matertec — The technology that matters" style="display:block;border:0"></td><td width="288" height="150" valign="middle" style="width:288px;height:150px;padding:0 0 0 18px;vertical-align:middle">${details}</td></tr></table>`,
    text:[profile.name, profile.title || "", "", "Matertec Pty Ltd | Perth WA", email, profile.phone || "", "matertec.com"].filter((v,i) => v || i === 2).join("\n")
  };
}
export function sharedSignature(sender) {
  const roles = {"admin@matertec.com":"Admin","accounts@matertec.com":"Accounts","info@matertec.com":"Info"};
  const name = roles[normalise(sender)];
  return name ? render({name, email:"aba.raha@matertec.com", phone:"+61 404 777 442"}, true) : null;
}
