# Petit Blooms — Rebuild Plan

A refined, editorial florist site that captures the deep-green + cream palette of the original, but elevated to feel like the work of a world-class studio. Build-to-order is the brand story: every bouquet is co-created by the customer's vision and a WSQ-trained florist's eye.

## 1. Brand & Design Direction

- **Palette**: deep botanical green (`#1f2e22`-ish) as primary, warm cream (`#f5f1e6`) as canvas, soft blush + muted clay accents, near-black ink for text on cream.
- **Typography**: distinctive serif display (e.g. Fraunces or Cormorant) paired with a refined sans (e.g. Inter Tight or Geist) for body/UI. Lowercase wordmark "petit blooms" preserved.
- **Voice**: British spelling, sentence case for body, lowercase for the wordmark only, Title Case for section headings. Standardised punctuation (curly quotes, en-dashes for ranges, em-dashes for asides).
- **Motion**: restrained — staggered fade/slide on section reveal, subtle image zoom on hover, smooth page transitions. No gimmicks.
- **Atmosphere**: generous whitespace, asymmetric editorial layouts, large hero imagery, elegant dividers, grain-free.

## 2. Information Architecture (consolidated nav)

Five menus → four cleaner ones:

- **Home** (`/`) — hero, brand story snippet, portfolio strip, services teaser, footer CTAs.
- **Shop** (`/shop`) — all products with category filter (All / Fresh Bouquets / Preserved / Accessories) and occasion sub-filters (Celebration, Anniversary, Birthday, Get Well Soon).
- **Shop product** (`/shop/$slug`) — full PDP with size/colour/flower dropdowns, add-ons (flower bag, bouquet companion), wrapping selector, quantity, add-to-cart.
- **Weddings & Services** (`/services`) — Intimate Love package, lead times, delivery, self-collection map.
- **About** (`/about`) — origin story + "giving what we can" social-impact section.
- **Contact** in footer + a slim `/contact` route (kept for SEO and direct linking, but de-emphasised in the top nav so the header stays tight: Home · Shop · Weddings · About).

Cart drawer accessible from every page (top-right "Bag (n)").

## 3. Pages — Section Breakdown

### Home
- Full-bleed hero image, wordmark, tagline "where flowers speak the language of love", primary CTA "Shop bouquets", secondary "Our story".
- Editorial intro: "Build-to-order florals, shaped by your story and a WSQ-trained florist's hand."
- Featured collections (3 cards: Fresh, Preserved, Weddings).
- Portfolio strip (horizontal scroll of 6 named bouquets).
- Services teaser (Intimate Love wedding package).
- Testimonial / values block.
- Footer (opening hours, follow us, contact, newsletter optional).

### Shop (listing)
- Soft cream banner with tagline "With love, petit blooms."
- Left rail (desktop) / top chips (mobile): category + occasion filters.
- Responsive product grid (3 cols desktop / 2 tablet / 1 mobile), large images, name + "from SGD …".

### Product detail
- Two-column: gallery left, details right.
- Breadcrumb (Shop › Category › Product).
- Title, price (recomputed from selections), description.
- Dropdowns per the appendix (Size, Colour scheme, Stalks, Colour, Flower Requests, Booking type, etc.) — each option can carry a price delta.
- Add-on cards beneath: Flower Bag, Bouquet Companion, Wrapping Catalogue (selector, not standalone add).
- Quantity stepper + Add to cart.
- Care/lead-time note + cross-sell strip.

### Weddings & Services
- Editorial hero with bouquet imagery.
- Intimate Love package card ($300 inclusions).
- Lead times, no-cancellation policy.
- Two-column: Delivery (pricing tiers, complimentary >$180) | Self-collection (Bishan address + embedded map).
- CTA to contact.

### About
- "petit bloom's origin" — Denise's story, refined copy.
- "giving what we can, when we can" — donation work (Oasis@Outram, Medical Aid for Palestinians).
- Quiet imagery, pull quotes.

### Contact
- Email, Instagram, Telegram with proper icons and links.
- Response-time note.
- Map + opening hours echo.

### Footer (global)
- Opening hours, Follow us (IG, Telegram), quick links, fine print.

## 4. Cart & Checkout

- Client-side cart (Zustand or React context + localStorage) until payment is wired.
- Cart drawer: line items with selected options, qty edit, remove, subtotal, "Proceed to checkout".
- Checkout page collects recipient/delivery info and routes to payment provider.
- **Payments**: enable Lovable Cloud, then run the payments eligibility check and wire Stripe (built-in) for low-fee, flexible checkout. Products seeded via `batch_create_product` after enable. Webhook handler for order confirmation.

## 5. Data Model (Lovable Cloud)

- `products` (slug, name, category, occasion[], base_price, description, hero_image, gallery[]).
- `product_options` (product_id, group, label, price_delta, sort).
- `orders` (customer, items jsonb, totals, status, fulfilment: delivery|pickup, address, scheduled_for).
- `order_items` if normalised; otherwise jsonb on order.
- RLS: products public-read; orders insert by anyone, select by owner via email magic link or admin role.
- Admin role via separate `user_roles` table + `has_role()` security-definer function (per platform guidance).

## 6. Imagery Strategy

For the first build, use the user's uploaded photos where they map cleanly (hero, portfolio, PDPs for Petit Signature, Timeless Love, Helio's Bloom, Petal Symphony, Spring's Whisper, Events). Where no photo exists, generate tasteful, on-brand stand-ins (deep-green backdrops, natural light, hand-held bouquets). All easily replaceable later.

## 7. Tech Notes

- TanStack Start file-based routing under `src/routes/`: `index.tsx`, `shop.tsx`, `shop.$slug.tsx`, `services.tsx`, `about.tsx`, `contact.tsx`. Each with proper `head()` (title, description, og:title/description/image).
- Design tokens in `src/styles.css` (oklch). New tokens: `--ink`, `--cream`, `--forest`, `--forest-deep`, `--blush`, `--clay`, plus gradient + shadow tokens.
- Components: `Header`, `Footer`, `ProductCard`, `ProductGrid`, `Filters`, `OptionSelect`, `AddOnCard`, `CartDrawer`, `QuantityStepper`, `SectionHeading`.
- shadcn primitives reused for Select, Sheet (cart drawer), Dialog, Button.
- SEO: route-specific meta + JSON-LD `Product` on PDPs, `LocalBusiness` on contact/services.

## 8. Build Order

1. Design tokens, fonts, header/footer shell, route files with metadata.
2. Home page.
3. Shop listing with seeded product data (typed TS file initially).
4. PDP with dynamic pricing from option deltas.
5. Cart drawer + checkout scaffold.
6. Services, About, Contact.
7. Enable Lovable Cloud, move products to DB, add orders table + RLS.
8. Run payments recommendation → enable Stripe payments → wire checkout + webhook.
9. Polish pass: copy proofread (British spelling, consistent capitalisation), motion, responsive QA.

## Open questions (will ask after approval if needed)

- Confirm Stripe (built-in, low-setup, flexible tax) is fine vs Paddle.
- Confirm the consolidated header (Home · Shop · Weddings · About, with Contact in footer) — or keep Contact in the top nav.
- For now I'll use the uploaded photos + generate on-brand fillers; you'll swap in finals later.
