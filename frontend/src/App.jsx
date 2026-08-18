import { useState } from "react";

const API_URL = "https://graphhire-cognodb.onrender.com";

function App() {
  const [student, setStudent] = useState("Ankit Kumar");

  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [graph, setGraph] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // ADD STUDENT STATES
  // =========================

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    skills: [],
  });

  const [skillInput, setSkillInput] = useState("");

  // =========================
  // FIND JOBS
  // =========================

  const findJobs = async (studentName = student) => {
    const name = studentName.trim();

    if (!name) {
      setError("Please enter a student name.");
      return;
    }

    setLoading(true);
    setError("");
    setJobs([]);
    setSkills([]);
    setStudentInfo(null);
    setGraph(null);

    try {
      const encodedStudent = encodeURIComponent(name);

      // =========================
      // GET STUDENT
      // =========================

      const studentResponse = await fetch(
        `${API_URL}/api/students/${encodedStudent}/skills`
      );

      const studentData = await studentResponse.json();

      if (!studentResponse.ok || !studentData.success) {
        throw new Error(
          studentData.message || "Student not found"
        );
      }

      setStudentInfo(studentData.student);
      setSkills(studentData.student.skills || []);

      // =========================
      // GET RECOMMENDED JOBS
      // =========================

      const jobsResponse = await fetch(
        `${API_URL}/api/jobs/recommendations/${encodedStudent}`
      );

      const jobsData = await jobsResponse.json();

      if (!jobsResponse.ok || !jobsData.success) {
        throw new Error(
          jobsData.message ||
            "Unable to fetch job recommendations"
        );
      }

      setJobs(jobsData.jobs || []);

      // =========================
      // GET GRAPH
      // =========================

      const graphResponse = await fetch(
        `${API_URL}/api/graph/${encodedStudent}`
      );

      const graphData = await graphResponse.json();

      if (!graphResponse.ok || !graphData.success) {
        throw new Error(
          graphData.message ||
            "Unable to fetch graph information"
        );
      }

      setGraph(graphData.graph);
    } catch (err) {
      console.error("Find jobs error:", err);

      setError(
        err.message ||
          "Unable to fetch student information. Please check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // OPEN ADD STUDENT
  // =========================

  const openAddStudent = () => {
    setShowAddStudent(true);
    setError("");
    setAddSuccess("");
  };

  // =========================
  // CLOSE ADD STUDENT
  // =========================

  const closeAddStudent = () => {
    if (addingStudent) return;

    setShowAddStudent(false);

    setNewStudent({
      name: "",
      email: "",
      skills: [],
    });

    setSkillInput("");
    setAddSuccess("");
  };

  // =========================
  // ADD SKILL
  // =========================

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) {
      return;
    }

    const exists = newStudent.skills.some(
      (item) =>
        item.toLowerCase() === skill.toLowerCase()
    );

    if (exists) {
      setSkillInput("");
      return;
    }

    setNewStudent((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setSkillInput("");
  };

  // =========================
  // REMOVE SKILL
  // =========================

  const removeSkill = (skillToRemove) => {
    setNewStudent((prev) => ({
      ...prev,
      skills: prev.skills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  // =========================
  // ADD STUDENT
  // =========================

  const addStudent = async (e) => {
    e.preventDefault();

    setError("");
    setAddSuccess("");

    const name = newStudent.name.trim();
    const email = newStudent.email.trim();

    // Validation
    if (!name) {
      setError("Please enter student name.");
      return;
    }

    if (!email) {
      setError("Please enter student email.");
      return;
    }

    if (newStudent.skills.length === 0) {
      setError("Please add at least one skill.");
      return;
    }

    setAddingStudent(true);

    try {
      console.log("Adding student:", {
        name,
        email,
        skills: newStudent.skills,
      });

      // =========================
      // POST STUDENT
      // =========================

      const response = await fetch(
        `${API_URL}/api/students`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            skills: newStudent.skills,
          }),
        }
      );

      const data = await response.json();

      console.log("Add student response:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to add student"
        );
      }

      // =========================
      // SUCCESS
      // =========================

      setAddSuccess(
        data.message ||
          "Student added successfully!"
      );

      const createdStudentName =
        data.student?.studentName || name;

      // Reset modal form
      setNewStudent({
        name: "",
        email: "",
        skills: [],
      });

      setSkillInput("");

      // Wait and search new student
      setTimeout(async () => {
        setShowAddStudent(false);
        setAddSuccess("");

        setStudent(createdStudentName);

        await findJobs(createdStudentName);
      }, 800);
    } catch (err) {
      console.error("Add student error:", err);

      setError(
        err.message ||
          "Unable to add student. Please check backend connection."
      );
    } finally {
      setAddingStudent(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-xl font-bold">
              GraphHire
            </h1>

            <p className="text-xs text-slate-400">
              Graph-powered job recommendations
            </p>
          </div>

          <div className="flex items-center gap-3">

            {/* ADD STUDENT */}

            <button
              onClick={openAddStudent}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500"
            >
              + Add Student
            </button>

            {/* DATABASE */}

            <div className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400 sm:block">
              <span className="mr-2">
                ●
              </span>

              CognoDB Connected
            </div>

          </div>

        </div>
      </nav>

      {/* =========================
          MAIN
      ========================= */}

      <main className="mx-auto max-w-6xl px-6 py-12">

        {/* HERO */}

        <div className="mb-10 max-w-3xl">

          <p className="mb-3 text-sm font-semibold tracking-wider text-blue-400">
            GRAPH DATABASE APPLICATION
          </p>

          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            Find jobs based on your{" "}
            <span className="text-blue-400">
              skills.
            </span>
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            Discover relevant opportunities by exploring
            relationships between students, skills, jobs
            and companies.
          </p>

        </div>

        {/* =========================
            SEARCH
        ========================= */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

          <label className="mb-2 block text-sm font-medium text-slate-300">
            Student Name
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">

            <input
              type="text"
              value={student}
              onChange={(e) => {
                setStudent(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  findJobs();
                }
              }}
              placeholder="Enter student name"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            <button
              onClick={() => findJobs()}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Exploring..."
                : "Find Jobs"}
            </button>

          </div>

        </section>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4">

            <p className="text-sm text-red-400">
              {error}
            </p>

          </div>
        )}

        {/* =========================
            STUDENT PROFILE
        ========================= */}

        {studentInfo && !loading && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Student Profile
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  {studentInfo.studentName}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {studentInfo.email}
                </p>

              </div>

              <div>

                <p className="mb-3 text-sm text-slate-400">
                  Connected Skills
                </p>

                <div className="flex flex-wrap gap-2">

                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-400"
                    >
                      {skill}
                    </span>
                  ))}

                </div>

              </div>

            </div>

          </section>
        )}

        {/* =========================
            GRAPH JOURNEY
        ========================= */}

        {graph && !loading && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6">

              <p className="text-sm font-semibold tracking-wider text-blue-400">
                GRAPH JOURNEY
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                How the recommendation is connected
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                The recommendation is generated by
                traversing relationships in the graph.
              </p>

            </div>

            <div className="grid gap-4 md:grid-cols-4">

              {/* STUDENT */}

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Student
                </p>

                <h4 className="mt-2 text-lg font-semibold">
                  {graph.student}
                </h4>

              </div>

              {/* SKILLS */}

              <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-5">

                <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  Skills
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  {(graph.skills || []).map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-purple-500/10 px-2 py-1 text-xs text-purple-300"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              </div>

              {/* JOBS */}

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">

                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Jobs
                </p>

                <div className="mt-3 space-y-2">

                  {(graph.jobs || []).map(
                    (job) => (
                      <p
                        key={job}
                        className="text-sm text-amber-200"
                      >
                        {job}
                      </p>
                    )
                  )}

                </div>

              </div>

              {/* COMPANIES */}

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">

                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Companies
                </p>

                <div className="mt-3 space-y-2">

                  {(graph.companies || []).map(
                    (company) => (
                      <p
                        key={company}
                        className="text-sm text-emerald-200"
                      >
                        {company}
                      </p>
                    )
                  )}

                </div>

              </div>

            </div>

            {/* RELATIONSHIP */}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400">

              <span>
                Student
              </span>

              <span className="text-blue-400">
                ── HAS_SKILL ──→
              </span>

              <span>
                Skill
              </span>

              <span className="text-purple-400">
                ── REQUIRES ──→
              </span>

              <span>
                Job
              </span>

              <span className="text-emerald-400">
                ── OFFERS ──→
              </span>

              <span>
                Company
              </span>

            </div>

          </section>
        )}

        {/* =========================
            RECOMMENDED JOBS
        ========================= */}

        <section className="mt-10">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h3 className="text-2xl font-bold">
                Recommended Jobs
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Based on connected skills
              </p>

            </div>

            {jobs.length > 0 && (
              <div className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                {jobs.length} opportunities
              </div>
            )}

          </div>

          {/* LOADING */}

          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500"></div>

              <p className="text-slate-400">
                Exploring the graph...
              </p>

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            jobs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
                  🔍
                </div>

                <h4 className="text-lg font-semibold">
                  No recommendations yet
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  Enter a student name and click
                  Find Jobs.
                </p>

              </div>
            )}

          {/* JOB CARDS */}

          {!loading &&
            jobs.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">

                {jobs.map((job, index) => (

                  <div
                    key={`${job.jobTitle}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition duration-200 hover:-translate-y-1 hover:border-slate-600 hover:shadow-xl"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h4 className="text-xl font-semibold">
                          {job.jobTitle}
                        </h4>

                        <p className="mt-1 text-sm font-medium text-blue-400">
                          {job.company}
                        </p>

                      </div>

                      <div className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                        {job.matchPercentage}% Match
                      </div>

                    </div>

                    {/* SKILL COMPATIBILITY */}

                    <div className="mt-6">

                      <div className="mb-2 flex items-center justify-between text-xs">

                        <span className="text-slate-500">
                          Skill compatibility
                        </span>

                        <span className="text-slate-400">
                          {job.matchingSkills} of{" "}
                          {job.totalSkills} skills
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{
                            width: `${job.matchPercentage}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* JOB DETAILS */}

                    <div className="mt-6 flex flex-wrap gap-2">

                      <span className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-400">
                        📍 {job.location}
                      </span>

                      <span className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-400">
                        💼 {job.experience}
                      </span>

                    </div>

                  </div>

                ))}

              </div>
            )}

        </section>

      </main>

      {/* =========================
          ADD STUDENT MODAL
      ========================= */}

      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  Add Student
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a new student to GraphHire
                </p>

              </div>

              <button
                type="button"
                onClick={closeAddStudent}
                disabled={addingStudent}
                className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                ×
              </button>

            </div>

            {/* SUCCESS */}

            {addSuccess && (
              <div className="mb-5 rounded-lg border border-emerald-800 bg-emerald-950/40 p-3">

                <p className="text-sm text-emerald-400">
                  ✓ {addSuccess}
                </p>

              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={addStudent}
              className="space-y-5"
            >

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Student Name
                </label>

                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Rahul Kumar"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>

                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="e.g. rahul@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

              </div>

              {/* SKILLS */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Skills
                </label>

                <div className="flex gap-2">

                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) =>
                      setSkillInput(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="e.g. React.js"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="rounded-lg bg-slate-700 px-4 py-3 font-semibold hover:bg-slate-600"
                  >
                    Add
                  </button>

                </div>

                {/* SKILL TAGS */}

                {newStudent.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">

                    {newStudent.skills.map(
                      (skill) => (

                        <span
                          key={skill}
                          className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-400"
                        >

                          {skill}

                          <button
                            type="button"
                            onClick={() =>
                              removeSkill(skill)
                            }
                            className="text-blue-300 hover:text-white"
                          >
                            ×
                          </button>

                        </span>

                      )
                    )}

                  </div>
                )}

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeAddStudent}
                  disabled={addingStudent}
                  className="flex-1 rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addingStudent}
                  className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addingStudent
                    ? "Adding..."
                    : "Add Student"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;