const express = require("express")
const router = express.Router();

const { Client } = require("pg")


router.get("/", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login")
    }

    const client = new Client({
        user: "postgres",
        password: "bazepodataka",
        host: "localhost",
        port: "5432",
        database: "Web_Lab2_Database"
    })

    await client.connect();
    
    const rezultat = await client.query("SELECT * FROM objave")
    const poruke = rezultat.rows
    await client.end()
    res.render("home", {
        objave: poruke,
        statusXSS: req.session.ranjivostXSS
    })
    
})

router.post("/upis", async (req, res) => {
    const client = new Client({
        user: "postgres",
        password: "bazepodataka",
        host: "localhost",
        port: "5432",
        database: "Web_Lab2_Database"
    })

    await client.connect();

    tekstZaUpis = req.body.tekstObjave;
    
    if (req.session.ranjivostXSS == "ISKLJUČENA") {
       tekstZaUpis =  tekstZaUpis.replaceAll("<", "&lt")
                .replaceAll(">", "&gt")
                .replaceAll("\"", "&quot")
                .replaceAll("'", "&#39")
                .replaceAll("&", "&amp")
                
    }

    await client.query("INSERT INTO objave(sadrzaj) VALUES($1)", [tekstZaUpis]);

    const rezultat = await client.query("SELECT * FROM objave")
    const poruke = rezultat.rows

    await client.end()

    res.redirect("/")
})

router.get("/izbrisiSve", async (req, res) => {
    const client = new Client({
        user: "postgres",
        password: "bazepodataka",
        host: "localhost",
        port: "5432",
        database: "Web_Lab2_Database"
    })

    await client.connect();
    await client.query("DELETE FROM objave")
    await client.end()

    res.redirect("/")
})






router.post("/login", (req, res) => {
    if ((req.body.username == "korisnik1" && req.body.password == "lozinka1") || (req.body.username == "korisnik2" && req.body.password == "lozinka2")) {
        req.session.user = req.body.username
        req.session.ranjivostXSS = "UKLJUČENA"
        req.session.ranjivost = "UKLJUČENA"
        res.redirect("/")
    } else {
        res.redirect("/login")
    }
})

router.post("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/login")
})

router.get("/login", (req, res) => {
    res.render("csrflogin", {})
})

router.post("/promijeniStatusXSS", (req, res) => {
    if (req.session.ranjivostXSS == "UKLJUČENA") {
        req.session.ranjivostXSS = "ISKLJUČENA"
    } else if (req.session.ranjivostXSS == "ISKLJUČENA") {
        req.session.ranjivostXSS = "UKLJUČENA"
    } else {
        console.log("Error")
    }
    res.redirect("/")
})






module.exports = router