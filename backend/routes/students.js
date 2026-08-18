const express = require("express");

const {
  getStudentSkills,
  createStudent,
} = require("../queries/studentQueries");

const router = express.Router();


// ==========================================
// GET STUDENT SKILLS
// ==========================================

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


// ==========================================
// ADD STUDENT
// ==========================================

router.post("/", async (req, res) => {
  try {
    const { name, email, skills } = req.body;

    // Validation
    if (!name || !email || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name, email and at least one skill are required",
      });
    }

    // Clean skills
    const cleanedSkills = skills
      .map((skill) => String(skill).trim())
      .filter(Boolean);

    if (cleanedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid skill is required",
      });
    }

    // Create student
    const student = await createStudent(
      name.trim(),
      email.trim(),
      cleanedSkills
    );

    if (!student) {
      return res.status(500).json({
        success: false,
        message: "Student could not be created",
      });
    }

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      student,
    });

  } catch (error) {
    console.error("Add student error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Unable to add student",
    });
  }
});


module.exports = router;