ritual handleComments(req) {
    summon m = req["method"]
    summon p = req["path"]

    when m == "POST" and p == "/comments" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        summon check = divine "is this comment civil (no harassment, hate, or spam)?" upon req["json"]["body"] as bool
        when not check -> give {status: 422, body: {error: "comment rejected as toxic"}}
        summon comment = {kind: "comment", id: newId(), post: req["json"]["post"], author: who, body: req["json"]["body"]}
        inscribe comment into comments
        audit(who, "create-comment", req["json"]["post"])
        give {status: 201, body: comment}
    }

    when m == "GET" and p == "/comments" -> {
        summon all = recall "every comment as {id, post, author, body}" from comments as [{id: text, post: text, author: text, body: text}]
        give {status: 200, body: divine "keep only the comments whose post field equals the given post id" upon {comments: all, post: req["query"]["post"]} as [{id: text, post: text, author: text, body: text}]}
    }

    when m == "GET" and p == "/comments/flagged" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        summon all = recall "every comment as {id, author, body}" from comments as [{id: text, author: text, body: text}]
        give {status: 200, body: divine "return only the comments that a moderator should review, each as {id, reason}" upon all as [{id: text, reason: text}]}
    }

    when m == "PATCH" and p == "/comments" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        revise {target: req["query"]["id"], body: req["json"]["body"]} with "set the target comment's body to the given body"
        audit(who, "update-comment", req["query"]["id"])
        give {status: 200, body: {ok: yes}}
    }

    when m == "POST" and p == "/comments/batch" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        summon items = divine "normalize this array of comment drafts; each becomes {post, body}" upon req["json"]["items"] as [{post: text, body: text}]
        for it in items {
            inscribe {kind: "comment", id: newId(), post: it["post"], author: who, body: it["body"]} into comments
        }
        audit(who, "batch-create-comments", "bulk import")
        give {status: 201, body: {inserted: count items}}
    }

    when m == "DELETE" and p == "/comments" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        banish "the comment whose id equals " + req["query"]["id"] from comments
        audit(who, "delete-comment", req["query"]["id"])
        give {status: 200, body: {ok: yes, deleted: req["query"]["id"]}}
    }

    give naught
}
