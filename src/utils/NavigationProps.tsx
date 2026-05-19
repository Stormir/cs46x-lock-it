export const createNavigationProps = (
  setPage: (page: any) => void
) => ({
  setPageHome: () => setPage("Home"),
  setPageSettings: () => setPage("Settings"),
  setPageDateTracking: () => setPage("DateTracking"),
  setPageProfile: () => setPage("Profile"),
  setPageViewYourMatches: () => setPage("ViewYourMatches"),
  setPageMatchMessages: () => setPage("MatchMessages"),
  setPageEditPreferences: () => setPage("EditPreferences"),
  setPageSafetySupportAndCommunity: () =>
    setPage("SafetySupportAndCommunity"),
  setPageChangeChannels: () => setPage("ChangeChannels"),
});