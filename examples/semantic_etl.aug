summon names = ["ana", "joão", "  MARIA ", "pedro"]
summon cleaned = map names with "trim and title-case"
summon emails = extract "only valid emails" from "contact: ana@x.com, junk, j@y.org"
summon urgent = filter ["pay now", "hi how are you", "URGENT: server down"] by "look urgent"
proclaim sort cleaned by "alphabetical order"
