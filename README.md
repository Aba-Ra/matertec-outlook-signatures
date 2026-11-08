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
