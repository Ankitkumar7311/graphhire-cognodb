const driver = require("../db/neo4j");

// ==========================================
// GET STUDENT SKILLS
// ==========================================

async function getStudentSkills(studentName) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (s:Student {name: $studentName})
      OPTIONAL MATCH (s)-[:HAS_SKILL]->(skill:Skill)

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
      skills: record.get("skills").filter(Boolean),
    };
  } finally {
    await session.close();
  }
}


// ==========================================
// CREATE / ADD STUDENT
// ==========================================

async function createStudent(studentName, email, skills) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MERGE (s:Student {name: $studentName})

      SET s.email = $email

      WITH s

      UNWIND $skills AS skillName

      MERGE (skill:Skill {name: skillName})

      MERGE (s)-[:HAS_SKILL]->(skill)

      RETURN
        s.name AS studentName,
        s.email AS email,
        collect(skill.name) AS skills
      `,
      {
        studentName,
        email,
        skills,
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


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getStudentSkills,
  createStudent,
};