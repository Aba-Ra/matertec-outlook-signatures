import { normalise, isEmployee, render, sharedSignature } from "./signature.js";
export function makeHandler(Office, readProfile, timers = {setTimeout, clearTimeout}) {
  let generation = 0;
  const ok = result => result && result.status === Office.AsyncResultStatus.Succeeded;
  return function applyMatertecSignature(event) {
    const ticket = ++generation;
    let done = false, timer;
    function finish() { if (!done) { done = true; timers.clearTimeout(timer); event.completed(); } }
    const active = () => !done && ticket === generation;
    timer = timers.setTimeout(finish, 10000);
    try {
      const mailbox = Office.context.mailbox, item = mailbox.item;
      if (!item?.from?.getAsync || !item?.body?.getTypeAsync || !item?.body?.setSignatureAsync) { finish(); return; }
      item.from.getAsync(async sender => {
        if (!active() || !ok(sender)) { finish(); return; }
        const email = normalise(sender.value?.emailAddress);
        let signature = sharedSignature(email);
        try {
          if (!signature) {
            if (!isEmployee(email) || normalise(mailbox.userProfile?.emailAddress) !== email) { finish(); return; }
            signature = render(await readProfile(email));
          }
          if (!active()) { finish(); return; }
          item.body.getTypeAsync(type => {
            if (!active() || !ok(type)) { finish(); return; }
            const html = type.value === Office.CoercionType.Html;
            if (!html && type.value !== Office.CoercionType.Text) { finish(); return; }
            try {
              item.body.setSignatureAsync(html ? signature.html : signature.text,
                {coercionType:html ? Office.CoercionType.Html : Office.CoercionType.Text}, finish);
            } catch (_) { finish(); }
          });
        } catch (_) { finish(); }
      });
    } catch (_) { finish(); }
  };
}
