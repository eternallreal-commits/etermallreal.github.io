# Link in Bio

Персональная страница со ссылками — аналог Linktree.

## Быстрый старт

1. Открой `index.html` в браузере (двойной клик или Live Server).
2. Отредактируй текст и ссылки в `index.html`.
3. Замени аватар — укажи свой URL или положи `avatar.jpg` в папку.

## Что менять

| Элемент | Где |
|---------|-----|
| Имя, bio, tagline | `<header class="profile">` |
| Соцсети | `.socials` — href и aria-label |
| Кнопки-ссылки | `.links` — title, desc, href |
| Проекты | `.projects` |
| Цвета | `styles.css` → `:root` |

## Деплой (бесплатно)

- **GitHub Pages** — залей репозиторий, включи Pages в Settings.
- **Netlify / Vercel** — перетащи папку на сайт или подключи GitHub.

## Структура

```
link-in-bio/
├── index.html
├── styles.css
├── script.js
└── README.md
```
