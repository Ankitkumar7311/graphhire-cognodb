const express = require("express");
const { getRecommendedJobs } = require("../queries/jobQueries");

const router = express.Router();

router.get("/recommendations/:studentName", async (req, res) => {
  try {
    const { studentName } = req.params;

    const jobs = await getRecommendedJobs(studentName);

    res.json({
      success: true,
      student: studentName,
      jobs,
    });
  } catch (error) {
    console.error("Job recommendation error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch job recommendations",
    });
  }
});

module.exports = router;