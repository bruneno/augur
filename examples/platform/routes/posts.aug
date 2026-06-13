ritual handlePosts(req) {
    summon m = req["method"]
    summon p = req["path"]

    when m == "POST" and p == "/posts" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        summon enriched = divine "from this draft produce {title, content, slug, tags, summary, readingMinutes, safe}: a url slug, 3-6 topical tags, a one-sentence summary, an integer reading-time estimate, and whether it is safe (no hate or spam)" upon req["json"] as {title: text, content: text, slug: text, tags: [text], summary: text, readingMinutes: number, safe: bool}
        when not enriched["safe"] -> give {status: 422, body: {error: "post rejected by moderation"}}
        summon post = {kind: "post", id: newId(), author: who, title: enriched["title"], content: enriched["content"], slug: enriched["slug"], tags: enriched["tags"], summary: enriched["summary"], readingMinutes: enriched["readingMinutes"], status: "draft"}
        inscribe post into posts
        audit(who, "create-post", enriched["slug"])
        give {status: 201, body: post}
    }

    when m == "GET" and p == "/posts" -> {
        summon all = recall "every post as {id, author, title, slug, summary, tags, status}" from posts as [{id: text, author: text, title: text, slug: text, summary: text, tags: [text], status: text}]
        give {status: 200, body: paginate(all, req)}
    }

    when m == "GET" and p == "/posts/get" -> {
        give {status: 200, body: divine "the post whose id equals the given id" upon {posts: recall "every post" from posts, id: req["query"]["id"]} as {id: text, author: text, title: text, content: text, slug: text, summary: text, tags: [text], status: text}}
    }

    when m == "GET" and p == "/posts/search" -> {
        summon all = recall "every post as {id, title, summary, tags}" from posts as [{id: text, title: text, summary: text, tags: [text]}]
        give {status: 200, body: divine "return only the posts relevant to the query by meaning across title, summary and tags" upon {posts: all, q: req["query"]["q"]} as [{id: text, title: text, summary: text, tags: [text]}]}
    }

    when m == "GET" and p == "/posts/feed" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        give {status: 200, body: divine "rank these posts into a personalized feed for this user, most relevant first" upon {posts: recall "every published post" from posts, user: who} as [{id: text, title: text, summary: text}]}
    }

    when m == "GET" and p == "/posts/trending" -> {
        give {status: 200, body: divine "rank these posts by a trending score from recency and engagement signals; return the top ten as {id, title, score}" upon recall "every post" from posts as [{id: text, title: text, score: number}]}
    }

    when m == "PATCH" and p == "/posts" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        revise {target: req["query"]["id"], changes: req["json"]} with "apply the given edits to the target post"
        audit(who, "update-post", req["query"]["id"])
        give {status: 200, body: {ok: yes}}
    }

    when m == "POST" and p == "/posts/publish" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        revise "the post whose id equals " + req["query"]["id"] with "set the status field to published"
        audit(who, "publish", req["query"]["id"])
        give {status: 200, body: {ok: yes, status: "published"}}
    }

    when m == "POST" and p == "/posts/moderate" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        when not isAdmin(who) -> give forbidden()
        summon post = divine "the post whose id equals the given id" upon {posts: recall "every post" from posts, id: req["query"]["id"]}
        summon verdict = divine "moderate this post and return {allow, reason, severity}, judging hate, spam, and self-harm" upon post as {allow: bool, reason: text, severity: number}
        when not verdict["allow"] -> banish "the post whose id equals " + req["query"]["id"] from posts
        audit(who, "moderate", req["query"]["id"])
        give {status: 200, body: verdict}
    }

    when m == "POST" and p == "/posts/batch" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        summon drafts = divine "normalize this array of post drafts; each becomes {title, content}" upon req["json"]["items"] as [{title: text, content: text}]
        for d in drafts {
            inscribe {kind: "post", id: newId(), author: who, title: d["title"], content: d["content"], status: "draft"} into posts
        }
        audit(who, "batch-create-posts", "bulk import")
        give {status: 201, body: {inserted: count drafts}}
    }

    when m == "DELETE" and p == "/posts/batch" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        when not isAdmin(who) -> give forbidden()
        banish req["query"]["criterion"] from posts
        audit(who, "batch-delete-posts", req["query"]["criterion"])
        give {status: 200, body: {ok: yes}}
    }

    when m == "DELETE" and p == "/posts" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        banish "the post whose id equals " + req["query"]["id"] from posts
        audit(who, "delete-post", req["query"]["id"])
        give {status: 200, body: {ok: yes, deleted: req["query"]["id"]}}
    }

    give naught
}
