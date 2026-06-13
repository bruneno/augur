ritual handleAuth(req) {
    summon m = req["method"]
    summon p = req["path"]

    when m == "POST" and p == "/auth/register" -> {
        summon ok = divine "is this a valid registration: a non-empty username, a password of at least 6 characters, and a plausible email address?" upon req["json"] as bool
        when not ok -> give {status: 400, body: {error: "invalid registration payload"}}
        summon hashed = hashPw(req["json"]["password"])
        summon user = {kind: "user", id: newId(), username: req["json"]["username"], email: req["json"]["email"], hash: hashed, role: "member"}
        inscribe user into users
        audit(req["json"]["username"], "register", "new account created")
        give {status: 201, body: {id: user["id"], username: user["username"], welcome: divine "a warm one-line welcome" upon req["json"]["username"]}}
    }

    when m == "POST" and p == "/auth/login" -> {
        summon hashed = hashPw(req["json"]["password"])
        summon valid = divine "is there exactly one stored user whose username equals the given username AND whose stored hash equals the given hash?" upon {users: recall "every user" from users, username: req["json"]["username"], hash: hashed} as bool
        when not valid -> give {status: 401, body: {error: "invalid credentials"}}
        summon token = mintToken(req["json"]["username"])
        audit(req["json"]["username"], "login", "session opened")
        give {status: 200, body: {token: token}}
    }

    when m == "POST" and p == "/auth/logout" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        banish "the session whose token equals " + req["headers"]["authorization"] from sessions
        audit(who, "logout", "session closed")
        give {status: 200, body: {ok: yes}}
    }

    when m == "GET" and p == "/auth/me" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        give {status: 200, body: divine "the stored user with this username, omitting the hash field" upon {users: recall "every user" from users, username: who} as {username: text, email: text, role: text}}
    }

    when m == "POST" and p == "/auth/refresh" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        banish "the session whose token equals " + req["headers"]["authorization"] from sessions
        summon token = mintToken(who)
        audit(who, "refresh", "token rotated")
        give {status: 200, body: {token: token}}
    }

    when m == "POST" and p == "/auth/password/reset" -> {
        summon hashed = hashPw(req["json"]["newPassword"])
        revise {target: req["json"]["username"], hash: hashed} with "set the target user's password hash to the given hash"
        audit(req["json"]["username"], "password-reset", "password changed")
        give {status: 200, body: {ok: yes}}
    }

    when m == "GET" and p == "/auth/sessions" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        give {status: 200, body: divine "the tokens of all sessions belonging to this username" upon {sessions: recall "every session" from sessions, username: who} as [text]}
    }

    when m == "DELETE" and p == "/auth/sessions" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        banish "every session belonging to " + who from sessions
        audit(who, "revoke-all", "all sessions revoked")
        give {status: 200, body: {ok: yes}}
    }

    give naught
}
