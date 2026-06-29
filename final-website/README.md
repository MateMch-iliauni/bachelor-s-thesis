# გაზქურის მონიტორინგის სისტემა — landing page

ილიას სახელმწიფო უნივერსიტეტის კომპიუტერული ინჟინერიის საბაკალავრო
დამამთავრებელი პროექტის (CE490B) ლენდინგ-გვერდი.

არაკონტაქტური თერმული მონიტორინგის სისტემა, რომელიც გაზქურაზე ცეცხლის
ანთებასა და უკონტროლო ჩაქრობას აფიქსირებს (ESP-32S + MLX90640).

## სტეკი

წმინდა HTML / CSS / JavaScript — ფრეიმვორქების ან ბიბლიოთეკების გარეშე.
ქართული ფონტი: **BPG Rioni Arial** (ლოკალურად, `/fonts`-ში).

## სტრუქტურა

```
index.html          — ერთგვერდიანი საიტი
css/style.css       — სტილები (thermal iron თემა)
css/fonts.css       — @font-face
js/main.js          — thermal canvas, count-up, chart, reveal
fonts/              — BPG Rioni Arial (woff2/woff/ttf/…)
assets/             — gadget ფოტოები + დემო ვიდეო
vercel.json         — Vercel-ის კონფიგი (cache headers, clean URLs)
```

## ლოკალურად გაშვება

ნებისმიერი სტატიკური სერვერი საკმარისია:

```bash
python3 -m http.server 8080
# გახსენი http://localhost:8080
```

## Vercel-ზე ჰოსტინგი

1. ატვირთე ეს საქაღალდე GitHub-ის რეპოზიტორიად.
2. Vercel-ში → **Add New → Project** → აირჩიე რეპო.
3. Framework Preset: **Other**, Build Command: ცარიელი, Output Dir: `./`.
4. **Deploy**.

სტატიკური საიტია — build საჭირო არ არის.

## წყარო

ვებგვერდის შინაარსი ეფუძნება საბაკალავრო ნაშრომის საბოლოო PDF დოკუმენტს.
სრული deliverable-ები: <https://github.com/MateMch-iliauni/bachelor-s-thesis>
