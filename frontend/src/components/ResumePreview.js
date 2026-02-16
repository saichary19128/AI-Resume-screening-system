import React, { useState } from "react";
import API from "../api";

function ResumePreview({ candidateId }) {
  const [resume, setResume] = useState("");

  async function loadResume() {
    if (!candidateId) return alert("Upload resume first");

    const res = await API.get(`/candidate/${candidateId}`);
    setResume(res.data.resumeText);
  }

  return (
    <div className="card mt-3">
      <div className="card-body">
        <button className="btn btn-info mb-2" onClick={loadResume}>
          Preview Resume
        </button>

        {resume && (
          <pre
            style={{
              maxHeight: "300px",
              overflow: "auto",
              background: "#f8f9fa",
              padding: "10px",
            }}
          >
            {resume}
          </pre>
        )}
      </div>
    </div>
  );
}

export default ResumePreview;