import React from "react";
import ComingSoonMENU from "../components/ComingSoonMENU";

type MatchMessagesProps = {
  setPageHome: () => void;
  setPageSettings: () => void;
  setPageDateTracking: () => void;
  setPageProfile: () => void;
  setPageMatches: () => void;
  setPageMatchMessages: () => void;
  setPageEditPreferences: () => void;
  setPageSafetySupportAndCommunity: () => void;
  setPageChangeChannels: () => void;
};

const MatchMessages: React.FC<MatchMessagesProps> = ({
  setPageHome,
  setPageSettings,
  setPageDateTracking,
  setPageProfile,
  setPageMatches,
  setPageMatchMessages,
  setPageEditPreferences,
  setPageSafetySupportAndCommunity,
  setPageChangeChannels,
}) => {
  return (
    <ComingSoonMENU
      title="Match Messages coming soooon HEHE"
      onBack={setPageHome}
      setPageHome={setPageHome}
      setPageSettings={setPageSettings}
      setPageDateTracking={setPageDateTracking}
      setPageProfile={setPageProfile}
      setPageMatches={setPageMatches}
      setPageMatchMessages={setPageMatchMessages}
      setPageEditPreferences={setPageEditPreferences}
      setPageSafetySupportAndCommunity={setPageSafetySupportAndCommunity}
      setPageChangeChannels={setPageChangeChannels}
    />
  );
};

export default MatchMessages;