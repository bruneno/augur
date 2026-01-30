summon nomes = ["ana", "joão", "  MARIA ", "pedro"]
summon limpos = map nomes with "trim e title case"
summon emails = extract "só emails válidos" from "contato: ana@x.com, lixo, j@y.org"
summon urgentes = filter ["pague já", "oi tudo bem", "URGENTE: servidor caiu"] by "parecem urgentes"
proclaim sort limpos by "ordem alfabética"
