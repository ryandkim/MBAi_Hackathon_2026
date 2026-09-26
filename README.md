# mixer.

Less group chat, more mixers. Mixr helps KWEST social chairs plan group events with an AI agent: event size, budget per person, venue finding and holds, and matching with other KWESTs planning something similar.

## Run the prototype

```sh
cd mixer-ui
python3 -m http.server 8000
# open http://localhost:8000
```

- `index.html`: home dashboard, Calendar (📅) and Invites (✉️) tabs
- `create.html`: event builder (the + tab)
- `web.html`: desktop organizer and venue portal view

All data is sample data from `mixer-ui/js/store.js`. See [docs/POC_PLAN.md](docs/POC_PLAN.md) for the API plan.
