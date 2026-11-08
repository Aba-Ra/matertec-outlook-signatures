import { createNestablePublicClientApplication } from "@azure/msal-browser";
import { config } from "./config.js";
import { createProfileReader, configured } from "./profile-client.js";
export const isConfigured = () => configured(config);
const reader = createProfileReader(config, createNestablePublicClientApplication);
export async function readProfile(email, interactive = false) {
  if (!Office.context.requirements?.isSetSupported("NestedAppAuth", "1.1")) throw Error("Outlook profile connection is unsupported on this client");
  return reader(email, interactive);
}
