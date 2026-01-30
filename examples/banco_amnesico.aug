commune with "vibes://localhost/loja"
inscribe {nome: "Ana", saldo: 100} into clientes
inscribe {nome: "Beto", saldo: 50} into clientes
summon ana = recall "a cliente chamada Ana" from clientes
revise ana with "dobre o saldo dela"
proclaim query "quem tem o maior saldo?"
banish "clientes com saldo menor que 60" from clientes
proclaim query "liste todos os clientes restantes"
