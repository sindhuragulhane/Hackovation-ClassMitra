import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Student from "./pages/Student.jsx";
import Teacher from "./pages/Teacher.jsx";
import LessonsDashboard from "./pages/lessonsdashboard.jsx";
import QuizzesDashboard from "./pages/quizzes.jsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-indigo-50 to-blue-100">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-white shadow-lg rounded-2xl p-6 min-h-[70vh]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/student" element={<Student />} />
              <Route path="/teacher" element={<Teacher />} />
              <Route path="/lessons" element={<LessonsDashboard />} />
              <Route path="/quizzes" element={<QuizzesDashboard />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-4 text-center">
          © 2025 Classroom Prototype | Built for SIH 🚀
        </footer>
      </div>
    </Router>
  );
}

export default App;
