import { readProfile, isConfigured } from "./profile.js";
import { render } from "./signature.js";
Office.onReady(() => {
  const button = document.getElementById("connect"), status = document.getElementById("status");
  button.disabled = !isConfigured();
  if (!isConfigured()) status.textContent = "Employee profile connection is awaiting administrator setup. Your existing signatures are unchanged.";
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      const profile = await readProfile(Office.context.mailbox.userProfile.emailAddress, true);
      status.textContent = "Your Microsoft 365 details are connected. Start a new message to test the signature.";
      // All dynamic values are escaped by the fixed renderer; no mailbox content is read.
      document.getElementById("preview").innerHTML = render(profile).html;
    } catch (_) { status.textContent = "Could not connect this employee profile. Check your work account and contact your administrator. No message was changed."; }
    finally { button.disabled = !isConfigured(); }
  });
});
