ritual handleLogs(req) {
    summon m = req["method"]
    summon p = req["path"]

    when m == "GET" and p == "/logs" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        when not isAdmin(who) -> give forbidden()
        summon all = recall "every log entry as {actor, action, detail}" from logs as [{actor: text, action: text, detail: text}]
        give {status: 200, body: paginate(all, req)}
    }

    when m == "GET" and p == "/logs/summary" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        when not isAdmin(who) -> give forbidden()
        give {status: 200, body: divine "summarize this audit log: return {totalEvents, topActions, anomalies} where anomalies flags suspicious patterns like repeated failed actions or privilege changes" upon recall "every log entry" from logs as {totalEvents: number, topActions: [text], anomalies: [text]}}
    }

    when m == "POST" and p == "/logs/query" -> {
        summon who = requireAuth(req)
        when who == naught -> give unauthorized()
        when not isAdmin(who) -> give forbidden()
        give {status: 200, body: divine "answer this natural-language question about the audit log" upon {logs: recall "every log entry" from logs, question: req["json"]["question"]} as text}
    }

    give naught
}
