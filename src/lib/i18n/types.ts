export type Locale = "sv" | "en";

export interface Messages {
  nav: {
    daily: string;
    calendar: string;
    campaigns: string;
    standings: string;
    clubs: string;
    derby: string;
    disciplines: string;
    shop: string;
    login: string;
    join: string;
    logout: string;
    openMenu: string;
    language: string;
  };
  play: {
    loading: string;
    unavailable: string;
    daily: string;
    archiveMatch: string;
    campaignMatch: string;
    puzzleLabel: string;
    openCalendar: string;
    backToday: string;
    fullCalendar: string;
    clueProgress: string;
    revealNext: string;
    identify: string;
    possibleScore: string;
    points: string;
    streak: string;
    soundOn: string;
    soundOff: string;
    solved: string;
    gameOver: string;
    sealed: string;
    finalScore: string;
    copyScore: string;
    copied: string;
    shareResult: string;
    shareDuel: string;
    challengeFriend: string;
    challengeScout: string;
    fanMap: string;
    coins: string;
    nextMatch: string;
    backToSport: string;
    duelLive: string;
    dayStreak: string;
  };
  derby: {
    title: string;
    subtitle: string;
    total: string;
    average: string;
    tableToggle: string;
    scopeToggle: string;
    rank: string;
    club: string;
    scouts: string;
    clubPoints: string;
    averagePerScout: string;
  };
  standings: {
    title: string;
    subtitleWorld: string;
    subtitleSweden: string;
    thisWeek: string;
    allTime: string;
    weekReset: string;
    scopeToggle: string;
    playDaily: string;
    points: string;
    streakDays: string;
    solved: string;
    solvedCount: string;
    close: string;
    ranges: {
      bronze: string;
      silver: string;
      gold: string;
      hall: string;
    };
  };
  clubs: {
    eyebrow: string;
    swedenHeading: string;
    internationalHeading: string;
    pledge: string;
    choose: string;
    clubLabel: string;
    save: string;
    saving: string;
    loginToSave: string;
    saved: string;
    saveFailed: string;
    scopeLabel: string;
  };
  profile: {
    languageTitle: string;
    languageHint: string;
  };
  footer: {
    tagline: string;
    contact: string;
  };
  scope: {
    sweden: string;
    international: string;
  };
}
