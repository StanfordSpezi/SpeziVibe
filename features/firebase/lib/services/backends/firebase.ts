import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Firestore,
} from 'firebase/firestore';
import { BackendService, BackendConfig } from '../types';

// Type stubs - actual types come from scheduler/questionnaire if installed
type Task = { id: string; [key: string]: unknown };
type Outcome = { id: string; completedAt: Date; [key: string]: unknown };
type SchedulerState = { tasks: Task[]; outcomes: Outcome[] };
type QuestionnaireResponse = { id?: string; [key: string]: unknown };

/**
 * Firebase backend implementation for data storage
 *
 * Authentication is handled separately by AccountService.
 * This backend manages data (tasks, outcomes, questionnaire responses).
 */
export class FirebaseBackend implements BackendService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private userId: string | null = null;

  constructor(private config: BackendConfig) {
    if (!config.firebase) {
      throw new Error('Firebase configuration is required');
    }
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  async initialize(): Promise<void> {
    try {
      if (getApps().length === 0) {
        this.app = initializeApp(this.config.firebase!);
      } else {
        this.app = getApps()[0];
      }
      this.db = getFirestore(this.app);
    } catch (error) {
      console.error('[Firebase] Initialization error:', error);
      throw error;
    }
  }

  async loadSchedulerState(): Promise<SchedulerState | null> {
    if (!this.db || !this.userId) return null;

    try {
      const tasksSnapshot = await getDocs(collection(this.db, `users/${this.userId}/tasks`));
      const tasks = tasksSnapshot.docs.map((doc) => doc.data() as Task);

      const outcomesSnapshot = await getDocs(collection(this.db, `users/${this.userId}/outcomes`));
      const outcomes = outcomesSnapshot.docs.map((doc) => ({
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate?.() || new Date(),
      }) as Outcome);

      return { tasks, outcomes };
    } catch (error) {
      console.error('Failed to load from Firebase:', error);
      return null;
    }
  }

  async saveSchedulerState(state: SchedulerState): Promise<void> {
    if (!this.db || !this.userId) return;

    try {
      for (const task of state.tasks) {
        await setDoc(doc(this.db, `users/${this.userId}/tasks`, task.id), task);
      }
      for (const outcome of state.outcomes) {
        await setDoc(doc(this.db, `users/${this.userId}/outcomes`, outcome.id), outcome);
      }
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
      throw error;
    }
  }

  async createTask(task: Task): Promise<Task> {
    if (!this.db || !this.userId) return task;
    await setDoc(doc(this.db, `users/${this.userId}/tasks`, task.id), task);
    return task;
  }

  async updateTask(task: Task): Promise<Task> {
    return this.createTask(task);
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!this.db || !this.userId) return;
    await deleteDoc(doc(this.db, `users/${this.userId}/tasks`, taskId));
  }

  async getTasks(): Promise<Task[]> {
    if (!this.db || !this.userId) return [];
    const snapshot = await getDocs(collection(this.db, `users/${this.userId}/tasks`));
    return snapshot.docs.map((doc) => doc.data() as Task);
  }

  async createOutcome(outcome: Outcome): Promise<Outcome> {
    if (!this.db || !this.userId) return outcome;
    await setDoc(doc(this.db, `users/${this.userId}/outcomes`, outcome.id), outcome);
    return outcome;
  }

  async getOutcomes(): Promise<Outcome[]> {
    if (!this.db || !this.userId) return [];
    const snapshot = await getDocs(collection(this.db, `users/${this.userId}/outcomes`));
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate?.() || new Date(),
    }) as Outcome);
  }

  async saveQuestionnaireResponse(response: QuestionnaireResponse): Promise<void> {
    if (!this.db || !this.userId) return;
    const responseId = response.id || `qr-${Date.now()}`;
    await setDoc(doc(this.db, `users/${this.userId}/questionnaire-responses`, responseId), response);
  }

  async getQuestionnaireResponses(): Promise<QuestionnaireResponse[]> {
    if (!this.db || !this.userId) return [];
    const snapshot = await getDocs(collection(this.db, `users/${this.userId}/questionnaire-responses`));
    return snapshot.docs.map((doc) => doc.data() as QuestionnaireResponse);
  }

  async syncToRemote(): Promise<void> {}
  async syncFromRemote(): Promise<void> {}
}
