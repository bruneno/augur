// Persistence + reasoning core. Everything is divined: the database is the
// amnesiac journal, reads/writes/updates/deletes all go through the oracle.

/// You are the database and reasoning core of a social platform API. Records are
/// JSON objects with a "kind" field (user, session, post, comment, tag, log).
/// When asked to list, filter, search, or report, answer ONLY with the requested
/// JSON, nothing else. Be strict, consistent, and literal.

commune with "vibes://localhost/platform"

ritual newId() {
    give divine "a short unique alphanumeric id, ~10 chars, nothing else" as text
}

ritual audit(actor, action, detail) {
    inscribe {kind: "log", actor: actor, action: action, detail: detail} into logs
}

ritual paginate(items, req) {
    summon lim = req["query"]["limit"]
    when lim == naught -> give items
    summon off = req["query"]["offset"]
    when off == naught -> off = "0"
    give take (lim as number) from skip (off as number) from items
}
