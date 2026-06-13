ritual handleReports(req) {
    summon m = req["method"]
    summon p = req["path"]

    when m == "GET" and p == "/reports/overview" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        when not isAdmin(who) -> give forbidden()
        give {status: 200, body: divine "produce a dashboard {users, posts, comments, health} from these counts and a one-line health verdict" upon {users: count recall "every user" from users, posts: count recall "every post" from posts, comments: count recall "every comment" from comments} as {users: number, posts: number, comments: number, health: text}}
    }

    when m == "GET" and p == "/reports/users" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        when not isAdmin(who) -> give forbidden()
        give {status: 200, body: divine "group these users into cohorts by role and return each as {role, total, note}" upon recall "every user as {role}" from users as [{role: text, total: number, note: text}]}
    }

    when m == "POST" and p == "/reports/ask" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        when not isAdmin(who) -> give forbidden()
        give {status: 200, body: divine "answer this analytics question about the platform using the provided data" upon {question: req["json"]["question"], users: recall "every user" from users, posts: recall "every post" from posts, comments: recall "every comment" from comments} as text}
    }

    give naught
}
