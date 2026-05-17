// A CRUD where EVERY route goes through the LLM — no `certain` anywhere.
// Storage is the amnesiac divined journal; reads are divined over it; writes are
// cleaned up by the oracle first. Persistence is fiction and the store forgets
// its oldest records when the journal overflows — that is the whole joke.
//
// Run it (needs a real oracle):
//   aug examples/crud_llm.aug --oracle openrouter --model openai/gpt-4o-mini
//
// Then:
//   curl -s -X POST localhost:8788/notes -d '{"text":"  buy MILK!!  "}'
//   curl -s localhost:8788/notes
//   curl -s "localhost:8788/notes/search?q=groceries"

/// You are the database for a notes app. Records are JSON objects with a text
/// field and a tags array. When asked to list or filter, answer ONLY with the
/// requested JSON array, nothing else.

commune with "vibes://localhost/notes"

ritual handle(req) {
    summon method = req["method"]
    summon path = req["path"]

    // CREATE — the oracle normalizes the note and invents tags before storing
    when method == "POST" and path == "/notes" -> {
        summon note = divine "clean up the text and add a short tags array" upon req["json"] as {text: text, tags: [text]}
        inscribe note into notes
        give {status: 201, body: note}
    }

    // SEARCH — the oracle lists the store, then filters it by the query
    when method == "GET" and path == "/notes/search" -> {
        summon all = query "every stored note as a JSON array of {text, tags}" as [{text: text, tags: [text]}]
        give {status: 200, body: divine "return only the notes matching the search query 'q'" upon {notes: all, q: req["query"]["q"]} as [{text: text, tags: [text]}]}
    }

    // LIST — the oracle reconstructs the whole store from its journal
    when method == "GET" and path == "/notes" ->
        give {status: 200, body: query "every stored note as a JSON array of {text, tags}" as [{text: text, tags: [text]}]}

    give {status: 404, body: {error: "not found", path: path}}
}

serve 8788 with handle
