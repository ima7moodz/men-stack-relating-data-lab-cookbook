const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const methodOverride = require("method-override")
const morgan = require("morgan")
const path = require("path")

const isSignedIn = require("./middleware/is-Signed-in")
const passUserToView = require("./middleware/pass-user-to-view")
require("dotenv").config()

const app = express()
const port = process.env.PORT || "3000"

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log(`Connected to MongoDB ${mongoose.connection.name}.`))
  .catch((err) => console.error("MongoDB connection error:", err))

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(morgan("dev"))

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
)

// Pass user to view middleware
app.use(passUserToView)

const authController = require("./controllers/auth")
const recipesController = require("./controllers/recipes")
const ingredientsController = require("./controllers/ingredients")

// Session message handling
app.use((req, res, next) => {
  if (req.session.message) {
    res.locals.message = req.session.message
    req.session.message = null
  }
  next()
})

// Routes
app.use("/auth", authController)
app.use("/recipes", isSignedIn, recipesController)
app.use("/ingredients", isSignedIn, ingredientsController)

// Root route
app.get("/", async (req, res) => {
  res.render("index", { user: req.session.user })
})

// Listen on the specified port
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`)
})
