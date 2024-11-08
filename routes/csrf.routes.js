const express = require("express")
const router = express.Router();
const { Client } = require("pg")

router.get("/", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login")
    }
    
    const client = new Client({
  connectionString: process.env.DATABASE_URL, // preferred in production
  ssl: {
    rejectUnauthorized: false // Required for external connections on Render
  }
});

    await client.connect();

    const rezultat = await client.query("SELECT * FROM transakcije")
    const transakcijeRetci = rezultat.rows

    const rezultatUpozorenja = await client.query("SELECT * FROM upozorenja")
    const upozorenjaRetci = rezultatUpozorenja.rows
    await client.end()

    res.render("csrf", {statusRanjivosti: req.session.ranjivost, transakcije: transakcijeRetci, upozorenja: upozorenjaRetci})
})



router.get("/placanje", async (req, res) => {
    

    if (!req.session.user) {
        console.log("Haker ne moze platiti svotu")
        res.redirect("/")
    } else {
        const client = new Client({
  connectionString: process.env.DATABASE_URL, // preferred in production
  ssl: {
    rejectUnauthorized: false // Required for external connections on Render
  }
});
    
        await client.connect();

        if (req.session.ranjivost == "ISKLJUČENA") {
            if (!req.query.CSRFToken || req.query.CSRFToken.toString() != req.session.CSRFToken) {
                console.log("Haker je pokusao CSRF, no stali smo mu na kraj")
                await client.query("INSERT INTO upozorenja(napadac, zrtva, svota) VALUES($1, $2, $3)", [req.query.primatelj, req.session.user, req.query.svota])
                
            } else {
                console.log("Placanje isprovedeno")
                await client.query("INSERT INTO transakcije(posiljatelj, primatelj, svota, ranjivost) VALUES($1, $2, $3, $4)", [req.session.user, req.query.primatelj, req.query.svota, false])
            }

        } else {
            console.log("Ranjivo placanje isprovedeno")
            await client.query("INSERT INTO transakcije(posiljatelj, primatelj, svota, ranjivost) VALUES($1, $2, $3, $4)", [req.session.user, req.query.primatelj, req.query.svota, true])

        }

        await client.end()
        res.redirect("/csrf")
    }
})



router.post("/ranjivostOnOff", (req, res) => {
    
    if (req.session.ranjivost == "UKLJUČENA") {
        req.session.ranjivost = "ISKLJUČENA"
        if (!req.session.csrftoken) {
            req.session.CSRFToken = Math.floor(Math.random() * (1000000000))
        }
        
    } else if (req.session.ranjivost == "ISKLJUČENA" || !req.session.ranjivost) {
        req.session.ranjivost = "UKLJUČENA"
        
        delete req.session.CSRFToken
        

    }
    res.redirect("/csrf")
})

router.get("/dohvatiPodatkeOSesiji", (req, res) => {
    res.json({
        statusRanjivosti: req.session.ranjivost,
        CSRFToken: req.session.CSRFToken
    })
})

router.get("/izbrisiSve", async (req, res) => {
    const client = new Client({
  connectionString: process.env.DATABASE_URL, // preferred in production
  ssl: {
    rejectUnauthorized: false // Required for external connections on Render
  }
});

    await client.connect();
    await client.query("DELETE FROM transakcije")
    await client.end()

    res.redirect("/csrf")
})

router.get("/izbrisiSvaUpozorenja", async (req, res) => {
    const client = new Client({
  connectionString: process.env.DATABASE_URL, // preferred in production
  ssl: {
    rejectUnauthorized: false // Required for external connections on Render
  }
});

    await client.connect();
    await client.query("DELETE FROM upozorenja")
    await client.end()

    res.redirect("/csrf")
})



module.exports = router
