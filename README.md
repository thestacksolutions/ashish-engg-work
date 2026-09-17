# Ashish Engineering Works — Website

A one-page, static portfolio site (HTML/CSS/JS) with an optional PHP + MySQL
contact-form backend. Built for Hostinger shared hosting.

## Folder structure

```
index.html               Main page (all sections)
css/
  style.css              Source stylesheet — edit this
  style.min.css          Minified build served by index.html
js/
  script.js              Source script — edit this
  script.min.js          Minified build served by index.html
data/
  products.json          Product catalogue — edit this to add/remove products
assets/
  images/                All photos, logo, favicons, certificate preview
  downloads/             The downloadable ISO certificate file
php/
  contact.php            Contact-form handler (works with or without MySQL)
  config.sample.php      Copy to config.php and fill in real DB credentials
sql/
  schema.sql             Run once to create the `enquiries` table
.htaccess                HTTPS redirect, caching, security headers
robots.txt, sitemap.xml  SEO crawling files
site.webmanifest         Home-screen icon metadata
```

## 1. Deploying to Hostinger

1. In hPanel, point your new domain at your hosting plan.
2. Upload everything in this folder to `public_html/` (via File Manager or FTP).
3. Visit the domain — the site works immediately with **no database required**.
   The contact form will fall back to opening the visitor's email app if the
   PHP endpoint isn't reachable, so nothing is lost even before you set up MySQL.

## 2. Editing the product catalogue (no code required)

Open `data/products.json`. Each category has a `name`, a short `blurb`, and a
list of `items` (`name`, `image`, `alt`). To add a product:

1. Drop an optimised square photo (roughly 700×700px, JPG) into `assets/images/`.
2. Add a new entry to the relevant category's `items` array using the same
   `image` filename and a descriptive `alt` (used for SEO and screen readers).

No HTML or JS editing is needed — the page reads this file automatically.

## 3. Editing text, contact details, or design

- Company text (About, Quality, Contact) lives directly in `index.html`.
- Colours, fonts and spacing are all defined as CSS variables at the top of
  `css/style.css` (the `:root { ... }` block) — change a value there to
  restyle the whole site consistently.
- After editing `css/style.css` or `js/script.js`, regenerate the minified
  files that `index.html` actually loads:
  ```bash
  npx cleancss -o css/style.min.css css/style.css
  npx terser js/script.js -c -m -o js/script.min.js --comments false
  ```
  (Requires Node.js locally — this is a one-time dev-machine step, not
  something Hostinger needs to run.)

## 4. Turning on the MySQL-backed contact form (optional)

The form works out of the box by emailing enquiries. If you also want a
searchable record of every enquiry:

1. In hPanel → **Databases → MySQL Databases**, create a database and user,
   and note the host, database name, username and password.
2. Open phpMyAdmin for that database and run the contents of `sql/schema.sql`.
3. Copy `php/config.sample.php` to `php/config.php` and fill in the four
   `db_*` values from step 1.
4. That's it — `contact.php` will start writing every submission into the
   `enquiries` table in addition to emailing you.

`config.php` is blocked from direct browser access by `.htaccess`, and is
the only file that should ever contain real credentials.

## 5. Before going live — replace placeholders

- Swap `https://www.ashishengineeringworks.com` in `index.html`,
  `robots.txt` and `sitemap.xml` for your real domain once purchased.
- Confirm the Google Maps embed URL in the Contact section resolves to the
  exact pin you want (search the address on Google Maps, use *Share → Embed
  a map*, and swap the `src` if you'd like a more precise location).
- Update `sitemap.xml`'s `<loc>` URLs the same way.

## 6. On "hiding" the code

Browsers must download and run HTML, CSS and JavaScript to display a page,
so any front-end code can always be viewed through a browser's "View Source"
or DevTools — that's true of every website, including apple.com. What this
build does to keep things tidy and non-obvious to casual visitors:

- Production `index.html` loads the **minified** `style.min.css` and
  `script.min.js` — condensed to one line with short variable names, which
  is unreadable at a glance even though it's technically "visible."
- There's nothing sensitive to hide: no API keys or business logic live in
  the front-end code. The one thing worth protecting — your database
  password — lives only in `php/config.php` on the server, which visitors'
  browsers never receive and `.htaccess` blocks from direct requests.

## 7. SEO / AEO notes

- One `<h1>` (hero headline), `<h2>` per major section, semantic
  `<header>`, `<main>`, `<section>`, `<footer>`.
- Every content image has a descriptive `alt` attribute.
- `<link rel="canonical">`, Open Graph and Twitter Card tags are set.
- JSON-LD structured data included for `Manufacturer` (address, phone,
  certification) and `FAQPage` (common buyer questions) — this is what
  helps AI answer engines and Google's rich results surface accurate
  answers about the company.
- `sitemap.xml` and `robots.txt` are ready to submit to Google Search
  Console once the domain is live.
