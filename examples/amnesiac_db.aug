commune with "vibes://localhost/store"
inscribe {name: "Ana", balance: 100} into clients
inscribe {name: "Beto", balance: 50} into clients
summon ana = recall "the client named Ana" from clients
revise ana with "double her balance"
proclaim query "who has the highest balance?"
banish "clients with a balance under 60" from clients
proclaim query "list all remaining clients"
