import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function QuizzesDashboard() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "quizzes"), (snapshot) =>
      setQuizzes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => unsub();
  }, []);

  const formatSize = (bytes) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    return kb > 1024 ? (kb / 1024).toFixed(2) + " MB" : kb.toFixed(1) + " KB";
  };

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-4xl font-bold text-indigo-700">📝 Quizzes Dashboard</h1>
      {quizzes.length === 0 ? (
        <p className="text-gray-600">No quizzes uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white shadow-md rounded-xl p-4 text-center">
              <h3 className="text-lg font-semibold text-indigo-600">
                {quiz.original_filename}.{quiz.format}
              </h3>
              <p className="text-gray-500 text-sm">{formatSize(quiz.bytes)}</p>
              <a
                href={quiz.url}
                download={`${quiz.original_filename}.${quiz.format}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
