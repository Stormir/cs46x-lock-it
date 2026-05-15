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
          TCAddButton, TCDeclineButton
        } from "../components/DateTrackingIcons.tsx";
import { supabase } from "../client";

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

const otherUserIcon = L.divIcon({
  className: "custom-user-marker",
  html: `
    <div class="user-marker-no-glow">
      <div class="user-marker-profile-placeholder"></div>
      <img
        src="${YourLocationIcon}"
        class="user-marker-frame"
      />
    </div>
  `,
  iconSize: [70, 70],
  iconAnchor: [35, 60],
  popupAnchor: [0, -55],
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
  const [shareEmail, setShareEmail] = useState("");
  const [isCardMinimized, setIsCardMinimized] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);

 /* Invite state */
  const [pendingInvite, setPendingInvite] = useState<{
    id: string;
    preferred_name: string;
    accepted: boolean;
  } | null>(null);

  const [liveDates, setLiveDates] = useState<{
    id: string;
    preferred_name: string;
    city: string;
    last_seen: string | null;
    lat: number | null;
    lngt: number | null;
  }[]>([]);
  // people sharing THEIR location with me

  const [trustedContacts, setTrustedContacts] = useState<{
    id: string;
    trusted_contact_id: string;
    preferred_name: string;
    city: string;
    last_seen: string | null;
  }[]>([]);
  // people I am sharing MY location with

  /* Handles Sending Invite */
  const handleSendInvite = async () => {

    console.log("Add button clicked");
    console.log("Typed email:", shareEmail);
    const email = shareEmail.trim().toLowerCase();

    if (!email) {
      setError("Please enter an email.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in.");
      return;
    }

    const { data: receiver, error: receiverError } = await supabase
      .from("accounts")
      .select("user_id, preferred_name")
      .eq("email", email)
      .single();

    if (receiverError || !receiver) {
      setError("No Lock It account found with that email.");
      return;
    }

    const { data: existingInvite } = await supabase
      .from("live_location_invites")
      .select("id, status")
      .eq("sender_id", user.id)
      .eq("receiver_id", receiver.user_id)
      .in("status", ["pending", "accepted"])
      .maybeSingle();

    if (existingInvite) {
      setError(
        "You already have an active or pending invite with this user."
      );
      return;
    }

    const { data: invite, error: inviteError } = await supabase
      .from("live_location_invites")
      .insert({
        sender_id: user.id,
        receiver_id: receiver.user_id,
        status: "pending",
      })
      .select("id")
      .single();

    if (inviteError) {
      setError("Could not send invite.");
      return;
    }

    setPendingInvite({
      id: invite.id,
      preferred_name: receiver.preferred_name,
      accepted: false,
    });

    setError("");
    setShareEmail("");

    alert(`Invitation sent to ${receiver.preferred_name}`);
  };

  const handleAcceptInvite = async () => {
    if (!pendingInvite) return;

    const { error } = await supabase
      .from("live_location_invites")
      .update({ status: "accepted" })
      .eq("id", pendingInvite.id);

    if (error) {
      console.error("Accept invite failed:", error);
      setError("Could not accept invite.");
      return;
    }

    setLiveDates((prev) => [
      ...prev,
      {
        id: pendingInvite.id,
        preferred_name: pendingInvite.preferred_name,
        city: "Beaverton, OR",
        last_seen: "Now",
        lat: null,
        lngt: null,
      },
    ]);

    setPendingInvite(null);
  };


  const handleDeclineInvite = async () => {
    if (!pendingInvite) return;

    const { error } = await supabase
      .from("live_location_invites")
      .update({ status: "declined" })
      .eq("id", pendingInvite.id);

    if (error) {
      setError("Could not decline invite.");
      return;
    }

    setPendingInvite(null);
  };

  

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

        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return;

          trustedContacts.forEach((contact) => {
            console.log("Writing location for:", contact);

            supabase
              .from("live_location_sharing")
              .upsert(
                {
                  user_id: user.id,
                  trusted_contact_id: contact.trusted_contact_id,
                  lat: updatedPosition.lat,
                  lng: updatedPosition.lngt,
                  is_sharing: true,
                  last_seen: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: "user_id,trusted_contact_id",
                }
              )
              .then((res) => console.log("UPSERT RESULT:", res));
          });
        });
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
 }, [trustedContacts]);

  useEffect(() => {
  const loadPendingInvite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: invite, error } = await supabase
      .from("live_location_invites_with_names")
      .select("*")
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .maybeSingle();

        if (error) {
          console.error("Error loading pending invite:", error);
          return;
        }

    if (!invite) return;

    const senderName = invite.sender_name;

    setPendingInvite({
      id: invite.id,
      preferred_name: senderName ?? "Someone",
      accepted: false,
    });
  };

  loadPendingInvite();
}, []);

/* LOAD ACCEPTED LIVE DATES */
useEffect(() => {
  const loadLiveDates = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    const { data, error } = await supabase
      .from("live_location_sharing_with_names")
      .select("*")
      .eq("trusted_contact_id", user.id)
      .eq("is_sharing", true);

    if (error) {
      console.error("Error loading live dates:", error);
      return;
    }

    if (!data) return;

    setLiveDates(
      data.map((share) => ({
        id: share.id,
        preferred_name: share.sharer_name ?? "Someone",
        city: "Beaverton, OR",
        last_seen: share.last_seen ?? "Now",
        lat: Number(share.lat),
        lngt: Number(share.lng),
      }))
    );
  };

  loadLiveDates();
}, [pendingInvite]);

/* LOAD TRUSTED CONTACTS */
useEffect(() => {
  const loadTrustedContacts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("live_location_invites_with_names")
      .select("*")
      .eq("sender_id", user.id)
      .eq("status", "accepted");

    if (error) {
      console.error("Error loading trusted contacts:", error);
      return;
    }

    if (!data) return;

    setTrustedContacts(
      data.map((invite) => ({
        id: invite.id,
        trusted_contact_id: invite.receiver_id,
        preferred_name: invite.receiver_name ?? "Someone",
        city: "Beaverton, OR",
        last_seen: "Now",
      }))
    );
  };

  loadTrustedContacts();
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

  console.log("LIVE DATES ON MAP:", liveDates);

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
          worldCopyJump={false}
          maxBounds={[
            [-85, -180],
            [85, 180],
          ]}
          maxBoundsViscosity={1.0}
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
            noWrap={true}
          />

          {position && (
            <>
              <Marker position={[position.lat, position.lngt]} icon={userIcon}>
                <Popup>Your current location</Popup>
              </Marker>

              <RecenterMap position={position} />
            </>
          )}

            {liveDates.map((date) =>
              date.lat !== null && date.lngt !== null ? (
                <Marker
                  key={date.id}
                  position={[date.lat, date.lngt]}
                  icon={otherUserIcon}
                >
                  <Popup>{date.preferred_name}</Popup>
                </Marker>
              ) : null
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
              <>
                <p className="module-display-title">Live Dates</p>

                {pendingInvite && (
                  <div className="live-invite-row">
                    <div className="live-invite-avatar">
                    </div>

                    <div className="live-invite-content">
                      <p className="live-invite-text">
                        {pendingInvite.preferred_name} wants you to follow them
                      </p>

                      <div className="live-invite-actions">
                        <button type="button" className="live-action-btn" onClick={handleAcceptInvite}>
                          Accept
                        </button>

                        <button type="button" className="live-action-btn" onClick={handleDeclineInvite}>
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {liveDates.length > 0 ? (
                  <div className="live-date-list">
                    {liveDates.map((date) => (
                      <div
                        className="live-date-row"
                        key={date.id}
                        onClick={() => {
                          if (map && date.lat !== null && date.lngt !== null) {
                            map.setView([date.lat, date.lngt], 14, { animate: true });
                          }
                        }}
                      >
                        <div className="live-invite-avatar">
                        </div>

                        <div className="live-date-info">
                          <p className="live-date-name">{date.preferred_name}</p>
                          <p className="live-date-location">
                            Live location • Now
                          </p>
                        </div>

                        <button className="trusted-remove-btn">✕</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  !pendingInvite && (
                    <p className="module-information-text-1">
                      You are currently tracking no dates
                    </p>
                  )
                )}

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
                <div className="trusted-section">
                  <p className="module-display-title">Start Sharing</p>

                  <div className="sharing-email-row">
                    <input
                      type="email"
                      placeholder="type user's email here"
                      className="sharing-email-input"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />

                    <button
                      type="button"
                      className="sharing-email-add-btn"
                      style={{ background: "transparent", border: "none", padding: 0 }}
                      onClick={handleSendInvite}
                    >
                      <img src={AddButtonIcon} alt="Add" className="sharing-add-icon" />
                    </button>
                  </div>

                  {trustedContacts.length > 0 ? (
                    <>
                      <p className="trusted-contacts-label">Trusted Contacts</p>

                      <div className="live-date-list">
                        {trustedContacts.map((contact) => (
                          <div className="live-date-row" key={contact.id}>
                            <div className="live-invite-avatar">
                            </div>

                            <div className="live-date-info">
                              <p className="live-date-name">{contact.preferred_name}</p>
                            </div>

                            <button className="trusted-remove-btn">✕</button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="sharing-note">
                      Add a trusted contact! At this time, trusted contacts must have
                      an active account with Lock It. By sending an invitation, you
                      are permitting that user to track your location through Lock It.
                    </p>
                  )}
                </div> 
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