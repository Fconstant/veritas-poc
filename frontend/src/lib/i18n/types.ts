export type Locale = 'pt-BR' | 'en-US';

export interface TranslationKeys {
  common: {
    appName: string;
    tagline: string;
    loading: string;
    close: string;
    cancel: string;
    confirm: string;
    continue: string;
    back: string;
    new: string;
    next: string;
    previous: string;
    retry: string;
    copy: string;
    copied: string;
    configured: string;
    settings: string;
  };
  metadata: {
    title: string;
    description: string;
  };
  header: {
    settingsAriaLabel: string;
    settingsTitle: string;
    homeAriaLabel: string;
  };
  hero: {
    title: string;
    titleHighlight: string;
    titleContinuation: string;
    subtitle: string;
    textFiles: string;
    audio: string;
    comingSoon: string;
    and: string;
  };
  verificationForm: {
    label: string;
    placeholder: string;
    useExample: string;
    checkFacts: string;
    tooltipWaitProcessing: string;
    tooltipExceedsLimit: string;
    tooltipEnterText: string;
  };
  apiSetup: {
    welcome: string;
    intro: string;
    whyTitle: string;
    whyDescription: string;
    googleTitle: string;
    googleDescription: string;
    googlePlaceholder: string;
    googleHelpText: string;
    tavilyTitle: string;
    tavilyDescription: string;
    tavilyPlaceholder: string;
    tavilyHelpText: string;
    startVerifying: string;
    usePreviousConfig: string;
    fillBothKeys: string;
    securityNote: string;
  };
  confirmationDialog: {
    newText: {
      description: string;
      confirm: string;
      cancel: string;
    };
    cancelVerification: {
      description: string;
      confirm: string;
      cancel: string;
    };
    goToSettings: {
      description: string;
      confirm: string;
    };
  };
  results: {
    processedText: string;
    verifications: string;
    analysis: string;
    sources: string;
    claimFound: string;
    claimsFound: string;
    noClaimSelected: string;
    firstClaim: string;
    lastClaim: string;
    status: {
      verifying: string;
      complete: string;
      error: string;
    };
    actions: {
      cancel: string;
      retry: string;
      copyAsText: string;
      copied: string;
      new: string;
    };
    messages: {
      processing: string;
      noResults: string;
      error: string;
    };
    navigation: {
      noneSelected: string;
      firstClaim: string;
      lastClaim: string;
    };
    export: {
      verifiedText: string;
      verificationResults: string;
      noResultsFound: string;
      verifiedClaim: string;
      analysis: string;
      sources: string;
      generatedBy: string;
      date: string;
      totalClaims: string;
    };
  };
  toast: {
    closeAriaLabel: string;
  };
  errors: {
    connectionFailed: string;
    internalError: string;
    backendConnectionFailed: string;
  };
  comingSoon: {
    textFiles: string;
    audio: string;
    message: string;
    and: string;
  };
}

