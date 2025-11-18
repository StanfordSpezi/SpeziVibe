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
import { Task, Outcome, SchedulerState } from '@spezivibe/scheduler';
import { QuestionnaireResponse } from '../../questionnaires/types';
import { serializeTask, deserializeTask } from '../utils/task-serialization';
import { removeUndefined } from '../utils/object-utils';

/**
 * Firebase backend implementation for scheduler data storage
 *
 * Authentication is handled separately by AccountService.
 * This backend only manages scheduler-related data (tasks, outcomes, questionnaire responses).
 *
 * Data structure in Firestore:
 * - users/{userId}/tasks/{taskId}
 * - users/{userId}/outcomes/{outcomeId}
 * - users/{userId}/questionnaire-responses/{responseId}
 *
 * To use this backend:
 * 1. Install dependencies: npm install firebase
 * 2. Create a Firebase project at https://console.firebase.google.com
 * 3. Enable Firestore database
 * 4. Configure the backend with your Firebase credentials
 * 5. Call setUserId() when user authenticates/signs out
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
      // Check if Firebase is already initialized
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
      // Load tasks
      const tasksSnapshot = await getDocs(collection(this.db, `users/${this.userId}/tasks`));
      const tasks = tasksSnapshot.docs.map((doc) => deserializeTask(doc.data()));

      // Load outcomes
      const outcomesSnapshot = await getDocs(
        collection(this.db, `users/${this.userId}/outcomes`)
      );
      const outcomes = outcomesSnapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            completedAt: doc.data().completedAt.toDate(),
          }) as Outcome
      );

      return { tasks, outcomes };
    } catch (error) {
      console.error('Failed to load from Firebase:', error);
      return null;
    }
  }

  async saveSchedulerState(state: SchedulerState): Promise<void> {
    // Skip save if not authenticated yet
    if (!this.db || !this.userId) {
      return;
    }

    // Note: This saves the entire state. For production, you'd want
    // to sync incrementally (only changed items)
    try {
      // Save tasks
      for (const task of state.tasks) {
        await setDoc(doc(this.db, `users/${this.userId}/tasks`, task.id), removeUndefined(serializeTask(task)));
      }

      // Save outcomes
      for (const outcome of state.outcomes) {
        const serialized = removeUndefined(outcome);
        await setDoc(doc(this.db, `users/${this.userId}/outcomes`, outcome.id), serialized);
      }
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
      throw error;
    }
  }

  async createTask(task: Task): Promise<Task> {
    // Skip save if not authenticated yet - task will sync after login
    if (!this.db || !this.userId) {
      return task;
    }

    await setDoc(doc(this.db, `users/${this.userId}/tasks`, task.id), removeUndefined(serializeTask(task)));
    return task;
  }

  async updateTask(task: Task): Promise<Task> {
    return this.createTask(task); // Firestore setDoc handles both create and update
  }

  async deleteTask(taskId: string): Promise<void> {
    // Skip if not authenticated yet
    if (!this.db || !this.userId) {
      return;
    }

    await deleteDoc(doc(this.db, `users/${this.userId}/tasks`, taskId));

    // Delete associated outcomes
    const outcomesSnapshot = await getDocs(
      query(
        collection(this.db, `users/${this.userId}/outcomes`),
        where('id', '>=', taskId),
        where('id', '<', taskId + '\uf8ff')
      )
    );

    for (const outcomeDoc of outcomesSnapshot.docs) {
      await deleteDoc(outcomeDoc.ref);
    }
  }

  async getTasks(): Promise<Task[]> {
    if (!this.db || !this.userId) return [];

    const snapshot = await getDocs(collection(this.db, `users/${this.userId}/tasks`));
    return snapshot.docs.map((doc) => deserializeTask(doc.data()));
  }

  async createOutcome(outcome: Outcome): Promise<Outcome> {
    // Skip save if not authenticated yet - outcome will sync after login
    if (!this.db || !this.userId) {
      return outcome;
    }

    // Remove undefined values before saving
    const serialized = removeUndefined(outcome);
    await setDoc(doc(this.db, `users/${this.userId}/outcomes`, outcome.id), serialized);
    return outcome;
  }

  async getOutcomes(): Promise<Outcome[]> {
    if (!this.db || !this.userId) return [];

    const snapshot = await getDocs(collection(this.db, `users/${this.userId}/outcomes`));
    return snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          completedAt: doc.data().completedAt.toDate(),
        }) as Outcome
    );
  }

  async saveQuestionnaireResponse(response: QuestionnaireResponse): Promise<void> {
    // Skip save if not authenticated yet
    if (!this.db || !this.userId) {
      return;
    }

    const responseId = response.id || `qr-${Date.now()}`;
    // Remove undefined values before saving
    const serialized = removeUndefined(response);
    await setDoc(
      doc(this.db, `users/${this.userId}/questionnaire-responses`, responseId),
      serialized
    );
  }

  async getQuestionnaireResponses(taskId?: string): Promise<QuestionnaireResponse[]> {
    if (!this.db || !this.userId) return [];

    const collectionRef = collection(this.db, `users/${this.userId}/questionnaire-responses`);
    // Note: taskId filtering would require storing responses with metadata in a wrapper
    // For now, return all responses and filter client-side if needed
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => doc.data() as QuestionnaireResponse);
  }

  async syncToRemote(): Promise<void> {
    // Already syncing in real-time with Firestore
  }

  async syncFromRemote(): Promise<void> {
    // Already syncing in real-time with Firestore
  }
}
