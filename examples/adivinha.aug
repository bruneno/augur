ritual main() {
    summon secret = divine "escolha um número aleatório de 1 a 100"
    summon tentativas = 0
    repeat forever {
        summon palpite = ask "Seu palpite: "
        tentativas = tentativas + 1
        when palpite == secret -> {
            proclaim "Acertou em " + tentativas + " tentativas!"
            break
        }
        when palpite < secret -> proclaim "Maior!"
        otherwise -> proclaim "Menor!"
    }
}
main()
