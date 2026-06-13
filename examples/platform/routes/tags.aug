ritual handleTags(req) {
    summon m = req["method"]
    summon p = req["path"]

    when m == "POST" and p == "/tags" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        summon name = divine "normalize this into a single lowercase, hyphenated tag slug" upon req["json"]["name"] as text
        inscribe {kind: "tag", id: newId(), name: name} into tags
        audit(who, "create-tag", name)
        give {status: 201, body: {name: name}}
    }

    when m == "GET" and p == "/tags" -> {
        give {status: 200, body: recall "every tag as {id, name}" from tags as [{id: text, name: text}]}
    }

    when m == "GET" and p == "/tags/suggest" -> {
        give {status: 200, body: divine "suggest 5 to 8 relevant tag slugs for this text, lowercase and hyphenated" upon req["query"]["text"] as [text]}
    }

    when m == "DELETE" and p == "/tags" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        banish "the tag whose id equals " + req["query"]["id"] from tags
        audit(who, "delete-tag", req["query"]["id"])
        give {status: 200, body: {ok: yes, deleted: req["query"]["id"]}}
    }

    give naught
}
