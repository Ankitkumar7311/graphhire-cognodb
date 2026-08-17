const express = require("express");
const cors = require("cors");
const driver = require("./db/neo4j");
const jobRoutes = require("./routes/jobs");
const studentRoutes = require("./routes/students");
const graphRoutes = require("./routes/graph");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/jobs", jobRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/graph", graphRoutes);

app.get("/", async (req, res) => {
  try {
    const session = driver.session();

    const result = await session.run(
      "RETURN 'CognoDB Connected!' AS message"
    );

    await session.close();

    res.json({
      success: true,
      message: result.records[0].get("message"),
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});