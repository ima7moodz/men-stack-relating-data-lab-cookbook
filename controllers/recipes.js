const express = require("express")
const router = express.Router()
const Recipe = require("../models/Recipe.js")
const Ingredient = require("../models/ingredient.js")

// Index - View all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find({})
    const successMessage = req.query.success
    res.render("recipes/index.ejs", {
      recipes,
      successMessage,
      currentUser: req.session.user,
    })
  } catch (error) {
    console.error(error)
    res.redirect("/")
  }
})

// New - Form to create a new recipe
router.get("/new", async (req, res) => {
  try {
    const ingredients = await Ingredient.find()
    res.render("recipes/new.ejs", { ingredients })
  } catch (error) {
    console.error(error)
    res.redirect("/recipes")
  }
})

// Create - Add new recipe
router.post("/", async (req, res) => {
  try {
    const { name, instructions, ingredientIds } = req.body

    const newRecipe = new Recipe({
      name,
      instructions,
      owner: req.session.user._id,
      ingredients: ingredientIds,
    })

    await newRecipe.save()

    res.redirect("/recipes?success=Recipe+successfully+saved!")
  } catch (error) {
    console.error(error)
    res.redirect("/recipes/new")
  }
})

// Show - View single recipe
router.get("/:recipeId", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId).populate(
      "ingredients"
    )
    res.locals.currentUser = req.session.user
    res.render("recipes/show.ejs", { recipe, ingredients: recipe.ingredients })
  } catch (error) {
    console.error(error)
    res.redirect("/")
  }
})

// Delete - Remove a recipe
router.delete("/:recipeId", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId)
    if (recipe.owner.equals(req.session.user._id)) {
      await Recipe.deleteOne({ _id: req.params.recipeId })
      res.redirect("/recipes")
    } else {
      res.send("You don't have permission to do that.")
    }
  } catch (error) {
    console.log(error)
    res.redirect("/")
  }
})

//Edit - Edit a recipe and update
router.get("/:recipeId/edit", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId)
    const ingredients = await Ingredient.find()

    res.render("recipes/edit.ejs", { recipe, ingredients })
  } catch (error) {
    console.error(error)
    res.redirect("/")
  }
})

router.put("/:recipeId", async (req, res) => {
  try {
    const { name, instructions, ingredientIds } = req.body
    const recipe = await Recipe.findById(req.params.recipeId)
    if (recipe.owner.equals(req.session.user._id)) {
      recipe.name = name
      recipe.instructions = instructions
      recipe.ingredients = ingredientIds
      await recipe.save()
      res.redirect(`/recipes/${recipe._id}`)
    } else {
      res.send("You don't have permission to do that.")
    }
  } catch (error) {
    console.error(error)
    res.redirect("/")
  }
})

module.exports = router
