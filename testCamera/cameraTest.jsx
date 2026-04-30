import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";

export default function CameraTest() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  const BUCKET = "face-verification"; // your bucket name
  const USER_ID = "test-user"; // replace later with auth user

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
      if (preview) URL.revokeObjectURL(preview);
    };
  }, []);

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setMessage("Camera access failed");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
  }

  async function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );

    setImageBlob(blob);

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(blob));
  }

  async function handleSave() {
    if (!imageBlob) {
      setMessage("Capture an image first");
      return;
    }

    try {
      setMessage("Uploading...");

      const filePath = `${USER_ID}/${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, imageBlob, {
          contentType: "image/jpeg",
        });

      if (error) {
        throw error;
      }

      setMessage(`Saved to: ${filePath}`);

      // ================================
      // 🔒 COMPRE FACE (LATER)
      // ================================
      /*
      const formData = new FormData();
      formData.append("image_id", "YOUR_IMAGE_ID");
      formData.append("user_id", USER_ID);
      formData.append("bucket", BUCKET);
      formData.append("storage_path", filePath);

      const { data, error: fnError } = await supabase.functions.invoke(
        "recognition_pract",
        { body: formData }
      );

      console.log(data);
      */
      // ================================

    } catch (err) {
      console.error(err);
      setMessage("Upload failed");
    }
  }

  return (
    <div style={styles.container}>
      <h2>Camera Test</h2>

      <video ref={videoRef} autoPlay playsInline style={styles.video} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={styles.buttons}>
        <button onClick={handleCapture}>Capture</button>
        <button onClick={handleSave}>Save</button>
      </div>

      {preview && (
        <div>
          <h4>Preview:</h4>
          <img src={preview} alt="preview" style={styles.preview} />
        </div>
      )}

      <p>{message}</p>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
  },
  video: {
    width: "300px",
    borderRadius: "10px",
  },
  preview: {
    width: "200px",
    marginTop: "10px",
    borderRadius: "10px",
  },
  buttons: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
};