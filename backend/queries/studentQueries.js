const driver = require("../db/neo4j");

async function getStudentSkills(studentName) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (s:Student {name: $studentName})-[:HAS_SKILL]->(skill:Skill)

      RETURN
        s.name AS studentName,
        s.email AS email,
        collect(skill.name) AS skills
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
      studentName: record.get("studentName"),
      email: record.get("email"),
      skills: record.get("skills"),
    };
  } finally {
    await session.close();
  }
}

module.exports = {
  getStudentSkills,
};