# Data Forms Module — End-to-End Flow

**Module name:** **Data Forms** (Studio Settings → Data Forms)

This module lets you enable or disable public-facing forms (Get Started, Newsletter, Contact, Waitlist, Feedback, Demo Request) from Studio. Submissions are stored as JSON files in the repo under `data/`—no database. When a form is disabled, its API returns 503 and you can hide the form/CTA on the site.

---

## 1. Studio Settings (Enable/Disable)

- **Where:** Studio → **Settings** → **Data Forms**
- **Config file:** `config/data-forms.json` (created on first save; stored in repo via GitHub API)
- **UI:** One row per form type with a toggle (enabled/disabled) and the storage path. **Save** writes to the repo.

**Form types:**

| Id | Label | Default | Storage path | Fields |
|----|--------|--------|--------------|--------|
| `inquiries` | Get Started | enabled | `data/inquiries/` | name, email, intent |
| `newsletter` | Newsletter | enabled | `data/newsletter/` | email |
| `contact` | Contact | disabled | `data/contact/` | name, email, message |
| `waitlist` | Waitlist | disabled | `data/waitlist/` | email, source (optional) |
| `feedback` | Feedback | disabled | `data/feedback/` | page, rating (optional), comment |
| `demoRequest` | Demo Request | disabled | `data/demo-requests/` | name, email, company (optional) |

---

## 2. APIs (Public + Config-Aware)

Each form has a **public** `POST` API. If that form is **disabled** in Data Forms config, the API returns **503** and does not persist.

| Form | Endpoint | Request body |
|------|----------|--------------|
| Get Started | `POST /api/inquiries` | `{ name, email, intent }` |
| Newsletter | `POST /api/newsletter` | `{ email }` |
| Contact | `POST /api/contact` | `{ name, email, message }` |
| Waitlist | `POST /api/waitlist` | `{ email, source? }` |
| Feedback | `POST /api/feedback` | `{ page?, rating?, comment }` |
| Demo Request | `POST /api/demo-request` | `{ name, email, company? }` |

**Public “enabled” list (for conditional UI):**

- **`GET /api/data-forms/enabled`** — Returns `{ inquiries: true, newsletter: true, contact: false, ... }`. Use this to show/hide CTAs or form triggers (e.g. only show “Get Started” when `inquiries` is true).

---

## 3. Input Screens (Modals)

Each form has a modal component. Wire them to buttons/links where you want the form to appear.

| Form | Component | Typical use |
|------|-----------|-------------|
| Get Started | `ConversationModal.svelte` | Hero CTA “Let’s get started” |
| Newsletter | `NewsletterModal.svelte` | Footer “Subscribe” or sidebar |
| Contact | `ContactModal.svelte` | “Contact us” link |
| Waitlist | `WaitlistModal.svelte` | “Join waitlist” / early access CTA |
| Feedback | `FeedbackModal.svelte` | “Send feedback” (optional `page` prop for current path) |
| Demo Request | `DemoRequestModal.svelte` | “Request a demo” CTA |

**Usage example (in a layout or page):**

```svelte
<script>
  import ConversationModal from '$lib/components/ConversationModal.svelte';
  import NewsletterModal from '$lib/components/NewsletterModal.svelte';
  import ContactModal from '$lib/components/ContactModal.svelte';
  import WaitlistModal from '$lib/components/WaitlistModal.svelte';
  import FeedbackModal from '$lib/components/FeedbackModal.svelte';
  import DemoRequestModal from '$lib/components/DemoRequestModal.svelte';

  let showInquiry = $state(false);
  let showNewsletter = $state(false);
  let showContact = $state(false);
  let showWaitlist = $state(false);
  let showFeedback = $state(false);
  let showDemo = $state(false);
</script>

<!-- Only show buttons when form is enabled (optional: fetch from GET /api/data-forms/enabled) -->
<button onclick={() => showInquiry = true}>Get started</button>
<button onclick={() => showNewsletter = true}>Subscribe</button>
<button onclick={() => showContact = true}>Contact</button>
<!-- ... -->

<ConversationModal bind:open={showInquiry} />
<NewsletterModal bind:open={showNewsletter} />
<ContactModal bind:open={showContact} />
<WaitlistModal bind:open={showWaitlist} />
<FeedbackModal bind:open={showFeedback} page="" />
<DemoRequestModal bind:open={showDemo} />
```

To **hide** a CTA when the form is disabled, load `GET /api/data-forms/enabled` in the layout (or a parent) and only render the button + modal when the corresponding key is `true`.

---

## 4. End-to-End Flow (Summary)

1. **Admin:** Studio → Settings → Data Forms → turn forms on/off → **Save** → config written to `config/data-forms.json` in the repo.
2. **Site:** Buttons/links open the corresponding modal. User submits; frontend `POST`s to the form’s API.
3. **API:** Checks Data Forms config (from repo, with short cache). If disabled → 503. If enabled → validate input, write one JSON file under the configured `data/<form>/` path via GitHub API, return success.
4. **Storage:** Each submission = one file (e.g. `data/inquiries/2025-03-02-143022-abc123.json`). Git history is the audit log. No DB.

---

## 5. Studio APIs (Authenticated)

- **GET /studio/api/data-forms-config** — Returns current Data Forms config (for Settings page).
- **POST /studio/api/data-forms-config** — Saves Data Forms config (body: full config object). Requires Studio session.

---

## 6. File Layout

```
config/
  data-forms.json          # Created by Studio; enable/disable + paths

data/
  inquiries/               # Get Started submissions
  newsletter/              # Newsletter signups
  contact/                 # Contact form submissions
  waitlist/                # Waitlist signups
  feedback/                # Feedback submissions
  demo-requests/           # Demo requests

src/
  lib/
    studio/
      data-forms-config.ts # Schema, defaults, loadDataFormsConfigFromRepo()
  routes/
    api/
      inquiries/+server.ts
      newsletter/+server.ts
      contact/+server.ts
      waitlist/+server.ts
      feedback/+server.ts
      demo-request/+server.ts
      data-forms/
        enabled/+server.ts # GET: { inquiries: true, ... }
    studio/
      api/
        data-forms-config/+server.ts  # GET/POST config
      settings/
        data-forms/+page.svelte        # Data Forms settings UI
  lib/components/
    ConversationModal.svelte   # Get Started
    NewsletterModal.svelte
    ContactModal.svelte
    WaitlistModal.svelte
    FeedbackModal.svelte
    DemoRequestModal.svelte
```

---

## 7. Optional: Conditional CTAs from enabled config

To show only enabled forms, fetch once (e.g. in `+layout.svelte` or +layout.server.ts) and pass down or use a store:

```svelte
<!-- +layout.svelte -->
<script>
  let enabled = $state({ inquiries: true, newsletter: true, contact: false, waitlist: false, feedback: false, demoRequest: false });
  onMount(async () => {
    const r = await fetch('/api/data-forms/enabled');
    const d = await r.json();
    enabled = d;
  });
</script>
```

Then use `{#if enabled.inquiries}` around the Get Started button + ConversationModal, etc.
