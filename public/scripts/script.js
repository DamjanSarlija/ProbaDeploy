async function upravljajCSRFTokenom() {
    //formaZaPredaju = document.getElementById("ranjivostOnOff").submit()

    await fetch("/csrf/ranjivostOnOff", {
        method: "POST"
    })
    
    console.log("Ovdje")

    await fetch("/csrf/dohvatiPodatkeOSesiji", {method: "GET"}).then(response => {
        return response.json()
    }).then (podaci => {
        if (podaci.statusRanjivosti == "UKLJUČENA") {
            document.getElementById("statusRanjivostiTekst").textContent = "Ranjivost UKLJUČENA"
            skriveniInput = document.getElementById("skriveniInput")
            document.getElementById("transakcijskaForma").removeChild(skriveniInput)
        } else if (podaci.statusRanjivosti == "ISKLJUČENA") {
            document.getElementById("statusRanjivostiTekst").textContent = "Ranjivost ISKLJUČENA"
            skriveniInput = document.createElement("input")
            skriveniInput.name = "CSRFToken"
            skriveniInput.value = podaci.CSRFToken
            skriveniInput.id = "skriveniInput"
            skriveniInput.type = "hidden"
            document.getElementById("transakcijskaForma").appendChild(skriveniInput)
        }
    })

    console.log("Pa cak i ovdje")
}

async function skriveniElement() {
    await fetch("/csrf/dohvatiPodatkeOSesiji", {method: "GET"}).then(response => {
        return response.json()
    }).then (podaci => {
        if (podaci.statusRanjivosti == "ISKLJUČENA") {
            document.getElementById("statusRanjivostiTekst").textContent = "Ranjivost ISKLJUČENA"
            skriveniInput = document.createElement("input")
            skriveniInput.name = "CSRFToken"
            skriveniInput.value = podaci.CSRFToken
            skriveniInput.id = "skriveniInput"
            skriveniInput.type = "hidden"
            document.getElementById("transakcijskaForma").appendChild(skriveniInput)
        }
    })
}

skriveniElement()
