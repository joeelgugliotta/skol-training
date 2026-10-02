
require("dotenv").config();

const express = require("express");
const { engine } = require("express-handlebars");
const nodemailer = require("nodemailer");

const app = express();

const PORT = 3000;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});




// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Archivos públicos
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

// Rutas
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/planes", (req, res) => {
    res.render("planes");
});

app.get("/planes/upper-lower-4", (req, res) => {
    res.render("planes/upper-lower-4");
});

app.get("/planes/upper-lower-3", (req, res) => {
    res.render("planes/upper-lower-3");
});

app.get("/planes/acondicionamiento", (req, res) => {
    res.render("planes/acondicionamiento");
});

app.get("/planes/empuje-traccion", (req, res) => {
    res.render("planes/empuje-traccion");
});

app.get("/sobre-mi", (req, res) => {
    res.render("sobre-mi");
});

app.get("/contacto", (req, res) => {

    const plan = req.query.plan;

    let nombrePlan = "";

    if (plan === "upper-lower-4") {
        nombrePlan = "Upper / Lower — 4 días";
    }

    if (plan === "upper-lower-3") {
        nombrePlan = "Upper / Lower — 3 días";
    }

    if (plan === "acondicionamiento") {
        nombrePlan = "Acondicionamiento físico — 3 días";
    }

    if (plan === "empuje-traccion") {
        nombrePlan = "Empuje / Tracción — 3 días";
    }

    res.render("contacto", {
        plan: nombrePlan
    });

});


app.post("/contacto", async (req, res) => {

    const { nombre, email, mensaje } = req.body;

    try {

        await transporter.sendMail({

            from: "TU_EMAIL@gmail.com",

            to: "TU_EMAIL@gmail.com",

            subject: "Nueva consulta - SKOL Training",

            text: `
Nueva consulta desde SKOL Training

Nombre: ${nombre}

Email: ${email}

Mensaje:
${mensaje}
            `

        });

        res.send("Consulta enviada correctamente");

    } catch (error) {
        console.log(error);
        res.send("Hubo un error al enviar la consulta");
    }
});


app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

