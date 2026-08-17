const driver = require("../db/neo4j");

async function getStudentGraph(studentName) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (s:Student {name: $studentName})
      OPTIONAL MATCH path =
        (s)-[:HAS_SKILL]->(skill:Skill)
        <-[:REQUIRES]-(job:Job)
        <-[:OFFERS]-(company:Company)

      RETURN
        s.name AS student,
        collect(DISTINCT skill.name) AS skills,
        collect(DISTINCT job.title) AS jobs,
        collect(DISTINCT company.name) AS companies
      `,
      {
        studentName,
      }
    );

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0];

    return {
      student: record.get("student"),
      skills: record.get("skills"),
      jobs: record.get("jobs"),
      companies: record.get("companies"),
    };
  } finally {
    await session.close();
  }
}

module.exports = {
  getStudentGraph,
};