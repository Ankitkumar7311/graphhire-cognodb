const express = require("express");
const { getStudentSkills } = require("../queries/studentQueries");

const router = express.Router();

router.get("/:studentName/skills", async (req, res) => {
  try {
    const { studentName } = req.params;

    const student = await getStudentSkills(studentName);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Student skills error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch student skills",
    });
  }
});

module.exports = router;