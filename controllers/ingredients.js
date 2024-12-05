const express = require("express")
const router = express.Router()

const User = require("../models/user.js")
const Ingredient = require("../models/ingredient.js")

// Show all ingredients
router.get("/", async (req, res) => {
  try {
    const ingredients = await Ingredient.find()
    res.render("ingredients/index.ejs", { ingredients })
  } catch (error) {
    console.error(error)
    res.redirect("/")
  }
})

// Create a new ingredient
router.post("/", async (req, res) => {
  try {
    const newIngredient = new Ingredient({ name: req.body.name })
    await newIngredient.save()
    res.redirect("/ingredients")
  } catch (error) {
    console.error(error)
    res.redirect("/ingredients")
  }
})

module.exports = router
