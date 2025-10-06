import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";


export default function Student() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [doubt, setDoubt] = useState("");
  const [doubts, setDoubts] = useState([]);
  const [lessons, setLessons] = useState([]);

  // 🔹 Fetch Announcements
  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // 🔹 Fetch Doubts
  useEffect(() => {
    const q = query(collection(db, "doubts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setDoubts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // 🔹 Fetch Lessons
  useEffect(() => {
    const q = query(collection(db, "lessons"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setLessons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);
    const handleDownload = (lesson) => {
      const link = document.createElement("a");
      link.href = lesson.url;
      link.download = lesson.name || "lesson.pdf"; // fallback if no name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };


  // 🔹 Post Doubt
  const handlePostDoubt = async () => {
    if (!doubt.trim()) return;
    await addDoc(collection(db, "doubts"), {
      text: doubt,
      createdAt: new Date(),
    });
    setDoubt("");
  };
  const [inLecture, setInLecture] = useState(false);
  const [ended, setEnded] = useState(false);
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);

  const joinLecture = () => {
    setInLecture(true);
    setEnded(false);
    socketRef.current = io("http://localhost:5000");
    pcRef.current = new RTCPeerConnection();

    pcRef.current.ontrack = (event) => {
      if (videoRef.current) videoRef.current.srcObject = event.streams[0];
    };

    pcRef.current.onicecandidate = (e) => {
      if (e.candidate) socketRef.current.emit("ice-candidate", e.candidate);
    };

    socketRef.current.on("offer", async (offer) => {
      await pcRef.current.setRemoteDescription(offer);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit("answer", answer);
    });

    socketRef.current.on("ice-candidate", (candidate) => {
      if (candidate) pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socketRef.current.on("end-lecture", () => {
      setInLecture(false);
      setEnded(true);
      if (pcRef.current) pcRef.current.close();
      if (videoRef.current) videoRef.current.srcObject = null;
    });
    useEffect(() => {
    const unsub = onSnapshot(collection(db, "lectures"), (snapshot) => {
      snapshot.docs.forEach((doc) => {
        if (doc.data().status === "live") {
          alert(`📢 Live lecture started! Click to join.`);
        }
      });
    });
    return () => unsub();
  }, []);

  };


  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-12">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          Student Dashboard 📚
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          Access lessons, quizzes, and discussions anytime. Your personalized space 
          to learn and grow with smart tools.
        </p>
      </section>
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-4">🎥 Live Lecture</h2>
        {!inLecture ? (
          <button onClick={joinLecture} className="px-6 py-3 bg-green-600 text-white rounded-lg shadow">
            Join Live Lecture
          </button>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
        )}
        {ended && <p className="mt-2 text-red-600">The lecture has ended.</p>}
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate("/lessons")}
          className="cursor-pointer bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold text-green-600">📖 Lessons</h3>
          <p className="mt-2 text-gray-600">
            Explore interactive lessons curated by your teachers.
          </p>
        </div>
        <div
          onClick={() => navigate("/quizzes")}
          className="cursor-pointer bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold text-green-600">📝 Quizzes</h3>
          <p className="mt-2 text-gray-600">
            Attempt quizzes offline and sync results automatically when online.
          </p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-green-600">💬 Discussions</h3>
          <p className="mt-2 text-gray-600">
            Join class discussions, ask questions, and collaborate with peers.
          </p>
        </div>
      </section>
      {/* Lessons Section */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-4">📖 Lessons</h2>
        {lessons.length > 0 ? (
          <ul className="space-y-3">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="p-3 bg-green-50 rounded-lg shadow-sm">
                <p className="font-semibold">{lesson.name || "Untitled Lesson"}</p>
                <a
                  href={lesson.url}
                  download={lesson.name || "lesson-file"}  // 👈 Forces download (PDF, PPT, Audio)
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No lessons available yet.</p>
        )}
      </section>
      {/* Announcements Section */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-4">📢 Announcements</h2>
        {announcements.length > 0 ? (
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li key={a.id} className="p-3 bg-green-50 rounded-lg shadow-sm">
                {a.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No announcements yet.</p>
        )}
      </section>

      {/* Doubts Section */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-4">❓ Post Your Doubts</h2>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={doubt}
            onChange={(e) => setDoubt(e.target.value)}
            placeholder="Type your doubt here..."
            className="flex-grow p-2 border rounded-lg"
          />
          <button
            onClick={handlePostDoubt}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Post
          </button>
        </div>
        <h3 className="text-xl font-semibold text-green-600 mb-2">Recent Doubts</h3>
        {doubts.length > 0 ? (
          <ul className="space-y-3">
            {doubts.map((d) => (
              <li key={d.id} className="p-3 bg-teal-50 rounded-lg shadow-sm">
                {d.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No doubts posted yet.</p>
        )}
      </section>
    </div>
  );
}
