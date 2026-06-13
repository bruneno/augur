ritual handleUsers(req) {
    summon m = req["method"]
    summon p = req["path"]

    when m == "GET" and p == "/users" -> {
        summon all = recall "every user as {id, username, email, role}, never the hash" from users as [{id: text, username: text, email: text, role: text}]
        give {status: 200, body: paginate(all, req)}
    }

    when m == "GET" and p == "/users/get" -> {
        give {status: 200, body: divine "the user whose id equals the given id, as {id, username, email, role}" upon {users: recall "every user" from users, id: req["query"]["id"]} as {id: text, username: text, email: text, role: text}}
    }

    when m == "GET" and p == "/users/search" -> {
        summon all = recall "every user as {id, username, email, role}" from users as [{id: text, username: text, email: text, role: text}]
        give {status: 200, body: divine "return only the users whose username or email is relevant to the query, by meaning and substring, case-insensitive" upon {users: all, q: req["query"]["q"]} as [{id: text, username: text, email: text, role: text}]}
    }

    when m == "GET" and p == "/users/role" -> {
        summon all = recall "every user as {id, username, email, role}" from users as [{id: text, username: text, email: text, role: text}]
        give {status: 200, body: divine "keep only the users whose role equals the given role" upon {users: all, role: req["query"]["role"]} as [{id: text, username: text, email: text, role: text}]}
    }

    when m == "PATCH" and p == "/users" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        revise {target: who, changes: req["json"]} with "apply the given profile changes to the target user"
        audit(who, "update-profile", "profile edited")
        give {status: 200, body: {ok: yes, username: who}}
    }

    when m == "POST" and p == "/users/promote" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        when not isAdmin(who) -> give forbidden()
        summon allowed = divine "is it safe to grant the requested role to the target user given platform policy (no self-promotion to owner)?" upon {actor: who, target: req["json"]["username"], role: req["json"]["role"]} as bool
        when not allowed -> give {status: 422, body: {error: "policy rejected the promotion"}}
        revise {target: req["json"]["username"], role: req["json"]["role"]} with "set the target user's role to the given role"
        audit(who, "promote", "changed a user role")
        give {status: 200, body: {ok: yes}}
    }

    when m == "POST" and p == "/users/batch" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        summon cleaned = divine "normalize this array of user drafts; each becomes {username, email, role}" upon req["json"]["items"] as [{username: text, email: text, role: text}]
        for u in cleaned {
            inscribe {kind: "user", id: newId(), username: u["username"], email: u["email"], hash: hashPw(u["username"]), role: u["role"]} into users
        }
        audit(who, "batch-create-users", "bulk user import")
        give {status: 201, body: {inserted: count cleaned}}
    }

    when m == "DELETE" and p == "/users" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        when not isAdmin(who) -> give forbidden()
        banish "the user whose id equals " + req["query"]["id"] from users
        audit(who, "delete-user", "removed a user")
        give {status: 200, body: {ok: yes, deleted: req["query"]["id"]}}
    }

    give naught
}
