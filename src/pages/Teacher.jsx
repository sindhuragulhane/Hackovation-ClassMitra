import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import axios from "axios";
import { io } from "socket.io-client";

export default function Teacher() {
  const [file, setFile] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const [doubts, setDoubts] = useState([]);

  // 🔹 Fetch Lessons
  useEffect(() => {
    const q = query(collection(db, "lessons"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setLessons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

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

  // 🔹 Upload Lesson
  const handleUpload = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "hack123"); // 🔹 replace with your Cloudinary preset

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dzoqauf6i/auto/upload",
        formData
      );

      await addDoc(collection(db, "lessons"), {
        url: res.data.secure_url,
        original_filename: res.data.original_filename || file.name.split(".")[0],
        format: res.data.format || file.name.split(".").pop(),
        createdAt: new Date(),
      }); 
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // 🔹 Post Announcement
  const handlePostAnnouncement = async () => {
    if (!announcement.trim()) return;
    await addDoc(collection(db, "announcements"), {
      text: announcement,
      createdAt: new Date(),
    });
    setAnnouncement("");
  };
  const [inLecture, setInLecture] = useState(false);
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);

  const startLecture = async () => {
    try {
      setInLecture(true);
      socketRef.current = io("http://localhost:5000");
      pcRef.current = new RTCPeerConnection();

    // capture teacher media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
      if (videoRef.current) videoRef.current.srcObject = stream;

      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) socketRef.current.emit("ice-candidate", event.candidate);
      };

      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socketRef.current.emit("offer", offer);

      socketRef.current.on("answer", async (answer) => {
        await pcRef.current.setRemoteDescription(answer);
      });
    } catch (err) {
        console.error("Start lecture error:", err);
        setInLecture(false);
      }
  };

  const stopLecture = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (pcRef.current) pcRef.current.close();
    if (socketRef.current) {
      socketRef.current.emit("end-lecture");
      socketRef.current.disconnect();
    }
    setInLecture(false);
  };


  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-12">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Teacher Dashboard 👩‍🏫
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          Create lessons, upload slides, and track student progress — all in one powerful dashboard.
        </p>
      </section>
      {/* Upload Section */}
      <section className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-yellow-700 mb-4">📤 Upload</h2>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />
        <div className="space-x-4">
          <button
            onClick={() => handleUpload("lessons")}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Upload Lesson
          </button>
          <button
            onClick={() => handleUpload("quizzes")}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Upload Quiz
          </button>
        </div>
      </section>
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-yellow-700 mb-4">🎥 Live Lecture</h2>
          {!inLecture ? (
            <button onClick={startLecture} className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow">
              Start Live Lecture
            </button>
          ) : (
        <div>
          <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg" />
            <button onClick={stopLecture} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg shadow">
              Stop Lecture
            </button>
        </div>
        )}
      </section>
  
      {/* Announcements Section */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-yellow-700 mb-4">🔔 Post Announcements</h2>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Type announcement..."
            className="flex-grow p-2 border rounded-lg"
          />
          <button
            onClick={handlePostAnnouncement}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            Post
          </button>
        </div>
        <h3 className="text-xl font-semibold text-yellow-600 mb-2">📢 Recent Announcements</h3>
        {announcements.length > 0 ? (
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li key={a.id} className="p-3 bg-orange-50 rounded-lg shadow-sm">
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
        <h2 className="text-2xl font-bold text-yellow-700 mb-4">❓ Student Doubts</h2>
        {doubts.length > 0 ? (
          <ul className="space-y-3">
            {doubts.map((d) => (
              <li key={d.id} className="p-3 bg-amber-50 rounded-lg shadow-sm">
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
