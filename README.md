# 🌿 Botaniq — инструкция по запуску

## Что внутри папки

```
botaniq/
├── src/
│   ├── App.js          ← главный код приложения
│   └── index.js        ← точка входа
├── public/
│   └── index.html      ← HTML-шаблон
├── netlify/
│   └── functions/
│       └── claude.js   ← прокси для API (ключ не светится)
├── netlify.toml        ← настройки деплоя
├── package.json        ← зависимости
└── README.md           ← эта инструкция
```

---

## Шаг 1 — Получи API-ключ Anthropic

1. Зайди на https://console.anthropic.com
2. Зарегистрируйся (или войди)
3. Слева → **API Keys** → **Create Key**
4. Скопируй ключ — он выглядит как `sk-ant-api03-...`
5. Пополни баланс на $5–10 (Settings → Billing)

---

## Шаг 2 — Залей проект на GitHub

1. Зайди на https://github.com → войди в аккаунт
2. Нажми **+** → **New repository**
3. Название: `botaniq`, нажми **Create repository**
4. На странице репозитория нажми **uploading an existing file**
5. Перетащи ВСЕ файлы из папки `botaniq` (вместе с папками src, public, netlify)
6. Нажми **Commit changes**

---

## Шаг 3 — Задеплой на Netlify

1. Зайди на https://netlify.com → войди в аккаунт
2. **Add new site** → **Import an existing project**
3. Выбери **GitHub** → найди репозиторий `botaniq`
4. Настройки сборки заполнятся автоматически из netlify.toml
5. Нажми **Deploy site**
6. Подожди 2–3 минуты

---

## Шаг 4 — Добавь API-ключ в Netlify

Это важно — без этого шага анализ работать не будет!

1. В Netlify открой свой сайт
2. Слева → **Site configuration** → **Environment variables**
3. Нажми **Add a variable**
4. Key: `ANTHROPIC_API_KEY`
5. Value: вставь свой ключ `sk-ant-api03-...`
6. Нажми **Save**
7. Перейди в **Deploys** → **Trigger deploy** → **Deploy site**

---

## Готово! 🎉

Твой сайт доступен по адресу типа `botaniq-xyz123.netlify.app`

Можно:
- Переименовать в **Site settings → Domain management → Change site name** → например `botaniq-app`
- Купить домен `botaniq.app` и подключить

---

## Если что-то не работает

Напиши Данилу — он разберётся с Клодом 😄
