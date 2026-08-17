const driver = require("../db/neo4j");

async function seedDatabase() {
  const session = driver.session();

  try {
    console.log("Clearing old data...");

    await session.run(`
      MATCH (n)
      DETACH DELETE n
    `);

    console.log("Creating nodes...");

    await session.run(`
      CREATE
        (ankit:Student {
          name: "Ankit Kumar",
          email: "ankit@example.com"
        }),

        (rahul:Student {
          name: "Rahul Sharma",
          email: "rahul@example.com"
        }),

        (react:Skill {name: "React.js"}),
        (java:Skill {name: "Java"}),
        (sql:Skill {name: "SQL"}),
        (node:Skill {name: "Node.js"}),
        (python:Skill {name: "Python"}),

        (javaDev:Job {
          title: "Java Full Stack Developer",
          experience: "Fresher",
          location: "Bangalore"
        }),

        (reactDev:Job {
          title: "React Developer",
          experience: "Fresher",
          location: "Hyderabad"
        }),

        (backendDev:Job {
          title: "Backend Developer",
          experience: "0-2 Years",
          location: "Pune"
        }),

        (dataAnalyst:Job {
          title: "Data Analyst",
          experience: "Fresher",
          location: "Bangalore"
        }),

        (techCorp:Company {
          name: "TechCorp India"
        }),

        (innovateLabs:Company {
          name: "Innovate Labs"
        }),

        (dataWorks:Company {
          name: "DataWorks"
        })
    `);

    console.log("Creating relationships...");

    await session.run(`
      MATCH
        (ankit:Student {name: "Ankit Kumar"}),
        (rahul:Student {name: "Rahul Sharma"}),

        (react:Skill {name: "React.js"}),
        (java:Skill {name: "Java"}),
        (sql:Skill {name: "SQL"}),
        (node:Skill {name: "Node.js"}),
        (python:Skill {name: "Python"}),

        (javaDev:Job {title: "Java Full Stack Developer"}),
        (reactDev:Job {title: "React Developer"}),
        (backendDev:Job {title: "Backend Developer"}),
        (dataAnalyst:Job {title: "Data Analyst"}),

        (techCorp:Company {name: "TechCorp India"}),
        (innovateLabs:Company {name: "Innovate Labs"}),
        (dataWorks:Company {name: "DataWorks"})

      CREATE
        // Student → Skills
        (ankit)-[:HAS_SKILL]->(react),
        (ankit)-[:HAS_SKILL]->(java),
        (ankit)-[:HAS_SKILL]->(sql),
        (ankit)-[:HAS_SKILL]->(node),

        (rahul)-[:HAS_SKILL]->(python),
        (rahul)-[:HAS_SKILL]->(sql),

        // Jobs → Required Skills
        (javaDev)-[:REQUIRES]->(java),
        (javaDev)-[:REQUIRES]->(react),
        (javaDev)-[:REQUIRES]->(sql),

        (reactDev)-[:REQUIRES]->(react),

        (backendDev)-[:REQUIRES]->(node),
        (backendDev)-[:REQUIRES]->(java),
        (backendDev)-[:REQUIRES]->(sql),

        (dataAnalyst)-[:REQUIRES]->(python),
        (dataAnalyst)-[:REQUIRES]->(sql),

        // Companies → Jobs
        (techCorp)-[:OFFERS]->(javaDev),
        (innovateLabs)-[:OFFERS]->(reactDev),
        (techCorp)-[:OFFERS]->(backendDev),
        (dataWorks)-[:OFFERS]->(dataAnalyst)
    `);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedDatabase();