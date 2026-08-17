const driver = require("../db/neo4j");

async function getRecommendedJobs(studentName) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (s:Student {name: $studentName})-[:HAS_SKILL]->(skill:Skill)
      MATCH (job:Job)-[:REQUIRES]->(skill)
      MATCH (company:Company)-[:OFFERS]->(job)

      WITH job, company, COUNT(DISTINCT skill) AS matchingSkills

      OPTIONAL MATCH (job)-[:REQUIRES]->(requiredSkill:Skill)

      WITH
        job,
        company,
        matchingSkills,
        COUNT(DISTINCT requiredSkill) AS totalSkills

      RETURN
        job.title AS jobTitle,
        job.location AS location,
        job.experience AS experience,
        company.name AS company,
        matchingSkills,
        totalSkills,
        CASE
          WHEN totalSkills = 0 THEN 0
          ELSE ROUND(
            (toFloat(matchingSkills) / totalSkills) * 100
          )
        END AS matchPercentage

      ORDER BY matchPercentage DESC
      `,
      {
        studentName,
      }
    );

    return result.records.map((record) => ({
      jobTitle: record.get("jobTitle"),
      location: record.get("location"),
      experience: record.get("experience"),
      company: record.get("company"),
      matchingSkills: Number(record.get("matchingSkills")),
      totalSkills: Number(record.get("totalSkills")),
      matchPercentage: Number(record.get("matchPercentage")),
    }));
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  } finally {
    await session.close();
  }
}

module.exports = {
  getRecommendedJobs,
};