# PandaScore — регистрация и подключение

## 1. Регистрация (бесплатно)

1. Откройте [https://app.pandascore.co/sign-up](https://app.pandascore.co/sign-up)
2. Создайте аккаунт (email + пароль)
3. Подтвердите email, если потребуется
4. Войдите в [Dashboard](https://app.pandascore.co/dashboard/main)

План **Fixtures** включён по умолчанию:

- **1000 запросов / час**
- Schedules, results, context data
- **Без карты** на free tier
- **Non-betting** usage only

## 2. Получить API token

1. Dashboard → раздел API / token (или [dashboard/main](https://app.pandascore.co/dashboard/main))
2. Скопируйте **API token**
3. Вставьте в `.env`:

```env
PANDASCORE_API_TOKEN=your_token_here
```

## 3. Проверка подключения

```bash
cp .env.example .env
# отредактируйте PANDASCORE_API_TOKEN

npm install
npm run sync:pandascore -- --verify
```

Ожидаемый вывод:

```
[pandascore] Token OK — API reachable
```

## 4. Dry-run (без записи в БД)

```bash
npm run sync:pandascore:dry
```

Покажет первые нормализованные события из API.

## 5. Полный sync (нужен PostgreSQL)

```bash
npm run db:push
npm run db:seed
npm run sync:pandascore
```

## 6. Фильтр по играм

```bash
npm run sync:pandascore -- --sport=league-of-legends,valorant
```

Поддерживаемые sport slugs (PandaScore):

| Sport slug | Игра | API prefix |
| --- | --- | --- |
| `league-of-legends` | LoL | `/lol/` |
| `dota-2` | Dota 2 | `/dota-2/` |
| `counter-strike-2` | CS2 | `/csgo/` |
| `valorant` | Valorant | `/valorant/` |
| `mobile-legends` | MLBB | `/mlbb/` |
| `honor-of-kings` | HoK / KOG | `/kog/` |

## 7. Attribution (обязательно на публичном сайте)

На страницах с данными PandaScore:

> Data provided by [PandaScore](https://www.pandascore.co)

## 8. Лицензия для нашего продукта

- ✅ Нормализованные **сводки** на сайте (commercial, non-betting)
- ✅ Хранение в PostgreSQL для своего продукта
- ❌ Продажа raw feed / API dump third parties
- ❌ Betting / odds продукты на free Fixtures plan

## 9. Slack поддержка (опционально)

[Join PandaScore Slack](https://join.slack.com/t/pandascore/shared_invite/zt-3ljcjj4mo-5q0ON2~qdef5umvzqq3mZw)
