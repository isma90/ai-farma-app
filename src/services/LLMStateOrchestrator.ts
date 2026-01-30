export function createLLMStateOrchestrator(apiKey: string) {
  return {
    orchestrateStateTransition: async (
      userMessage: string,
      state: string,
      medications: any[],
      conversationHistory: any[]
    ) => {
      return {
        action: 'continue',
        nextState: null,
        reasoning: '',
      };
    },
  };
}
