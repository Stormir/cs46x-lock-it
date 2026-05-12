// REMEMBER. Install the following packages
// npm install leaflet react-leaflet
// npm install -D @types/leaflet
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/DateTracking.css";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import { ArrowLocationIcon, GlobeIcon, LiveDatesIcon, PastFutureDatesIcon,
          ScheduleDateIcon, TrustedContactsIcon, YourLocationIcon, AddButtonIcon,
        } from "../components/DateTrackingIcons.tsx";
type DateTrackingProps = {
  setPageHome: () => void;
  setPageSettings: () => void;
  setPageDateTracking: () => void;
};

type Latlngt = {
  lat: number;
  lngt: number;
};

const userIcon = L.divIcon({
  className: "custom-user-marker",
  html: `
    <div class="user-marker-glow">
      <div class="user-marker-profile-placeholder"></div>
      <img
        src="${YourLocationIcon}"
        class="user-marker-frame"
      />
    </div>
  `,
  iconSize: [70, 70],
  iconAnchor: [35, 60],
  popupAnchor: [0, -55]
});

function RecenterMap({ position }: { position: Latlngt }) {
  const map = useMap();
  useEffect(() => {
    map.setView([position.lat, position.lngt], map.getZoom());
  }, [position, map]);

  return null;
}

export default function DateTracking({
  setPageHome,
  setPageSettings,
  setPageDateTracking
}: DateTrackingProps) {
  const [position, setPosition] = useState<Latlngt | null>(null);
  const [error, setError] = useState("");
  const [map, setMap] = useState<L.Map | null>(null);
  const [activeSection, setActiveSection] = useState<
    "live" | "trusted" | "pastFuture" | "schedule"
  >("live");
  const [showStartSharing, setShowStartSharing] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isCardMinimized, setIsCardMinimized] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const updatedPosition = {
          lat: pos.coords.latitude,
          lngt: pos.coords.longitude
        };

        setPosition(updatedPosition);
      },

      () => {
        setError("Unable to access location.");
      },

      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const defaultPosition: Latlngt = position ?? {
    lat: 45.5231,
    lngt: -122.6765
  };

  const recenterMap = () => {
    if (!map || !position) return;

    map.setView([position.lat, position.lngt], 16, {
      animate: true
    });
  };

  return (
    <div className="dateTracking-page">
      <TopBar
        onHomeClick={setPageHome}
        onSettingsClick={setPageSettings}
        onDateTrackerClick={setPageDateTracking}
      />

      <div className="map-wrapper">
        <MapContainer
          center={[defaultPosition.lat, defaultPosition.lngt]}
          zoom={14}
          zoomControl={false}
          className="leaflet-map"
          ref={setMap}
        >

          {/* change map tmeplate 
          link: https://leaflet-extras.github.io/leaflet-providers/preview/
          be sure to change {ext} to .png
          Yuri's choice
          <TileLayer
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          */}
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          />

          {position && (
            <>
              <Marker position={[position.lat, position.lngt]} icon={userIcon}>
                <Popup>Your current location</Popup>
              </Marker>

              <RecenterMap position={position} />
            </>
          )}
        </MapContainer>

        <button className="floating-map-btn top-btn">
          <img
            src={GlobeIcon}
            alt="Map options"
            className="h-5 w-5 object-contain"
          />
        </button>

        <button className="floating-map-btn bottom-btn" onClick={recenterMap}>
          <img
            src={ArrowLocationIcon}
            alt="Recenter map"
            className="h-7 w-7 object-contain"
          />
        </button>
      </div>

      <div className={`tracking-card ${isCardMinimized ? "minimized" : ""}`}>

      <button
        type="button"
        className="drag-bar"
        onClick={() => setIsCardMinimized((prev) => !prev)}
        onPointerDown={(e) => {
          setDragStartY(e.clientY);
        }}
        onPointerUp={(e) => {
          if (dragStartY === null) return;

          const dragDistance = e.clientY - dragStartY;

          if (dragDistance > 40) {
            setIsCardMinimized(true);
          }

          if (dragDistance < -40) {
            setIsCardMinimized(false);
          }

          setDragStartY(null);
        }}
        aria-label={isCardMinimized ? "Expand panel" : "Minimize panel"}
      >
      </button>
        

        {!isCardMinimized && (
          <>
            {activeSection === "live" ? (

              // Live Dates Screen
              <>
                <p className="module-display-title">
                  Live Dates
                </p>

                <p className="module-information-text-1">
                  You are currently tracking no dates
                </p>

                {error && <p className="tracking-error">{error}</p>}
              </>

            ) : activeSection === "pastFuture" ? (

              // Past/Future Dates Screen
              <div className="trusted-section">
                <p className="module-display-title">
                  Past and Future Dates
                </p>

                <p className="module-information-text-1">
                  Coming Soon
                </p>
              </div>

            ) : activeSection === "schedule" ? (

              // Schedule a Date Screen
              <div className="trusted-section">
                <p className="module-display-title">
                  Schedule a Date
                </p>

                <p className="module-information-text-1">
                  Coming Soon
                </p>
              </div>

            ) : activeSection === "trusted" ? (

              showStartSharing ? (

                // Start Sharing Screen
                <div className="trusted-section">
                  <p className="module-display-title">
                    Start Sharing
                  </p>

                  <div className="sharing-email-row">
                    <input
                      type="email"
                      placeholder="type user's email here"
                      className="sharing-email-input"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />

                    <button className="sharing-email-add-btn">
                      <img
                        src={AddButtonIcon}
                        alt="Add"
                        className="sharing-add-icon"
                      />
                    </button>
                  </div>

                  <p className="sharing-note">
                    Add a trusted contact! At this time, trusted contacts must have
                    an active account with Lock It. By sending an invitation, you
                    are permitting that user to track your location through Lock It.
                  </p>
                </div>

              ) : (

                // Default Trusted Contacts Screen
                <div className="trusted-section">
                  <p className="module-display-title">
                    Trusted Contacts
                  </p>

                  <p className="module-information-text-1">
                    You currently have no trusted contacts.
                    <br />
                    Add a trusted contact by sharing your location
                  </p>

                  <button
                    className="trusted-add-btn"
                    onClick={() => setShowStartSharing(true)}
                  >
                    <img
                      src={AddButtonIcon}
                      alt="Add trusted contact"
                      className="trusted-add-icon"
                    />
                  </button>
                </div>
              )

            ) : null}
          </>
        )}

        <div className="tracking-tabs">
          <div
            className="tracking-tab-item"
            onClick={() => setActiveSection("live")}
          >
            <img
              src={LiveDatesIcon}
              alt="Live Dates"
              className="tracking-tab-icon"
            />
            <span>Live Dates</span>
          </div>

          <div
            className="tracking-tab-item"
            onClick={() => setActiveSection("pastFuture")}
          >
            <img
              src={PastFutureDatesIcon}
              alt="Past Future Dates"
              className="tracking-tab-icon"
            />

            <span>
              Past/Future
              <br />
              Dates
            </span>
          </div>

          <div
            className="tracking-tab-item"
            onClick={() => setActiveSection("schedule")}
          >
            <img
              src={ScheduleDateIcon}
              alt="Schedule Date"
              className="tracking-tab-icon"
            />

            <span>
              Schedule a
              <br />
              Date
            </span>
          </div>

          <div
            className="tracking-tab-item"
            onClick={() => setActiveSection("trusted")}
          >
            <img
              src={TrustedContactsIcon}
              alt="Trusted Contacts"
              className="tracking-tab-icon"
            />

            <span>
              Trusted
              <br />
              Contacts
            </span>
          </div>
        </div>
      </div>

      <BottomNav
        onHomeClick={setPageHome}
        onDateTrackerClick={setPageDateTracking}
      />
      </div>
    );
}