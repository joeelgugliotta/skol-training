
require("dotenv").config();

const express = require("express");
const { engine } = require("express-handlebars");
const nodemailer = require("nodemailer");
const db = require("./db");

const app = express();

const PORT = 3000;

db.query("SELECT 1", (error) => {

    if (error) {
        console.log("❌ ERROR DE CONEXIÓN CON MYSQL");
        console.log(error);
        return;
    }

    console.log("✅ MYSQL CONECTADO CORRECTAMENTE");
});

const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000

});

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Archivos públicos

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

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

app.get("/nosotros", (req, res) => {
    res.render("nosotros");
});

app.get("/admin/consultas", async (req, res) => {

    try {

        const [consultas] = await db.promise().query(
            "SELECT * FROM consultas ORDER BY fecha DESC"
        );

        res.render("admin/consultas", {
            consultas: consultas
        });

    } catch (error) {

        console.log("❌ ERROR AL OBTENER CONSULTAS");
        console.log(error);

        res.send("Hubo un error al obtener las consultas");
    }
});

app.get("/admin/consultas/editar/:id", async (req, res) => {

    const id = req.params.id;

    try {

        const [resultado] = await db.promise().query(
            "SELECT * FROM consultas WHERE id = ?",
            [id]
        );

        if (resultado.length === 0) {
            return res.send("Consulta no encontrada");
        }

        res.render("admin/editar", {
            consulta: resultado[0]
        });

    } catch (error) {

        console.log("❌ ERROR AL BUSCAR CONSULTA");
        console.log(error);

        res.send("Hubo un error");
    }
});

app.post("/admin/consultas/editar/:id", async (req, res) => {

    const id = req.params.id;

    const {
        nombre,
        email,
        plan,
        mensaje
    } = req.body;

    try {

        await db.promise().query(
            `
            UPDATE consultas
            SET nombre = ?, email = ?, plan = ?, mensaje = ?
            WHERE id = ?
            `,
            [nombre, email, plan, mensaje, id]
        );

        console.log("✅ CONSULTA ACTUALIZADA");

        res.redirect("/admin/consultas");

    } catch (error) {

        console.log("❌ ERROR AL ACTUALIZAR");
        console.log(error);

        res.send("Hubo un error al actualizar");
    }
});

app.post("/admin/consultas/eliminar/:id", async (req, res) => {

    const id = req.params.id;

    try {

        await db.promise().query(
            "DELETE FROM consultas WHERE id = ?",
            [id]
        );

        console.log("✅ CONSULTA ELIMINADA");

        res.redirect("/admin/consultas");

    } catch (error) {

        console.log("❌ ERROR AL ELIMINAR");
        console.log(error);

        res.send("Hubo un error al eliminar la consulta");
    }
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




    console.log("========== POST CONTACTO ==========");

    const nombre = req.body.nombre;
    const email = req.body.email;
    const mensaje = req.body.mensaje;
    const plan = req.body.plan;

    console.log("Nombre:", nombre);
    console.log("Email:", email);
    console.log("Plan:", plan);

    try {

        // =========================
        // GUARDAR EN MYSQL
        // =========================

        const sql = `
            INSERT INTO consultas (nombre, email, plan, mensaje)
            VALUES (?, ?, ?, ?)
        `;

        const [resultado] = await db.promise().query(
            sql,
            [nombre, email, plan || null, mensaje]
        );

        console.log("✅ CONSULTA GUARDADA EN MYSQL");
        console.log("ID:", resultado.insertId);


        // =========================
        // ENVIAR EMAIL
        // =========================

        const info = await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: process.env.EMAIL_USER,

            subject: "Nueva consulta - SKOL Training",

            text: `
Nueva consulta desde SKOL Training

Nombre: ${nombre}

Email: ${email}

Plan seleccionado:
${plan || "Consulta general"}

Mensaje:
${mensaje}
            `
        });

        console.log("✅ MAIL ENVIADO");
        console.log("Message ID:", info.messageId);

        res.render("confirmacion");

    } catch (error) {

        console.log("❌ ERROR");

        console.log(error);

        res.send("Hubo un error al procesar la consulta");
    }
});
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

