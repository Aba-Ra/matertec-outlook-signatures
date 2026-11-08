# Superseded — Matertec Signatures

Canonical source has moved to **https://github.com/Aba-Ra/Tools_General_Outlook_Signatures** at Aba's instruction on 2026-11-08. The current app site is **https://aba-ra.github.io/Tools_General_Outlook_Signatures/** and canonical manifest is **https://aba-ra.github.io/Tools_General_Outlook_Signatures/manifest.xml**.

This repository and host are retained as rollback history and for cached Outlook clients during the move. Do not start new development or install a second copy from here. The same add-in ID and Microsoft app registration are retained; the pilot remains Aba-only until actual client testing passes. No wider employee rollout has been accepted.

The historical code and deployment instructions below describe this predecessor. Use the new repository's README and deployment guide for current instructions.

---

# Matertec Outlook signatures

A limited Outlook add-in pilot for Aba Raha. Static files are hosted on GitHub Pages separately from Matertec’s website. This repository contains only the public pilot files and tests; it contains no hosting credentials or mailbox data.

Deployment uses GitHub Pages from the docs folder on main. No workflow or credential grants access to the company website. The approved logo remains an image linked from matertec.com.

The manifest requests ReadWriteItem. Current code looks up the From address and body format and sets the approved signature. It does not read message history, upload email content or collect analytics. Changes to this repository can change the code Outlook loads; protect publishing access accordingly.

OnNewMessageCompose covers new messages, replies, reply-all and forwards. On supported From-change events, the exact sender selects the personal or Admin, Accounts or Info template. Mobile shared/delegated From changes remain unsupported by Microsoft and require actual-device checks before mixed use. Editing a saved draft and deleting a signature after insertion do not trigger insertion at send.

Run `node --test tests/runtime.test.cjs`. The 14 checks are mocked API tests, not proof of live client behaviour. Validate docs/manifest.xml with Microsoft’s office-addin-manifest tool. Real Outlook and phone testing remains required before accepting the pilot.

Proposed assignment is aba.raha@matertec.com only. Existing Exchange rules remain the fallback.

Microsoft references
- https://learn.microsoft.com/en-us/office/dev/add-ins/outlook/mobile-event-based
- https://learn.microsoft.com/en-us/office/dev/add-ins/outlook/onmessagefromchanged-onappointmentfromchanged-events
- https://learn.microsoft.com/en-us/office/dev/add-ins/outlook/understanding-outlook-add-in-permissions

## Employee extension candidate

`src/` and `docs/employee-pilot/` contain the proposed v1.1 replacement. It uses the same approved logo/layout and each sender's own Microsoft 365 name, title, email and business phone. A Microsoft single-tenant app registration and delegated User.Read consent are required; the client ID is deliberately unconfigured, so no profile requests occur until configured. No staff roster is stored on the public host. Shared Admin, Accounts and Info retain the approved role identities and Aba contacts. See [deployment steps and remaining gates](deployment/README.md).

Run `npm ci --ignore-scripts`, `npm test`, `npm run build`. Commit the matching generated files so CI can detect a stale build. Existing docs/runtime.js and docs/manifest.xml are the unchanged v1.0 pilot. This branch is not published or installed.

### Cached web runtime bridge — 2026-11-08

A live Outlook DOM check confirmed it was still loading this predecessor's runtime.html. That page now loads the already-reviewed canonical employee-pilot/runtime.js from Tools_General_Outlook_Signatures under the same GitHub Pages origin, with the canonical runtime CSP. This applies current app code to cached HTML-based clients without changing their manifest ID or permissions. The legacy JavaScript override used by classic Windows is not changed; its separate root-allowlist gate remains. No broader user assignment is introduced. This is a compatibility artifact, not a second source of runtime code.

### Approved app icons for cached catalogues — 2026-11-08

Outlook's Apps catalogue still displayed the v1.0 name and plain corporate icon after the canonical app update. The predecessor icon-64.png and icon-128.png now serve byte-identical copies of the approved Matertec Signatures navy/envelope app icon from the canonical repository. Both old and current manifest URLs therefore resolve to the same approved app artwork. The signature's stacked email logo is unchanged. This does not force Microsoft to refresh an already-cached catalogue image or name; the live catalogue must be checked separately. App identity, permissions and Aba-only assignment are unchanged.
