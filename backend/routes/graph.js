const express = require("express");
const { getStudentGraph } = require("../queries/graphQueries");

const router = express.Router();

router.get("/:studentName", async (req, res) => {
  try {
    const { studentName } = req.params;

    const graph = await getStudentGraph(studentName);

    if (!graph) {
      return res.status(404).json({
        success: false,
        message: "Student graph not found",
      });
    }

    res.json({
      success: true,
      graph,
    });
  } catch (error) {
    console.error("Graph error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch graph data",
    });
  }
});

module.exports = router;