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
import ArrowLocationIcon from "../assets/logo/arrow_loc_white.svg";
import GlobeIcon from "../assets/logo/globe_white.svg";
import LiveDatesIcon from "../assets/logo/live_dates_white.svg";
import PastFutureDatesIcon from "../assets/logo/past_future_dates_white.svg";
import ScheduleDateIcon from "../assets/logo/schd_dates_white.svg";
import TrustedContactsIcon from "../assets/logo/trust_contacts_white.svg";
import YourLocationIcon from "../assets/logo/your_loc_dark.svg";
import AddButtonIcon from "../assets/logo/add_butt_white.svg";
import TrustedContactsExitButton from "../assets/logo/trusted_contacts_exit_button.svg";

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
  const [activeSection, setActiveSection] = useState<"live" | "trusted">(
    "live"
  );

  const [showStartSharing, setShowStartSharing] = useState(false);
  const [shareEmail, setShareEmail] = useState("");

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

      <div className="tracking-card">
        <div className="drag-bar" />

        {activeSection === "trusted" ? (
          showStartSharing ? (

            // Start Sharing Screen
            <div className="trusted-section">

              <button
                className="trusted-close-btn"
                onClick={() => setShowStartSharing(false)}
              >
                <img
                  src={TrustedContactsExitButton}
                  alt="Close"
                  className="trusted-close-icon"
                />
              </button>

              <p className="sharing-title">
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
                At this time, trusted contacts must have an active account with Lock It.
                By sending an invitation, you are permitting that user to track your location through Lock It.
              </p>

            </div>

          ) : (

            // Default Trusted Contacts Screen
            <div className="trusted-section">

              <p className="tracking-title">
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
        ) : (
          <>
            <p className="tracking-title">
              You are currently tracking no dates
            </p>

            <p className="tracking-subtext">
              Words here on how to schedule a date/add trusted
              <br />
              contact
            </p>

            {error && <p className="tracking-error">{error}</p>}
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

          <div className="tracking-tab-item">
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

          <div className="tracking-tab-item">
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
            onClick={() =>
                setActiveSection("trusted")
            }
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
