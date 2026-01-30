// fora de certain: resposta alucinada, com formato plausível
summon fake = fetch "https://api.github.com/users/torvalds"
proclaim extract "o campo 'name'" from fake

certain {
    // aqui sai pela rede de verdade
    summon real = fetch "https://httpbin.org/get"
    proclaim real
}
