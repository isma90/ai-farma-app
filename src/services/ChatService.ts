import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '../utils/uuid';
import { medicationScheduleService } from './MedicationScheduleService';
import { reminderService } from './ReminderService';
import { pharmacyService } from './PharmacyService';
import { locationService } from './LocationService';
import { IConversationSnapshot } from '../types/chat';
import { scheduleStateMachine, ScheduleState, MessageType, MedicationData } from './ScheduleStateMachine';
import { medicationScheduleOptimizer } from './MedicationScheduleOptimizer';
import { SmartStateAnalyzer } from './SmartStateAnalyzer';
import { createLLMStateOrchestrator } from './LLMStateOrchestrator';
import { chatApiClient, IBackendChatResponse, IToolCallResult } from './api/chatApiClient';

const CHAT_HISTORY_KEY = 'chat_history';
const CHAT_MESSAGES_PREFIX = 'chat_messages';
const CHAT_CONVERSATIONS_KEY_PREFIX = 'chat_conversations';
const CURRENT_CONVERSATION_KEY_PREFIX = 'current_conversation';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCallResult[];
}

export interface ToolCallResult {
  toolName: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

class ChatService {
  private conversationsCache: Map<string, IConversationSnapshot> = new Map();
  private messagesCache: Map<string, ChatMessage[]> = new Map();
  private currentConversationId: string | null = null;
  private isInitialized = false;
  private stateAnalyzer: SmartStateAnalyzer;
  private stateOrchestrator: any; // LLMStateOrchestrator
  private openaiApiKey: string; // Keep for backwards compatibility with state machine

  constructor() {
    // Note: OpenAI API key is now handled by backend
    // Keeping this for state machine compatibility (can be removed after refactoring state machine)
    this.openaiApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    this.stateAnalyzer = new SmartStateAnalyzer(this.openaiApiKey);
    this.stateOrchestrator = createLLMStateOrchestrator(this.openaiApiKey);
  }

  /**
   * Enhanced system prompt with state machine awareness
   * Guides bot through sequential states while respecting validation
   * Includes current state to prevent premature tool calls
   */
  private getSystemPrompt(conversationId?: string): string {
    // Get current state machine context
    const convId = conversationId || 'default';
    const context = scheduleStateMachine.getContext(convId);

    let medicationsList = '';
    let medicationsJson = '';
    if (context && context.medications.length > 0) {
      medicationsList = context.medications
        .map((m) => `- ${m.name}${m.dosage ? ` (${m.dosage})` : ''}${m.frequency ? ` - ${m.frequency}` : ''}`)
        .join('\n');

      // For CREATING state, provide JSON format for direct tool invocation
      const toolFormattedMeds = this.formatMedicationsForTool(context.medications);
      medicationsJson = JSON.stringify(toolFormattedMeds, null, 2);
    }

    let stateInfo = '';
    if (context) {
      stateInfo = `
## ESTADO ACTUAL DE LA MÁQUINA:
- Estado: ${context.state}
- Medicamentos recolectados: ${context.medications.length}
- Todos tienen frecuencia: ${context.medications.every(m => m.frequency) ? 'SÍ' : 'NO'}
- Horarios propuestos: ${context.proposedTimes?.length || 0}
- Horarios confirmados: ${context.timesConfirmed ? 'SÍ' : 'NO'}

## MEDICAMENTOS RECOLECTADOS:
${medicationsList || '(Ninguno aún)'}`;

      // Add JSON format for CREATING state
      if (context.state === ScheduleState.CREATING && medicationsJson) {
        stateInfo += `

## FORMATO JSON PARA TOOL (copiar exactamente):
\`\`\`json
${medicationsJson}
\`\`\``;
      }

      stateInfo += `

INSTRUCCIÓN CRÍTICA POR ESTADO:
- Si estado es COLLECTING_MEDS: NO HAGAS NADA EXCEPTO RECOLECTAR MEDICAMENTOS
- Si estado es COLLECTING_FREQUENCY: NO HAGAS NADA EXCEPTO PEDIR FRECUENCIAS
- Si estado es GENERATING_TIMES: GENERA HORARIOS (llama SIEMPRE el tool create_medication_schedule con los medicamentos listados arriba)
- Si estado es SHOWING_PROPOSAL: ESPERA CONFIRMACIÓN DEL USUARIO (pregunta "¿Deseas crear este cronograma en la app?")
- Si estado es CREATING: USUARIO CONFIRMÓ - EJECUTA INMEDIATAMENTE tool create_medication_schedule (SIN PREGUNTAR)
  * Usa el JSON arriba para la invocación del tool
  * Llama el tool con TODOS los medicamentos del JSON
  * NO hagas nada más, NO preguntes nada - simplemente invoca el tool
- En cualquier otro estado: NO USES create_medication_schedule
`;
    }

    return `Eres un asistente farmacéutico inteligente para la app AI Farma.

${stateInfo}

## ALCANCE - Solo ayuda con:
- Información de medicamentos y usos
- Efectos secundarios e interacciones
- Farmacias y servicios
- Horarios y adherencia a medicamentos
- Advertencias de seguridad

## FUERA DE ALCANCE - Rechaza:
- Diagnósticos médicos: "No puedo diagnosticar. Consulta un médico"
- Prescripciones: "No puedo prescribir. Consulta un médico"
- Temas no relacionados: "Eso está fuera de mi alcance"

## AUTOMEDICACIÓN - DETECCIÓN Y ADVERTENCIAS CRÍTICAS

Detecta patrones que indican automedicación:

### PATRONES A DETECTAR:
1. **Sin receta**: "Compré ibuprofeno sin receta", "Me automediqu con paracetamol"
   → Advierte: "⚠️ Automedicación detectada. Consulta con un farmacéutico antes de continuar"

2. **Medicamentos compartidos**: "Tomo medicamentos de mi amiga", "Usa mi medicina", "Me prestó"
   → Advierte: "⚠️ CRÍTICO: No se deben compartir medicamentos prescritos. Cada persona necesita su propia prescripción"

3. **Dosis incorrecta/Sobredosis**: "Quiero más dosis", "Duplico la dosis", "Tomo el doble"
   → Advierte: "⚠️ CRÍTICO: Riesgo de sobredosis. NO cambies dosis sin consultar médico"

4. **Interrupción sin consulta**: "Dejé de tomar", "Paré el medicamento"
   → Advierte: "⚠️ Consulta médico antes de interrumpir medicamentos"

5. **Síntomas sin diagnóstico**: "Me duele la cabeza, qué tomo?", "Tengo fiebre, qué medicamento?"
   → Responde: "No puedo recomendar medicamentos para síntomas. Consulta a un médico para diagnóstico"

### CON PRESCRIPCIÓN MÉDICA:
- Si menciona "receta del doctor", "me prescribió", "medicamento del hospital"
- NO mostrar advertencia de automedicación
- SÍ analizar interacciones entre medicamentos
- SÍ responder preguntas como "¿me las puedo tomar todas juntas?" con información técnica
- Proceder normalmente con horarios y recordatorios

### ANÁLISIS DE INTERACCIONES (CUANDO HAY RECETA):
- Si usuario pregunta "¿puedo tomar X con Y juntos?" → ANALIZA y responde
- Si detectas combinaciones problemáticas → ADVIERTE pero sigue adelante (ya tiene receta médica)
- Si detectas que no hay interacciones significativas → CONFIRMA que es seguro
- SIEMPRE procede a crear cronograma con horarios que minimicen interacciones

## CRONOGRAMA DE MEDICAMENTOS - MÁQUINA DE ESTADOS ESTRICTA

Sigue estos pasos EXACTAMENTE en orden. NO SALTES PASOS.

PASO 1: RECOLECTAR MEDICAMENTOS
- Si el usuario pide cronograma/horario, pregunta:
  "¿Qué medicamentos y dosis? (ejemplo: Paracetamol 1g, Amoxicilina 500mg)"
- Si NO tiene medicamentos: REPITE la pregunta
- Si SÍ tiene medicamentos: Ir a PASO 2

PASO 2: RECOLECTAR FRECUENCIA (CRÍTICO)
- Verifica que CADA medicamento tenga frecuencia
- Si FALTA frecuencia en alguno:
  "¿Cuántas veces al día toma la Amoxicilina?"
  "¿La Azitromicina cada cuántas horas?"
- REPITE hasta tener TODAS las frecuencias

PASO 3: CONFIRMACIÓN Y GENERACIÓN DE HORARIOS
- Una vez tengas TODAS las frecuencias:
  1. PRIMER MENSAJE: "Gracias por la información. Voy a calcular los horarios exactos para cada medicamento. Dame un momento."
  2. LUEGO: Calcula horarios basados en frecuencia
  3. SEGUNDO MENSAJE: Muestra el calendario con formato:

  ⏰ HORARIOS RECOMENDADOS:
  07:00 → Paracetamol 1g
  15:00 → Amoxicilina 500mg
  (etc)

  Luego pregunta: "¿Te acomodan estos horarios?"

PASO 4: PEDIR CONFIRMACIÓN DE HORARIOS
- El calendario ya fue mostrado en el mensaje anterior
- Pregunta: "¿Te acomodan estos horarios? ¿Algún cambio?"
- Si AJUSTA: Actualiza horarios y muestra nuevamente
- Si CONFIRMA: Ir a PASO 5
- Si RECHAZA: Volver a PASO 2

PASO 5: PEDIR CONFIRMACIÓN FINAL
- El usuario confirmó los horarios
- Pregunta: "¿Deseas crear este cronograma en la app?"
- Si CONFIRMA: Usa create_medication_schedule tool
- Si RECHAZA: Volver a PASO 4

## IMPORTANTE:
- NO crear cronograma sin pasar TODOS los pasos
- NO saltar verificación de frecuencia
- NO usar herramienta sin confirmación de horarios
- Si usuario pregunta sobre medicinas: responde pero mantén el estado actual

## BÚSQUEDA DE FARMACIAS
- Si usuario pregunta: "¿Dónde hay farmacias?", "¿Farmacias cercanas?", "¿Farmacia de turno?"
- Usa tool: get_nearby_pharmacies para encontrar las más cercanas
- Muestra: Nombre, dirección, distancia, si es de turno (24h)
- Destaca: Las farmacias de turno con 📍24h

## ESTILO:
- Respuestas BREVES: máximo 2-3 oraciones
- Sin relleno ni explicaciones innecesarias
- En español
- Solo emojis que sumen (⏰ ✓ ⚠️ 📍)
- Preguntas puntuales y directas`;
  }

  async sendMessage(userMessage: string, conversationHistory: ChatMessage[], userId?: string, conversationId?: string): Promise<{
    text: string;
    toolCalls?: ToolCallResult[];
  }> {
    if (!userId || !conversationId) {
      throw new Error('userId and conversationId are required');
    }

    try {
      // Initialize state machine context for this conversation
      const convId = conversationId;
      if (!scheduleStateMachine.getContext(convId)) {
        scheduleStateMachine.initializeContext(convId);
      }

      console.log('[ChatService] ========== NEW MESSAGE ==========');
      console.log('[ChatService] User message:', userMessage);
      console.log('[ChatService] Sending to backend: userId=', userId, 'conversationId=', convId);

      // Classify the message to determine if it's schedule-related or bifurcation
      const currentContext = scheduleStateMachine.getContext(convId);
      const messageType = scheduleStateMachine.classifyMessage(userMessage, currentContext?.state || ScheduleState.IDLE);
      console.log('[ChatService] Current state:', currentContext?.state || ScheduleState.IDLE);
      console.log('[ChatService] Message type:', messageType);

      // Handle bifurcations: if user asks about medication info, track it but don't change main state
      let bifurcationId: string | undefined;
      if (messageType === MessageType.BIFURCATION && currentContext) {
        bifurcationId = scheduleStateMachine.startBifurcation(convId, 'medication_info').id;
      }

      // Pre-update state machine BEFORE calling backend
      // This ensures the state is correct when backend generates response and attempts tool calls
      const preStateUpdate = await this.updateStateMachineState(convId, userMessage, '', conversationHistory);
      console.log('[ChatService] Pre-backend state update completed');

      // Call backend API
      const backendResponse = await chatApiClient.sendMessage(userId, convId, userMessage);
      console.log('[ChatService] Backend response received:', backendResponse.timestamp);

      // Extract and process response
      let assistantMessage = backendResponse.response;

      // Convert backend tool_calls to internal ToolCallResult format
      // Handle null tool_calls from backend (convert to empty array)
      const toolCallResults: ToolCallResult[] = (backendResponse.tool_calls || []).map((toolCall: IToolCallResult) => ({
        toolName: toolCall.tool_name,
        success: toolCall.success,
        result: toolCall.result,
        error: toolCall.error,
      }));

      // Handle backend warnings (has_warning, warning_severity)
      if (backendResponse.metadata.has_warning && backendResponse.metadata.warning_severity) {
        const warningPrefix = `⚠️ ADVERTENCIA ${backendResponse.metadata.warning_severity}: `;
        if (!assistantMessage.startsWith('⚠️')) {
          assistantMessage = `${warningPrefix}${assistantMessage}`;
        }
        console.log(`[ChatService] Added backend warning: ${backendResponse.metadata.warning_severity}`);
      }

      // If schedules were generated locally and need to be appended
      if (preStateUpdate.schedulesGenerated && preStateUpdate.proposedTimes.length > 0) {
        const context = scheduleStateMachine.getContext(convId);
        if (context && context.medications.length > 0) {
          const calendarMessage = this.formatScheduleProposal(convId, context.medications, preStateUpdate.proposedTimes);
          assistantMessage = `${assistantMessage}\n\n${calendarMessage}`;
          console.log('[ChatService] Appended generated schedule to response');
        }
      }

      // If bifurcation occurred, end it and restore parent state
      if (bifurcationId) {
        scheduleStateMachine.endBifurcation(convId, bifurcationId);
      }

      if (!assistantMessage && toolCallResults.length === 0) {
        throw new Error('No response from backend');
      }

      // Log the assistant response
      console.log('[ChatService] Assistant response:', assistantMessage.substring(0, 300) + (assistantMessage.length > 300 ? '...' : ''));

      return {
        text: assistantMessage,
        toolCalls: toolCallResults.length > 0 ? toolCallResults : undefined,
      };
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }

  /**
   * Tool execution is now handled by the backend.
   * Tool calls are returned in the backend response with already-executed results.
   * This method is kept for reference but is no longer used.
   *
   * @deprecated Tool execution is now handled by backend API
   */
  private async executeToolCalls(
    toolCalls: any[],
    userId?: string,
    conversationId?: string,
  ): Promise<ToolCallResult[]> {
    console.warn('[ChatService] executeToolCalls called but should not be used - backend handles tool execution');
    return [];
  }

  /**
   * Tool: create_medication_schedule
   * Generates optimal medication schedule and saves it
   * Only executes if state machine validation passes
   */
  private async createMedicationSchedule(input: unknown, userId?: string, conversationId?: string): Promise<unknown> {
    try {
      const scheduleInput = input as { medications: unknown[] };
      const convId = conversationId || 'default';

      const schedule = await medicationScheduleService.generateSchedule({
        medications: scheduleInput.medications as any,
        context: 'chat', // Mark as created from chat
      });

      console.log(`[ChatService] Successfully created schedule for conversation ${convId}`);

      return {
        success: true,
        schedule: {
          id: schedule.id,
          medications: schedule.medications,
          schedule: schedule.schedule,
          interactions: schedule.interactions,
          warnings: schedule.warnings,
        },
      };
    } catch (error) {
      console.error('[ChatService] Failed to create schedule:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate schedule',
      };
    }
  }

  /**
   * Tool: set_medication_reminder
   * Creates reminder for medication
   */
  private async setMedicationReminder(input: unknown): Promise<unknown> {
    try {
      const reminderInput = input as {
        scheduleId: string;
        medicationName: string;
        time: string;
        notes?: string;
      };

      const reminder = await reminderService.createReminder(
        reminderInput.scheduleId,
        reminderInput.medicationName,
        reminderInput.time,
        reminderInput.notes,
      );

      return {
        success: true,
        reminderId: reminder.id,
        reminder: {
          id: reminder.id,
          scheduleId: reminder.scheduleId,
          medicationName: reminder.medicationName,
          time: reminder.time,
          enabled: reminder.enabled,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create reminder',
      };
    }
  }

  /**
   * Tool: update_medication_reminder
   * Updates existing reminder
   */
  private async updateMedicationReminder(input: unknown): Promise<unknown> {
    try {
      const updateInput = input as {
        reminderId: string;
        time?: string;
        enabled?: boolean;
        notes?: string;
      };

      const reminder = await reminderService.updateReminder(updateInput.reminderId, {
        time: updateInput.time,
        enabled: updateInput.enabled,
        notes: updateInput.notes,
      });

      return {
        success: true,
        reminderId: reminder.id,
        updatedFields: Object.keys(updateInput).filter((k) => k !== 'reminderId'),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update reminder',
      };
    }
  }

  /**
   * Tool: get_nearby_pharmacies
   * Gets nearby pharmacies sorted by distance
   */
  private async getNearbyPharmacies(input: unknown): Promise<unknown> {
    try {
      // Get user's current location
      const location = await locationService.getLocation();

      // Get pharmacies nearby
      const allPharmacies = await pharmacyService.getPharmaciesNearby(location);

      // Return only the closest pharmacy
      const closestPharmacy = allPharmacies[0];

      if (!closestPharmacy) {
        return {
          success: true,
          pharmacy: null,
          count: 0,
        };
      }

      return {
        success: true,
        pharmacy: {
          id: closestPharmacy.id,
          nombre: closestPharmacy.nombre,
          direccion: closestPharmacy.direccion,
          comuna: closestPharmacy.comuna,
          distanceKm: closestPharmacy.distanceKm ? Math.round(closestPharmacy.distanceKm * 100) / 100 : 0,
          isTurno: closestPharmacy.isTurno || false,
          telefono: closestPharmacy.telefono,
          latitude: closestPharmacy.latitude,
          longitude: closestPharmacy.longitude,
        },
        count: 1,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get nearby pharmacies',
      };
    }
  }

  /**
   * Initialize service by loading conversations from AsyncStorage
   */
  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load all conversations metadata
      await this.loadAllConversations(userId);

      // Load current conversation ID
      const currentKey = this.getCurrentConversationKey(userId);
      const currentId = await AsyncStorage.getItem(currentKey);
      if (currentId) {
        this.currentConversationId = currentId;
      }

      this.isInitialized = true;
      console.log('[ChatService] Initialized successfully');
    } catch (error) {
      console.error('[ChatService] Failed to initialize:', error);
    }
  }

  /**
   * Get conversation history from backend
   * Retrieves full conversation with all messages
   */
  async getConversationHistoryFromBackend(userId: string, conversationId: string): Promise<ChatMessage[]> {
    try {
      const backendData = await chatApiClient.getConversationHistory(userId, conversationId);

      // Convert backend messages to ChatMessage format
      const messages: ChatMessage[] = backendData.messages.map((msg) => ({
        id: generateUUID(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }));

      // Cache locally
      this.messagesCache.set(conversationId, messages);
      console.log(`[ChatService] Retrieved ${messages.length} messages from backend for conversation ${conversationId}`);

      return messages;
    } catch (error) {
      console.error('[ChatService] Failed to get conversation history from backend:', error);
      throw error;
    }
  }

  /**
   * Get all conversations for user from backend
   * Retrieves list of conversation summaries
   */
  async getUserConversationsFromBackend(userId: string): Promise<IConversationSnapshot[]> {
    try {
      const backendData = await chatApiClient.getUserConversations(userId);

      // Convert backend format to IConversationSnapshot
      const conversations = backendData.conversations.map((conv) => ({
        id: conv.id,
        user_id: conv.user_id,
        title: conv.title,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        message_count: conv.message_count,
        messageCount: conv.message_count,
        summary: conv.summary,
        first_message: conv.first_message,
        firstMessage: conv.first_message,
        last_message: conv.last_message,
        lastMessage: conv.last_message,
        estimated_token_count: conv.estimated_token_count,
      })) as IConversationSnapshot[];

      // Update cache
      conversations.forEach((conv) => {
        this.conversationsCache.set(conv.id, conv);
      });

      console.log(`[ChatService] Retrieved ${conversations.length} conversations from backend`);
      return conversations;
    } catch (error) {
      console.error('[ChatService] Failed to get conversations from backend:', error);
      throw error;
    }
  }

  /**
   * Save chat messages for a specific conversation
   */
  async saveChatHistory(
    userId: string,
    conversationId: string,
    messages: ChatMessage[]
  ): Promise<void> {
    try {
      const key = this.getConversationMessagesKey(userId, conversationId);
      await AsyncStorage.setItem(key, JSON.stringify(messages));
      this.messagesCache.set(conversationId, messages);
      console.log(`[ChatService] Saved ${messages.length} messages for conversation ${conversationId}`);
    } catch (error) {
      console.error('[ChatService] Failed to save chat history:', error);
    }
  }

  /**
   * Load chat messages for a specific conversation
   */
  async loadChatHistory(userId: string, conversationId: string): Promise<ChatMessage[]> {
    try {
      // Check cache first
      if (this.messagesCache.has(conversationId)) {
        return this.messagesCache.get(conversationId) || [];
      }

      // Load from AsyncStorage
      const key = this.getConversationMessagesKey(userId, conversationId);
      const data = await AsyncStorage.getItem(key);

      if (data) {
        const messages = JSON.parse(data) as ChatMessage[];
        // Convert timestamp strings back to Date objects
        messages.forEach((msg) => {
          msg.timestamp = new Date(msg.timestamp);
        });
        this.messagesCache.set(conversationId, messages);
        return messages;
      }

      return [];
    } catch (error) {
      console.error('[ChatService] Failed to load chat history:', error);
      return [];
    }
  }

  /**
   * Summarize a conversation using backend API
   * @deprecated Summarization is now handled by backend during conversation operations
   */
  private async summarizeConversation(messages: ChatMessage[]): Promise<string> {
    console.log('[ChatService] Note: Summarization is now handled by backend API');
    return '';
  }

  /**
   * Create a conversation snapshot for storage in history
   */
  async createConversationSnapshot(
    userId: string,
    conversationId: string,
    messages: ChatMessage[]
  ): Promise<IConversationSnapshot> {
    try {
      // Auto-summarize if more than 20 messages
      let summary = '';
      if (messages.length > 20) {
        summary = await this.summarizeConversation(messages);
      }

      // Extract title from first user message
      const title = this.extractTitle(messages);

      // Create snapshot
      const snapshot: IConversationSnapshot = {
        id: conversationId,
        userId,
        title,
        createdAt: messages[0]?.timestamp || new Date(),
        updatedAt: new Date(),
        messageCount: messages.length,
        summary,
        firstMessage: messages[0]?.content || '',
        lastMessage: messages[messages.length - 1]?.content,
        tokenCount: this.estimateTokens(messages),
      };

      return snapshot;
    } catch (error) {
      console.error('[ChatService] Failed to create snapshot:', error);
      throw error;
    }
  }

  /**
   * Save conversation snapshot to history list
   */
  async saveConversationSnapshot(
    userId: string,
    snapshot: IConversationSnapshot
  ): Promise<void> {
    try {
      const conversations = await this.loadAllConversations(userId);

      // Remove if exists (update), otherwise add
      const index = conversations.findIndex((c) => c.id === snapshot.id);
      if (index >= 0) {
        conversations[index] = snapshot;
      } else {
        conversations.unshift(snapshot); // Add to beginning (most recent first)
      }

      // Save to AsyncStorage
      const key = this.getConversationsListKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(conversations));

      // Update cache
      this.conversationsCache.set(snapshot.id, snapshot);
      console.log('[ChatService] Saved conversation snapshot:', snapshot.id);
    } catch (error) {
      console.error('[ChatService] Failed to save conversation snapshot:', error);
    }
  }

  /**
   * Load all conversation snapshots for a user
   */
  async loadAllConversations(userId: string): Promise<IConversationSnapshot[]> {
    try {
      const key = this.getConversationsListKey(userId);
      const data = await AsyncStorage.getItem(key);

      if (data) {
        const snapshots = JSON.parse(data) as IConversationSnapshot[];
        // Convert date strings back to Date objects
        snapshots.forEach((snapshot) => {
          snapshot.createdAt = new Date(snapshot.createdAt);
          snapshot.updatedAt = new Date(snapshot.updatedAt);
        });
        // Update cache
        snapshots.forEach((snapshot) => {
          this.conversationsCache.set(snapshot.id, snapshot);
        });
        return snapshots;
      }

      return [];
    } catch (error) {
      console.error('[ChatService] Failed to load conversations:', error);
      return [];
    }
  }

  /**
   * Delete a conversation and its messages from backend and local storage
   */
  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    try {
      // Delete from backend first
      await chatApiClient.deleteConversation(userId, conversationId);
      console.log('[ChatService] Deleted conversation from backend:', conversationId);

      // Remove from local cache
      this.conversationsCache.delete(conversationId);
      this.messagesCache.delete(conversationId);

      // Remove from conversations list
      const conversations = await this.loadAllConversations(userId);
      const filtered = conversations.filter((c) => c.id !== conversationId);

      const key = this.getConversationsListKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));

      // Delete messages
      const msgKey = this.getConversationMessagesKey(userId, conversationId);
      await AsyncStorage.removeItem(msgKey);

      console.log('[ChatService] Deleted conversation from local storage:', conversationId);
    } catch (error) {
      console.error('[ChatService] Failed to delete conversation:', error);
      throw error;
    }
  }

  /**
   * Set current active conversation
   */
  async setCurrentConversation(userId: string, conversationId: string): Promise<void> {
    try {
      this.currentConversationId = conversationId;
      const key = this.getCurrentConversationKey(userId);
      await AsyncStorage.setItem(key, conversationId);
    } catch (error) {
      console.error('[ChatService] Failed to set current conversation:', error);
    }
  }

  /**
   * Get current active conversation ID
   */
  getCurrentConversationId(): string | null {
    return this.currentConversationId;
  }

  /**
   * Clear all conversations for a user from backend and local storage
   */
  async clearAllConversations(userId: string): Promise<void> {
    try {
      // Clear from backend first
      await chatApiClient.clearAllConversations(userId);
      console.log('[ChatService] Cleared all conversations from backend');

      const conversations = await this.loadAllConversations(userId);

      // Delete all conversation messages from local storage
      for (const conversation of conversations) {
        const msgKey = this.getConversationMessagesKey(userId, conversation.id);
        await AsyncStorage.removeItem(msgKey);
        this.messagesCache.delete(conversation.id);
      }

      // Clear conversations list
      const key = this.getConversationsListKey(userId);
      await AsyncStorage.removeItem(key);

      // Clear current conversation
      const currentKey = this.getCurrentConversationKey(userId);
      await AsyncStorage.removeItem(currentKey);

      this.conversationsCache.clear();
      this.currentConversationId = null;

      console.log('[ChatService] Cleared all conversations from local storage');
    } catch (error) {
      console.error('[ChatService] Failed to clear conversations:', error);
      throw error;
    }
  }

  /**
   * Helper: Get storage key for conversation messages
   */
  private getConversationMessagesKey(userId: string, conversationId: string): string {
    return `${CHAT_MESSAGES_PREFIX}_${userId}_${conversationId}`;
  }

  /**
   * Helper: Get storage key for conversations list
   */
  private getConversationsListKey(userId: string): string {
    return `${CHAT_CONVERSATIONS_KEY_PREFIX}_${userId}`;
  }

  /**
   * Helper: Get storage key for current conversation
   */
  private getCurrentConversationKey(userId: string): string {
    return `${CURRENT_CONVERSATION_KEY_PREFIX}_${userId}`;
  }

  /**
   * Helper: Extract title from messages
   */
  private extractTitle(messages: ChatMessage[]): string {
    // Find first user message after greeting
    const userMessages = messages.filter((m) => m.role === 'user' && m.content.length > 10);
    if (userMessages.length > 0) {
      const text = userMessages[0].content;
      return text.length > 60 ? text.substring(0, 60) + '...' : text;
    }
    return `Conversación ${new Date().toLocaleDateString('es-ES')}`;
  }

  /**
   * Helper: Estimate token count
   */
  private estimateTokens(messages: ChatMessage[]): number {
    // Rough estimation: ~4 characters per token
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    return Math.ceil(totalChars / 4);
  }

  /**
   * Extract medications from user message
   * Parses messages like: "Paracetamol 1g, Amoxicilina 500mg"
   */
  /**
   * Extract medications from user message using LLM
   * Sends RAW message to OpenAI to extract:
   * - Medication names
   * - Dosages (with units)
   * - Frequencies (how often to take)
   *
   * This is more reliable than regex since LLM understands context and variations
   */
  private async extractMedicationsFromMessage(message: string): Promise<MedicationData[]> {
    if (!this.openaiApiKey) {
      console.warn('[ChatService] No API key for medication extraction, returning empty');
      return [];
    }

    try {
      const prompt = `You are a pharmaceutical assistant. Extract medication information from the user's message.

USER MESSAGE:
"${message}"

TASK: Extract ALL medications mentioned and return as JSON.

For EACH medication, extract:
1. name: The medication name (e.g., "Paracetamol", "Levotiroxina")
2. dosage: The dose with unit (e.g., "500mg", "20ml", "una cápsula de 500mg", "1g")
3. frequency: How often to take it (e.g., "cada 12h", "2 veces al día", "una vez al día")

IMPORTANT:
- Extract EXACTLY what the user said, don't assume or add information
- If frequency is not mentioned, use null
- Handle Spanish frequency variations:
  * "cada 8h", "cada 12h" = every X hours
  * "2 veces al día" = X times per day
  * "una vez al día" = once daily
  * "vez al día" = per day

CRITICAL: Only extract ACTUAL MEDICATIONS, not conversational words:
- "uno genial" = NOT a medication (don't extract)
- "algo" = NOT a medication (don't extract)
- "un comprimido" = NOT a medication (don't extract unless medication name is present)
- Medication names are SPECIFIC: Paracetamol, Levotiroxina, Omeprazol, Calcio, Aspirin, etc.

Return ONLY valid JSON (no markdown, no explanation):
{
  "medications": [
    {
      "name": "Medication Name",
      "dosage": "amount with unit",
      "frequency": "how often or null"
    }
  ]
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a pharmaceutical assistant. Extract medication information from text and return ONLY valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.2, // Low temperature for consistent extraction
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        console.warn('[ChatService] LLM extraction failed, returning empty');
        return [];
      }

      const data = await response.json();
      const responseText = data.choices[0]?.message?.content || '';

      try {
        // Clean markdown if present
        let cleanedText = responseText.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.slice(7);
        }
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.slice(3);
        }
        if (cleanedText.endsWith('```')) {
          cleanedText = cleanedText.slice(0, -3);
        }

        const parsed = JSON.parse(cleanedText.trim());
        const medications = parsed.medications || [];

        // Validate and clean up the medications
        const validated: MedicationData[] = medications
          .filter((m: any) => m.name && m.name.length >= 2)
          .map((m: any) => ({
            name: String(m.name).trim(),
            dosage: String(m.dosage || '').trim(),
            frequency: m.frequency ? String(m.frequency).trim() : undefined,
          }));

        console.log('[ChatService] LLM extracted', validated.length, 'medications');
        return validated;
      } catch (parseError) {
        console.warn('[ChatService] Failed to parse LLM response:', parseError);
        console.warn('[ChatService] Raw response:', responseText);
        return [];
      }
    } catch (error) {
      console.error('[ChatService] Error in LLM medication extraction:', error);
      return [];
    }
  }


  /**
   * Detect self-medication patterns in user message
   * Returns warning type and severity if detected
   */
  private detectSelfMedicationPatterns(message: string): { type: string; severity: 'low' | 'medium' | 'critical'; warning: string } | null {
    const lowerMessage = message.toLowerCase();

    // Pattern 1: Medication without prescription
    const noPrescriptionPatterns = [
      /compré.*sin receta/i,
      /automediqu/i,
      /compé medicamento/i,
      /tomé.*sin receta/i,
      /me auto.?medico/i,
    ];
    if (noPrescriptionPatterns.some((p) => p.test(lowerMessage))) {
      return {
        type: 'no_prescription',
        severity: 'medium',
        warning: '⚠️ Automedicación detectada. Es importante consultar con un farmacéutico o médico antes de continuar.',
      };
    }

    // Pattern 2: Shared medications (CRITICAL)
    const sharedMedPatterns = [
      /tomo.*medicamentos.*de mi amiga/i,
      /medicamentos de otra persona/i,
      /usa.*mi medicina/i,
      /me prestó.*medicamento/i,
      /tomo.*del.*de alguien/i,
      /medicamento compartido/i,
    ];
    if (sharedMedPatterns.some((p) => p.test(lowerMessage))) {
      return {
        type: 'shared_medication',
        severity: 'critical',
        warning: '⚠️ CRÍTICO: No se deben compartir medicamentos prescritos. Cada persona necesita su propia prescripción médica adaptada a su condición.',
      };
    }

    // Pattern 3: Overdose or incorrect dosage (CRITICAL)
    const overdosePatterns = [
      /quiero.*más dosis/i,
      /duplico.*dosis/i,
      /tomo.*el doble/i,
      /aumentar.*dosis/i,
      /más medicamento/i,
      /dosis.*mayor/i,
    ];
    if (overdosePatterns.some((p) => p.test(lowerMessage))) {
      return {
        type: 'overdose_risk',
        severity: 'critical',
        warning: '⚠️ CRÍTICO: No cambies la dosis sin consultar a tu médico. El riesgo de sobredosis es serio.',
      };
    }

    // Pattern 4: Stopping medication without consultation
    const interruptionPatterns = [
      /dejé.*de tomar/i,
      /paré.*el medicamento/i,
      /dejo.*medicamentos/i,
      /interrumpo.*medicamento/i,
      /ya no tomo/i,
    ];
    if (interruptionPatterns.some((p) => p.test(lowerMessage))) {
      return {
        type: 'unguided_interruption',
        severity: 'medium',
        warning: '⚠️ Siempre consulta con tu médico antes de interrumpir un medicamento.',
      };
    }

    // Pattern 5: Symptoms without diagnosis (cannot recommend)
    const symptomPatterns = [
      /me duele.*qué tomo/i,
      /tengo fiebre.*medicamento/i,
      /tengo tos.*qué tomo/i,
      /me siento mal.*qué tomo/i,
      /síntoma.*qué medicamento/i,
      /qué puedo tomar para/i,
    ];
    if (symptomPatterns.some((p) => p.test(lowerMessage))) {
      return {
        type: 'symptom_without_diagnosis',
        severity: 'medium',
        warning: 'No puedo recomendar medicamentos para síntomas sin diagnóstico médico. Consulta a un médico o farmacéutico.',
      };
    }

    // Check if prescription is mentioned (mitigates warnings)
    const prescriptionIndicators = [
      /receta.*doctor/i,
      /me prescribió/i,
      /medicamento.*hospital/i,
      /receta médica/i,
      /doctor.*recetó/i,
      /prescripción/i,
    ];
    if (prescriptionIndicators.some((p) => p.test(lowerMessage))) {
      return null; // No warning if prescription is mentioned
    }

    return null;
  }

  /**
   * Update state machine based on conversation content
   * Uses SmartStateAnalyzer to intelligently determine valid state transitions
   * Can skip states if all required information is provided
   */
  private async updateStateMachineState(
    conversationId: string,
    userMessage: string,
    assistantMessage: string,
    conversationHistory: ChatMessage[] = [],
  ): Promise<{ schedulesGenerated: boolean; proposedTimes: string[] }> {
    const result = { schedulesGenerated: false, proposedTimes: <string[]>[] };
    const convId = conversationId || 'default';
    let context = scheduleStateMachine.getContext(convId);

    if (!context) return result;

    try {
      // If user is asking for schedule, start the flow
      if (context.state === ScheduleState.IDLE) {
        const scheduleKeywords = ['cronograma', 'horario', 'toma de medicamentos', 'frecuencia'];
        if (scheduleKeywords.some((kw) => userMessage.toLowerCase().includes(kw))) {
          scheduleStateMachine.startCollectingMeds(convId);
          context = scheduleStateMachine.getContext(convId)!;
        }
      }

      // Extract medications if in COLLECTING_MEDS or COLLECTING_FREQUENCY state
      if (context.state === ScheduleState.COLLECTING_MEDS || context.state === ScheduleState.COLLECTING_FREQUENCY) {
        const extractedMeds = await this.extractMedicationsFromMessage(userMessage);

        if (extractedMeds.length > 0) {
          console.log('[ChatService] ✓ Extracted', extractedMeds.length, 'medications:');
          extractedMeds.forEach(m => {
            console.log(`  - ${m.name}${m.dosage ? ` ${m.dosage}` : ''}${m.frequency ? ` | ${m.frequency}` : ' (no frequency)'}`);
          });

          // If extracting from COLLECTING_FREQUENCY, merge with existing medications
          let medsToUpdate = extractedMeds;
          if (context.state === ScheduleState.COLLECTING_FREQUENCY && context.medications.length > 0) {
            medsToUpdate = context.medications.map((existing) => {
              const updated = extractedMeds.find((m) => m.name.toLowerCase() === existing.name.toLowerCase());
              return updated || existing;
            });
          }

          // IMPORTANT: Save the extracted medications to the state machine
          scheduleStateMachine.updateMedications(convId, medsToUpdate);
          context = scheduleStateMachine.getContext(convId)!;
          console.log('[ChatService] ✓ Medications saved to state machine');
        } else {
          console.log('[ChatService] ⚠ No medications extracted from message');
        }

        // ALWAYS use LLM State Orchestrator to intelligently orchestrate the entire flow
        // This runs whether we extracted meds or not
        console.log('[ChatService] Using LLM State Orchestrator to orchestrate transitions...');
        const orchestration = await this.stateOrchestrator.orchestrateStateTransition(
          userMessage,
          context.state,
          context.medications,
          conversationHistory.map((m) => ({ role: m.role, content: m.content })),
        );

        console.log('[ChatService] LLM Orchestrator decision:');
        console.log('  Action:', orchestration.action);
        console.log('  Next State:', orchestration.nextState || 'Stay in current');
        console.log('  Reasoning:', orchestration.reasoning);

        // Execute the orchestrator's action
        if (orchestration.nextState) {
          switch (orchestration.nextState) {
            case ScheduleState.COLLECTING_FREQUENCY:
              scheduleStateMachine.proceedToFrequencyCollection(convId);
              console.log('[ChatService] ✓ Transitioned to COLLECTING_FREQUENCY');
              break;
            case ScheduleState.GENERATING_TIMES:
              scheduleStateMachine.proceedToGeneratingTimes(convId);
              console.log('[ChatService] ✓ Transitioned to GENERATING_TIMES');
              // Generate schedule if all info complete
              try {
                const recommendation = await this.generateProposedTimes(context.medications);
                if (recommendation.times.length > 0) {
                  scheduleStateMachine.setProposedTimes(convId, recommendation.times);
                  scheduleStateMachine.setProposedSchedule(convId, recommendation.schedule);
                  result.schedulesGenerated = true;
                  result.proposedTimes = recommendation.times;
                  console.log('[ChatService] ✓ Generated schedule with', recommendation.times.length, 'time slots');
                }
              } catch (scheduleError) {
                console.error('[ChatService] ✗ Failed to generate schedule:', scheduleError);
              }
              break;
          }
        }

        if (extractedMeds.length > 0) {
          // Also use SmartStateAnalyzer for backup analysis when we extracted meds
          console.log('[ChatService] Running backup state analysis...');
          const analysis = await this.stateAnalyzer.analyzeStateTransition(
            userMessage,
            context.state,
            context.medications,
            conversationHistory.map((m) => ({ role: m.role, content: m.content })),
          );

          console.log('[ChatService] SmartStateAnalyzer result:');
          console.log('  hasAllMedications:', analysis.hasAllMedications ? '✓ YES' : '✗ NO');
          console.log('  hasAllFrequencies:', analysis.hasAllFrequencies ? '✓ YES' : '✗ NO');
          console.log('  canSkipStates:', analysis.canSkipStates ? '✓ YES' : '✗ NO');
          console.log('  skipTo:', analysis.skipTo || 'N/A');
          console.log('  confidence:', analysis.confidence + '%');
          console.log('  reasoning:', analysis.reasoning);
          console.log('  currentState:', context.state);
          console.log('  medicationCount:', context.medications.length);

          // If we can skip to a later state, do it
          if (analysis.canSkipStates && analysis.skipTo) {
            console.log(`[ChatService] ✓ Intelligent skip detected: ${context.state} → ${analysis.skipTo}`);

            // Skip to COLLECTING_FREQUENCY if needed
            if (analysis.skipTo === ScheduleState.COLLECTING_FREQUENCY && analysis.hasAllMedications && !analysis.hasAllFrequencies) {
              scheduleStateMachine.proceedToFrequencyCollection(convId);
              console.log('[ChatService] ✓ State transition: COLLECTING_MEDS → COLLECTING_FREQUENCY');
            }
            // Jump directly to GENERATING_TIMES if all info is complete
            else if (analysis.skipTo === ScheduleState.GENERATING_TIMES && analysis.hasAllFrequencies) {
              scheduleStateMachine.proceedToGeneratingTimes(convId);
              console.log('[ChatService] ✓ State transition: COLLECTING_FREQUENCY → GENERATING_TIMES');

              try {
                // Generate proposed schedule using LLM-powered optimizer
                const recommendation = await this.generateProposedTimes(context.medications);
                if (recommendation.times.length > 0) {
                  scheduleStateMachine.setProposedTimes(convId, recommendation.times);
                  scheduleStateMachine.setProposedSchedule(convId, recommendation.schedule);
                  result.schedulesGenerated = true;
                  result.proposedTimes = recommendation.times;
                  console.log('[ChatService] ✓ Generated schedule with', recommendation.times.length, 'time slots');
                } else {
                  console.warn('[ChatService] ✗ Schedule generation returned empty times');
                }
              } catch (scheduleError) {
                console.error('[ChatService] ✗ Failed to generate schedule during skip:', scheduleError);
                // Keep the context in GENERATING_TIMES but without times - will be asked to continue
              }
            } else {
              console.log('[ChatService] ⚠ Skip suggestion received but conditions not met:');
              console.log('  skipTo:', analysis.skipTo);
              console.log('  targetIsFrequency:', analysis.skipTo === ScheduleState.COLLECTING_FREQUENCY);
              console.log('  targetIsGenerating:', analysis.skipTo === ScheduleState.GENERATING_TIMES);
              console.log('  hasAllMeds:', analysis.hasAllMedications);
              console.log('  hasAllFreqs:', analysis.hasAllFrequencies);
              console.log('  currentState:', context.state);
            }
          } else if (analysis.hasAllFrequencies && context.state === ScheduleState.COLLECTING_FREQUENCY) {
            // Normal flow: we're in COLLECTING_FREQUENCY and have all frequencies
            console.log('[ChatService] ✓ All frequencies collected, proceeding to generate schedule...');
            scheduleStateMachine.proceedToGeneratingTimes(convId);

            try {
              // Generate proposed schedule using LLM-powered optimizer
              const recommendation = await this.generateProposedTimes(context.medications);
              if (recommendation.times.length > 0) {
                scheduleStateMachine.setProposedTimes(convId, recommendation.times);
                scheduleStateMachine.setProposedSchedule(convId, recommendation.schedule);
                result.schedulesGenerated = true;
                result.proposedTimes = recommendation.times;
                console.log('[ChatService] ✓ State transition: COLLECTING_FREQUENCY → GENERATING_TIMES');
                console.log('[ChatService] ✓ Schedule generated successfully');
              }
            } catch (scheduleError) {
              console.error('[ChatService] ✗ Failed to generate schedule:', scheduleError);
              // Keep the context in GENERATING_TIMES but without times - will be asked to continue
            }
          } else if (!analysis.hasAllFrequencies && context.state === ScheduleState.COLLECTING_MEDS) {
            // Still collecting medications/frequencies
            if (analysis.hasAllMedications) {
              scheduleStateMachine.proceedToFrequencyCollection(convId);
              console.log('[ChatService] ✓ State transition: COLLECTING_MEDS → COLLECTING_FREQUENCY');
              console.log('[ChatService] All medications collected, waiting for frequencies...');
            } else {
              console.log('[ChatService] ⚠ Waiting for more information (medications/frequencies incomplete)');
            }
          }
        }
      }

      // Handle confirmation in SHOWING_PROPOSAL state
      if (context.state === ScheduleState.SHOWING_PROPOSAL) {
        const lowerMessage = userMessage.toLowerCase();

        // Check for confirmation
        if (/\b(sí|si|ok|bien|perfecto|está bien|me acomodan|acomodan)\b/i.test(lowerMessage)) {
          scheduleStateMachine.confirmTimes(convId);
        }

        // Check for rejection
        if (/\b(no|otro|otros|diferente|nuevamente|otra cosa)\b/i.test(lowerMessage)) {
          scheduleStateMachine.rejectTimes(convId);
        }
      }

      // Handle final confirmation in WAITING_SCHEDULE_CONFIRMATION state
      if (context.state === ScheduleState.WAITING_SCHEDULE_CONFIRMATION) {
        const lowerMessage = userMessage.toLowerCase();

        if (/\b(sí|si|ok|crear|adelante|procede)\b/i.test(lowerMessage)) {
          scheduleStateMachine.proceedToCreation(convId);
        }

        if (/\b(no|espera|esperar|no aún)\b/i.test(lowerMessage)) {
          scheduleStateMachine.rejectTimes(convId);
        }
      }

      context = scheduleStateMachine.getContext(convId);
      if (context) {
        console.log('[ChatService] Final state:');
        console.log('  State:', context.state);
        console.log('  Medications:', context.medications.length, 'collected');
        console.log('  Times:', context.proposedTimes?.length || 0, 'generated');
        console.log('  Summary:', scheduleStateMachine.getStateSummary(convId));
      }
      console.log('[ChatService] ========== END MESSAGE ==========');
    } catch (error) {
      console.warn('[ChatService] Error updating state machine:', error);
    }

    return result;
  }

  /**
   * Generate proposed schedule using LLM-powered medication schedule optimizer
   * Returns both times and full schedule with medication assignments
   * The LLM handles all medication-to-time assignments and interaction prevention
   */
  private async generateProposedTimes(
    medications: MedicationData[],
  ): Promise<{ times: string[]; schedule: Array<{ time: string; medications: Array<{ name: string; dosage: string; notes?: string }> }> }> {
    const startTime = Date.now();
    try {
      console.log('[ChatService] Requesting optimal schedule from medication specialist for', medications.length, 'medications...');

      if (medications.length === 0) {
        throw new Error('No medications provided for schedule generation');
      }

      const recommendation = await medicationScheduleOptimizer.generateOptimalSchedule(medications);

      const elapsed = Date.now() - startTime;
      console.log('[ChatService] ✓ Received schedule recommendation in', elapsed, 'ms');
      console.log('  Times:', recommendation.times.join(', '));
      console.log('  Schedule entries:', recommendation.schedule.length);
      for (const entry of recommendation.schedule) {
        const meds = entry.medications.map(m => `${m.name} ${m.dosage}`).join(' + ');
        console.log(`    ${entry.time} → ${meds}`);
      }
      console.log('  Interactions detected:', recommendation.warnings.length);
      if (recommendation.warnings.length > 0) {
        recommendation.warnings.forEach(w => console.log(`    - ${w}`));
      }
      console.log('  Rationale:', recommendation.rationale.substring(0, 150));

      if (!recommendation.times || recommendation.times.length === 0) {
        throw new Error('Schedule generator returned empty times');
      }

      return {
        times: recommendation.times,
        schedule: recommendation.schedule,
      };
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error('[ChatService] Error generating optimal schedule after', elapsed, 'ms:', error);

      // Fallback: Return empty schedule to indicate failure
      // User will be prompted to ask the system to retry
      console.warn('[ChatService] Falling back to empty schedule - user will be prompted to retry');
      return { times: [], schedule: [] };
    }
  }

  /**
   * Format proposed schedule as a readable calendar message
   * Uses the schedule provided by the LLM optimizer
   *
   * Note: The LLM optimizer handles all medication-to-time assignments
   * and ensures no interactions occur. This method only formats the output.
   */
  private formatScheduleProposal(conversationId: string, medications: MedicationData[], proposedTimes: string[]): string {
    const sortedTimes = [...proposedTimes].sort();

    // Retrieve the full schedule data from state machine
    const context = scheduleStateMachine.getContext(conversationId);
    if (!context || !context.proposedSchedule || context.proposedSchedule.length === 0) {
      // Fallback: simple time list if schedule not available
      let message = '⏰ HORARIOS PROPUESTOS:\n\n';
      for (const time of sortedTimes) {
        message += `${time}\n`;
      }
      message += '\n¿Te acomodan estos horarios? ¿Algún cambio?';
      return message;
    }

    // Format schedule from LLM (which already has optimal spacing and interaction prevention)
    let message = '⏰ HORARIOS RECOMENDADOS:\n\n';

    for (const entry of context.proposedSchedule) {
      if (entry.medications.length > 0) {
        const medList = entry.medications
          .map(m => `${m.name} ${m.dosage}${m.notes ? ` (${m.notes})` : ''}`)
          .join(' + ');
        message += `${entry.time} → ${medList}\n`;
      }
    }

    message += '\n¿Te acomodan estos horarios? ¿Algún cambio?';

    return message;
  }

  /**
   * Convert Spanish frequency text to tool enum format
   * Maps "cada 12h", "2 veces al día", etc. to valid frequency enum values
   */
  private normalizeFrequency(frequencyText: string | undefined): string {
    if (!frequencyText) return 'custom';

    const text = frequencyText.toLowerCase().trim();

    // Match "cada X horas" patterns
    const hoursMatch = text.match(/cada\s+(\d+)\s*h(oras)?/i);
    if (hoursMatch) {
      const hours = parseInt(hoursMatch[1], 10);
      if (hours === 24 || text.match(/una?\s+vez\s+al\s+día/i)) return 'once-daily';
      if (hours === 12 || text.match(/2\s+veces\s+al\s+día/i)) return 'twice-daily';
      if (hours === 8 || text.match(/3\s+veces\s+al\s+día/i)) return 'three-times';
      if (hours === 6 || text.match(/4\s+veces\s+al\s+día/i)) return 'four-times';
      return 'custom';
    }

    // Match "X veces al día" patterns
    if (text.match(/1\s+vez\s+al\s+día|una?\s+vez\s+al\s+día/i)) return 'once-daily';
    if (text.match(/2\s+veces\s+al\s+día/i)) return 'twice-daily';
    if (text.match(/3\s+veces\s+al\s+día/i)) return 'three-times';
    if (text.match(/4\s+veces\s+al\s+día/i)) return 'four-times';

    // Match specific time patterns
    if (text.match(/cada\s+mañana|cada\s+noche|mañana\s+y\s+noche/i)) return 'twice-daily';

    return 'custom';
  }

  /**
   * Convert medications to tool format with normalized frequencies
   */
  private formatMedicationsForTool(medications: MedicationData[]): Array<{
    name: string;
    dosage?: string;
    frequency?: string;
  }> {
    return medications.map((med) => ({
      name: med.name,
      dosage: med.dosage || undefined,
      frequency: this.normalizeFrequency(med.frequency),
    }));
  }

  createMessage(role: 'user' | 'assistant', content: string): ChatMessage {
    return {
      id: generateUUID(),
      role,
      content,
      timestamp: new Date(),
    };
  }
}

export const chatService = new ChatService();
