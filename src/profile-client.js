import { fromGraph, normalise, isEmployee } from "./signature.js";
const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function configured(config) { return guid.test(config.tenantId) && guid.test(config.clientId); }
export function createProfileReader(config, createNestablePublicClientApplication, fetchProfile = fetch) {
let clientPromise;
async function client() {
  if (!configured(config)) throw Error("Profile connection not configured");
  if (!clientPromise) clientPromise = createNestablePublicClientApplication({
    auth:{clientId:config.clientId, authority:`https://login.microsoftonline.com/${config.tenantId}`},
    cache:{cacheLocation:"memoryStorage"},
    system:{loggerOptions:{piiLoggingEnabled:false, loggerCallback:() => {}}}
  }).catch(error => { clientPromise = undefined; throw error; });
  return clientPromise;
}
return async function readProfile(expectedEmail, interactive = false) {
  const email = normalise(expectedEmail);
  if (!isEmployee(email)) throw Error("Not an employee mailbox");
  const pca = await client();
  const request = {scopes:["https://graph.microsoft.com/User.Read"], loginHint:email};
  let result;
  try { result = await pca.acquireTokenSilent(request); }
  catch(error) {
    // A compose event must never show a sign-in popup. Only the setup button may interact.
    if (!interactive || error.errorCode !== "interaction_required" && error.errorCode !== "consent_required" && error.errorCode !== "login_required" && error.errorCode !== "no_account_error") throw error;
    result = await pca.acquireTokenPopup(request);
  }
  if (!result || !result.accessToken || normalise(result.tenantId) !== normalise(config.tenantId)) throw Error("Wrong tenant");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetchProfile("https://graph.microsoft.com/v1.0/me?$select=displayName,jobTitle,mail,businessPhones" + (config.publishMobilePhone ? ",mobilePhone" : ""), {
      method:"GET", headers:{Authorization:`Bearer ${result.accessToken}`},
      credentials:"omit", cache:"no-store", redirect:"error", signal:controller.signal
    });
    if (!response.ok) throw Error("Profile unavailable");
    return fromGraph(await response.json(), email, config.publishMobilePhone);
  } finally { clearTimeout(timer); }
};
}
