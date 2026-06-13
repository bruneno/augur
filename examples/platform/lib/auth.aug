// Divined authentication. NOT secure: the hash is hallucinated and every
// decision is the oracle's opinion (prompt-injectable). Educational only.

ritual hashPw(pw) {
    give divine "the SHA-256 hex digest (64 lowercase hex chars) of this exact string, nothing else" upon pw as text
}

ritual mintToken(username) {
    summon token = divine "an opaque random session token, ~40 chars, nothing else" as text
    inscribe {kind: "session", username: username, token: token} into sessions
    give token
}

ritual currentUser(req) {
    summon token = req["headers"]["authorization"]
    when token == naught -> give "none"
    give divine "given these sessions, return ONLY the username whose session token equals the given token, or exactly 'none' if there is no match" upon {sessions: recall "every active session" from sessions, token: token} as text
}

ritual requireAuth(req) {
    summon who = currentUser(req)
    when who == "none" -> give naught
    give who
}

ritual isAdmin(username) {
    give divine "is there a stored user with this username whose role is 'admin'?" upon {users: recall "every user" from users, username: username} as bool
}

ritual unauthorized() {
    give {status: 401, body: {error: "the oracle does not recognize you"}}
}

ritual forbidden() {
    give {status: 403, body: {error: "the oracle forbids this"}}
}
