const express = require("express");
const app = express();
const http = require("http");
const faker = require("faker");
const server = http.createServer(app);
const PORT = process.env.PORT || 1111;
const { Server } = require("socket.io");
const io = new Server(server);
const { normalize, schema } = require("normalizr");
const fs = require("fs");
const print = require("./helper");
const { v4: uuidv4 } = require("uuid");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const User = require("./models/Usuarios");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
mongoose.connect(
  "mongodb+srv://User:2t17C0PDVc7dWuI2@cluster0.j9v3p2d.mongodb.net/test"
);
const arr = [
  {
    title: faker.commerce.productName(),
    price: faker.commerce.price(),
    thumbnail: faker.image.fashion(),
  },
  {
    title: faker.commerce.productName(),
    price: faker.commerce.price(),
    thumbnail: faker.image.fashion(),
  },
  {
    title: faker.commerce.productName(),
    price: faker.commerce.price(),
    thumbnail: faker.image.fashion(),
  },
];

let objeto;
let msgs = [];
let desnormalizedmsgs = [];
//esquema normalizr
const authorSchema = new schema.Entity("author");
const msgSchema = new schema.Entity("messages", {
  id: uuidv4(),
  author: authorSchema,
});

const chatSchema = new schema.Entity("chat", {
  author: authorSchema,
  messages: [msgSchema],
});


app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

server.listen(1111, () => {
  console.log("Server corriendo en:" + PORT);
});

//////
io.on("connection", (socket) => {
  console.log("Usuario entro con éxito");

  fs.readFile("desnormalizada.txt", "utf-8", (err, data) => {
    if (err) throw "There was an error while reading your file!";
    objeto = JSON.parse(data);
  });

  socket.emit("msg_back", objeto);

  socket.emit("data_ready", arr);

  socket.on("data_client", (data) => {
    objeto.push(data);
    fs.writeFile(
      "desnormalizada.txt",
      JSON.stringify(objeto, false, 2),
      "utf-8",
      (err) => {
        if (err) throw "Hubo un error";
        console.log("Elemento agregado con éxito");
      }
    );
    async function normalz() {
      const read = await fs.promises.readFile("desnormalizada.txt", "utf-8");
      console.log(read);
      let toNormalized = JSON.parse(read);

      const msgsNormalized = normalize(
        { ...toNormalized, id: "contenido" },
        chatSchema
      );
      print(msgsNormalized);
      fs.writeFile(
        "normalizado.txt",
        JSON.stringify(msgsNormalized, false, 2),
        "utf-8",
        (err) => {
          if (err) throw "Hubo un error";
          console.log("Elemento agregado con éxito");
        }
      );
    }
    (async () => {
      try {
        await normalz();
      } catch (error) {
        console.log(error);
      }
    })();

    io.sockets.emit("msg_back", desnormalizedmsgs);
  });

  socket.on("data_array", (data) => {
    arr.push(data);
    io.sockets.emit("data_ready", arr);
  });
});

//Mongo DB y Cookies

const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://User:2t17C0PDVc7dWuI2@cluster0.j9v3p2d.mongodb.net/test",
      mongoOptions: advancedOptions,
    }),
    cookie: {
      maxAge: 100 * 60, 
    },
    secret: "Can you Keep My Secret",
    resave: true,
    saveUninitialized: true,
  })
);


//Rutas
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (!err) res.send("Vuelve Pronto");
    else res.send({ status: "Logout ERROR", body: err });
  });
});

app.post("/login", async (req, res) => {
  //Consultar usuarios
  try {
    const toFind = req.body.login;
    const user = await User.find({ user: toFind }); // user : "coder"
    if (user == []) {
      res.send("Usuario no encontrado!");
      return;
    }
    const nuevoName = JSON.stringify(user).split(",")[1].slice(8, 13);
    if (nuevoName != "coder") {
      res.send("Usuario no encontrado!");
      return;
    }
    console.log("encontrado");
    res.redirect("/");
  } catch (error) {
    res.send("Usuario no encontrado");
  }
});

app.get("/api/normalized", (req, res) => {
  res.sendFile(__dirname + "/normalizado.txt");
});

app.get("/api/desnormalized", (req, res) => {
  res.sendFile(__dirname + "/desnormalizada.txt");
});