// outside certain: hallucinated response, with a plausible shape
summon fake = fetch "https://api.github.com/users/torvalds"
proclaim extract "the 'name' field" from fake

certain {
    // here it goes out over the real network
    summon real = fetch "https://httpbin.org/get"
    proclaim real
}
