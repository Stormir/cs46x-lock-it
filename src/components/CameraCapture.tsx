// required package
// > npm install @mediapipe/tasks-vision
import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision";

type CameraCaptureProps = {
  onCapture: (file: File, previewUrl: string) => void;
  hasPhoto?: boolean;
  onRetake?: () => void;
};

type FaceStatus = "no-face" | "off-center" | "too-far" | "too-close" | "ready";

export default function CameraCapture({
  onCapture,
  hasPhoto,
  onRetake
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<FaceDetector | null>(null);
  const rafRef = useRef<number | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [startingCamera, setStartingCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceStatus, setFaceStatus] = useState<FaceStatus>("no-face");

  const faceAligned = faceStatus === "ready";

  async function loadDetector() {
    if (detectorRef.current) return detectorRef.current;

    // mediaPipe for face detect for face ready thing via WebAssembly
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    // make and config face detector using mediaPipe
    const detector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite"
      },
      runningMode: "VIDEO",
      minDetectionConfidence: 0.6
    });

    detectorRef.current = detector;
    return detector;
  }

  async function startCamera() {
    setError(null);
    setStartingCamera(true);
    setFaceStatus("no-face");

    try {
      await loadDetector();

      // rq access to camera (Camera Permissions)
      // the "Allow site to use camera"
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          // dimensions of cam, edit as needed
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (err: any) {
      setError(err?.message ?? "Could not access camera.");
      setStartingCamera(false);
    }
  }

  // clean up and shutdown flow
  function stopCamera() {
    // stop loop 
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // stop the camera streaming
    // WE ARE NOT WATCHING PEOPLE NO NO NO
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    // clear video, this will disconnect the stream from the
    // <video> and reove camera visual feed 
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // reset the state
    setCameraOpen(false);
    setStartingCamera(false);
    setFaceStatus("no-face");
  }

  function getFaceStatus(
    faceBox: {
      originX: number;
      originY: number;
      width: number;
      height: number;
    },
    videoWidth: number,
    videoHeight: number
  ): FaceStatus {

    // CORE LOGIC FOR FACIAL POSITIONING
    //   - User needs to have positioned in x location
    //     for the it to be "ready for a picture"     
    // think #% of th video width/ height
    // edit as needed
    const guideWidth = videoWidth * 0.25;
    const guideHeight = videoHeight * 0.42;
    // positions for centering
    const guideX = (videoWidth - guideWidth) / 2;
    const guideY = (videoHeight - guideHeight) / 2;

    // Find the cener of the face
    const faceCenterX = faceBox.originX + faceBox.width / 2;
    const faceCenterY = faceBox.originY + faceBox.height / 2;

    // check if centered
    // If conditions are not met, then its off center
    const centered =
      faceCenterX > guideX &&
      faceCenterX < guideX + guideWidth &&
      faceCenterY > guideY &&
      faceCenterY < guideY + guideHeight;

    if (!centered) return "off-center";

    // Is your face close enough? 
    const closeEnough =
      faceBox.width >= guideWidth * 0.78 &&
      faceBox.height >= guideHeight * 0.72;

    if (!closeEnough) return "too-far";

    // is your face too close
    const notTooClose =
      faceBox.width <= guideWidth * 1.1 && faceBox.height <= guideHeight * 1.1;

    if (!notTooClose) return "too-close";

    return "ready";
  }

  function getStatusText(status: FaceStatus) {
    switch (status) {
      case "ready":
        return "Ready for photo!";
      case "too-far":
        return "Move closer";
      case "too-close":
        return "Move slightly back";
      case "off-center":
        return "Center face here";
      case "no-face":
      default:
        return "Center face here";
    }
  }

  // keeps face detection running
  // check video, check for face, update UI
  function runDetectionLoop() {
    const loop = () => {
      const video = videoRef.current;
      const detector = detectorRef.current;

      // wait till errrthang is ready. Prevents errors
      // checks if exists
      if (!video || !detector || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      try {
        const result = detector.detectForVideo(video, performance.now());
        const box = result.detections?.[0]?.boundingBox;

        // determine status of face.
        // if face is found, call getFace and check positioning
        if (box) {
          setFaceStatus(
            getFaceStatus(
              box,
              video.videoWidth || 640,
              video.videoHeight || 480
            )
          );
        } else {
          setFaceStatus("no-face");
        }
      } catch {
        setFaceStatus("no-face");
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }

  // Taking the photo and converting to a file
  //    1. Take picture
  //    2. convert to jpg
  //    3. send to app
  //    4. stop recording (camera)
  async function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError("Camera is not ready yet.");
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setError("Camera is not ready yet.");
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Could not capture image.");
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);

    // conver to BLOBBB hehe
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Failed to create image file.");
          return;
        }

        // create as jpeg
        const file = new File([blob], `selfie-${Date.now()}.jpg`, {
          type: "image/jpeg"
        });

        // the photo previwe 
        const previewUrl = URL.createObjectURL(blob);
        onCapture(file, previewUrl);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  }

  // start cam and detection
  // handles error and loading state
  useEffect(() => {
    async function attachStream() {
      if (!cameraOpen || !videoRef.current || !streamRef.current) return;

      try {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
        setStartingCamera(false);
        runDetectionLoop();
      } catch {
        setError("Camera opened, but video could not start.");
        setStartingCamera(false);
      }
    }

    attachStream();
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
      detectorRef.current?.close?.();
      detectorRef.current = null;
    };
  }, []);

  return (
    // the outer container
    <div className="space-y-3">
      {!cameraOpen ? (
        <button
          type="button"
          onClick={() => {
            if (hasPhoto && onRetake) {
              onRetake();
            }
            startCamera();
          }}
          // primary button
          className="rounded-xl bg-white px-4 py-2 text-[#382543] font-medium"
        >
          {/* the buttons */}
          {hasPhoto ? "Retake Photo" : "Open Camera"}
        </button>
      ) : (
        <>
          {/* the image/live camera thing*/}
          <div className="relative w-full overflow-hidden rounded-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full min-h-[240px] object-cover scale-x-[-1]"
            />

            {/* the overlay face guide thing */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div
                // To edit shape of face guide oval thing
                // edit h-[#px] w-[#px]
                className={`relative z-10 h-[175px] w-[125px] rounded-[999px] border-4 ${
                  faceAligned ? "border-purple-300" : "border-white"
                }`}
                style={{
                  transform: "translateY(10px) scaleY(1.05)",
                  boxShadow: faceAligned
                    // Face alignment colors
                    // purple = good
                    ? "0 0 0 9999px rgba(0,0,0,0.55), 0 0 18px rgba(115, 30, 122, 0.95)"
                    // white = try again 
                    : "0 0 0 9999px rgba(0,0,0,0.55), 0 0 18px rgba(255,255,255,0.75)"
                }}
              />

              <p className="relative z-10 mt-4 text-sm font-medium text-white drop-shadow">
                {/* Move closer/Center/Ready for pic*/}
                {getStatusText(faceStatus)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={takePhoto}
              disabled={!faceAligned}
              className="rounded-xl bg-white px-4 py-2 font-medium text-[#382543] disabled:opacity-50"
            >
              Take Photo
            </button>

            <button
              type="button"
              onClick={stopCamera}
              className="rounded-xl border border-white/30 px-4 py-2 text-white"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {startingCamera && (
        <p className="text-sm text-neutral-600">Opening camera...</p>
      )}

      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
