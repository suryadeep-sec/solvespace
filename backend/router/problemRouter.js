const express = require("express");
const router = express.Router();

const problemController = require("../controllers/problemController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware,
  problemController.createProblem
);

router.get(
  "/",
  authMiddleware,
  problemController.getAllProblems
);

router.get(
    "/:id",
    authMiddleware,
    problemController.getSingleProblem
);

router.put(
    "/:id",
    authMiddleware,
    problemController.updateProblem
);



router.delete(
    "/:id",
    authMiddleware,
    problemController.deleteProblem
);


module.exports = router;