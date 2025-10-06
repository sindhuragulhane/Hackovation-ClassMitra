import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function LessonsDashboard() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "lessons"), (snapshot) =>
      setLessons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => unsub();
  }, []);

  const formatSize = (bytes) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    return kb > 1024 ? (kb / 1024).toFixed(2) + " MB" : kb.toFixed(1) + " KB";
  };

  // 🔹 Ensure files always download instead of opening inline
  const handleDownload = (lesson) => {
    const fileName =
      (lesson.original_filename || "lesson") +
      (lesson.format ? `.${lesson.format}` : "");
    const link = document.createElement("a");
    link.href = lesson.url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-4xl font-bold text-green-700">📖 Lessons Dashboard</h1>
      {lessons.length === 0 ? (
        <p className="text-gray-600">No lessons uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white shadow-md rounded-xl p-4 text-center"
            >
              <h3 className="text-lg font-semibold text-green-600">
                {(lesson.original_filename || "lesson") +
                  (lesson.format ? `.${lesson.format}` : "")}
              </h3>
              <p className="text-gray-500 text-sm">{formatSize(lesson.bytes)}</p>
              <button
                onClick={() => handleDownload(lesson)}
                className="mt-3 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

