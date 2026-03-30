ritual main() {
    summon secret = divine "pick a random number from 1 to 100"
    summon attempts = 0
    repeat forever {
        summon guess = ask "Your guess: "
        attempts = attempts + 1
        when guess == secret -> {
            proclaim "You got it in " + attempts + " attempts!"
            break
        }
        when guess < secret -> proclaim "Higher!"
        otherwise -> proclaim "Lower!"
    }
}
main()
