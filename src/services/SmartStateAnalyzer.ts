export class SmartStateAnalyzer {
  constructor(apiKey: string) {}

  async analyzeStateTransition(
    userMessage: string,
    state: string,
    medications: any[],
    conversationHistory: any[]
  ) {
    return {
      hasAllMedications: false,
      hasAllFrequencies: false,
      canSkipStates: false,
      skipTo: null,
      confidence: 0,
      reasoning: '',
    };
  }
}
