# Employee rollout checklist — not deployed

The installed v1.0 pilot remains assigned to aba.raha@matertec.com only. This branch stages v1.1 as a replacement with the same add-in ID, not a second concurrent add-in. Do not install both or assign everyone to bypass client verification.

## Microsoft connection

Prepared Entra application name: Matertec Employee Signatures. Single tenant Matertec, tenant ID 86cac6cd-042e-4643-b834-c86d5e75684a. SPA broker redirect brk-multihub://aba-ra.github.io. No secret, certificate, application-wide Graph permission, or directory-reading scope is needed. Register requires accepting Microsoft's Platform Policies; the owner must confirm that step. It has not been clicked.

After registration, verify the ID and set src/config.js clientId. Retain single-tenant authority. Delegated Microsoft Graph User.Read is the only requested data scope. Its sign-in/profile permission is new compared with v1.0 and needs the owner's explicit consent before activation. Use own-profile user consent in the Aba pilot; do not grant organization-wide consent just to bypass a prompt. No mail Graph scope is requested. Configure no client secret. Rebuild and review before pushing any published branch.

Use the Matertec signature button on an opened message to connect your work profile once if silent consent is unavailable. Event handlers never open sign-in popups. NAA 1.1 and signature API support must be checked in each client. A profile failure leaves the draft unchanged; existing native/transport signatures continue with their known limitations.

## Hosting boundary

Public code, static configuration IDs and public logo only. No employee directory JSON or contact roster is published. Employee profile data is fetched directly from graph.microsoft.com/v1.0/me using the signed-in person's delegated token, validated against exact From address and tenant, and held in memory. Business phone is used; mobilePhone is excluded by default. Missing optional fields are omitted. Alias senders and unknown delegated senders require a separate verified mapping before support.

GitHub project Pages URLs share the aba-ra.github.io origin with the owner's other Pages projects. This is separate from GoDaddy credentials, but it is not a dedicated browser origin. The NAA broker redirect trusts that origin. Review publishing access for ALL repositories serving that origin before consent, or move the add-in to its own approved origin and update every URL, redirect and allowed file. Do not claim origin-level isolation merely because the repository is dedicated.

Classic Outlook on Windows requires an allowlist at the ORIGIN ROOT: https://aba-ra.github.io/.well-known/microsoft-officeaddins-allowed.json. The provided JSON is a deployment input, not a deployed file. Publishing it under the project subpath would not satisfy Microsoft. Do not promise classic-Windows support until the origin-root file is served and read back, with existing allowed entries preserved. New Outlook, Mac and web use runtime.html; still test authentication, CSP and actual insertion. Mobile shared/delegated From-change events are unsupported and remain a rollout exclusion until an explicit supported design/device result exists.

## Assignment and acceptance

Create a dedicated security group named Matertec Signature Employees after the pilot passes. Add everyday human mailbox accounts only. Start with Aba only; exclude aba.raha-admin, both emergency-access accounts and shared mailbox backing identities. Do not reuse all@ because it currently includes administrator identities. Add future employees deliberately alongside onboarding; group assignment does not discover employees automatically.

Verify Microsoft 365 displayName, jobTitle, mail and businessPhones for every assigned employee. Do not substitute Aba's phone into employee signatures. The shared Admin, Accounts and Info signatures intentionally retain Aba's contacts and no personal name/title, per owner instruction.

Before replacing installed v1.0: local tests/build and manifest validation; independent delta review; publishing-origin trust review; exact own-profile consent. After updating the existing app only, wait for propagation and prove execution (an unchanged native signature is not evidence). Check all new/reply/reply-all/forward cases, current-region placement above history, sender switching, plain text, missing fields, preserved quoted content and delivered duplicate protection. Test actual phone separately. Send tests only to the owner's test mailbox. Do not disable Exchange fallback rules during this pilot.

Expand the dedicated group only after evidence is recorded. Rollback: restore prior app version/manifest and pilot assignment; restore original source aae0ae4c0ef2e264488107bbe48bbed49305ca29 if needed. Native and Exchange fallback remain enabled. Revoking profile consent stops Graph access, not the server fallback. No employee deployment or consent is claimed by a passing mock test.

## Primary references
- https://learn.microsoft.com/en-us/office/dev/add-ins/develop/enable-nested-app-authentication-in-your-add-in
- https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/samples/officedev/office-add-in-samples/outlook-event-sso-naa/
- https://learn.microsoft.com/en-us/office/dev/add-ins/develop/use-sso-in-event-based-activation
- https://learn.microsoft.com/en-us/javascript/api/requirement-sets/common/nested-app-auth-requirement-sets
