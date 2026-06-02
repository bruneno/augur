import { describe, expect, it } from "vitest"
import { legeMandata } from "@/cli"

describe("legeMandata", () => {
  it("applies defaults when only a file is given", () => {
    const opts = legeMandata(["prog.aug"])
    expect(opts.fasciculus).toBe("prog.aug")
    expect(opts.seance).toBe(false)
    expect(opts.paranoicus).toBe(false)
    expect(opts.silens).toBe(false)
    expect(opts.memor).toBe(false)
    expect(opts.oraculum).toBeUndefined()
    expect(opts.exemplar).toBeUndefined()
    expect(opts.temperatura).toBeUndefined()
    expect(opts.aerarium).toBeUndefined()
    expect(opts.conatus).toBeUndefined()
  })

  it("maps every flag to the right field", () => {
    const opts = legeMandata([
      "prog.aug",
      "--oracle",
      "openai",
      "--model",
      "gpt-4o-mini",
      "--temperature",
      "0.4",
      "--budget",
      "10",
      "--retry",
      "2",
      "--paranoid",
      "--quiet",
      "--remember",
    ])
    expect(opts.fasciculus).toBe("prog.aug")
    expect(opts.oraculum).toBe("openai")
    expect(opts.exemplar).toBe("gpt-4o-mini")
    expect(opts.temperatura).toBe(0.4)
    expect(opts.aerarium).toBe(10)
    expect(opts.conatus).toBe(2)
    expect(opts.paranoicus).toBe(true)
    expect(opts.silens).toBe(true)
    expect(opts.memor).toBe(true)
  })

  it("treats the stdin sentinel as the fasciculus", () => {
    const opts = legeMandata(["-"])
    expect(opts.fasciculus).toBe("-")
  })

  it("throws an error mentioning --budget for a bad budget value", () => {
    expect(() => legeMandata(["prog.aug", "--budget", "abc"])).toThrow(/invalid --budget/)
  })

  it("throws an error mentioning --retry for a bad retry value", () => {
    expect(() => legeMandata(["prog.aug", "--retry", "abc"])).toThrow(/invalid --retry/)
  })
})
