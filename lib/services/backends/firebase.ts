import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  Auth,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Firestore,
} from 'firebase/firestore';
import { BackendService, BackendConfig } from '../types';
import { Task, Outcome, SchedulerState } from '../../scheduler/types';
import { QuestionnaireResponse } from '../../questionnaires/types';

/**
 * Firebase backend implementation
 *
 * Data structure in Firestore:
 * - users/{userId}/tasks/{taskId}
 * - users/{userId}/outcomes/{outcomeId}
 * - users/{userId}/questionnaire-responses/{responseId}
 *
 * To use this backend:
 * 1. Install dependencies: npm install firebase
 * 2. Create a Firebase project at https://console.firebase.google.com
 * 3. Enable Authentication (Email/Password) and Firestore
 * 4. Configure the backend with your Firebase credentials
 */
export class FirebaseBackend implements BackendService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private userId: string | null = null;

  constructor(private config: BackendConfig) {
    if (!config.firebase) {
      throw new Error('Firebase configuration is required');
    }
  }

  async initialize(): Promise<void> {
    this.app = initializeApp(this.config.firebase!);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);

    // Listen for auth state changes
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth!, (user) => {
        this.userId = user?.uid || null;
        resolve();
      });
    });
  }

  async isAuthenticated(): Promise<boolean> {
    return this.userId !== null;
  }

  async login(credentials: { email: string; password: string }): Promise<void> {
    if (!this.auth) throw new Error('Firebase not initialized');

    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      credentials.email,
      credentials.password
    );
    this.userId = userCredential.user.uid;
  }

  async logout(): Promise<void> {
    if (!this.auth) throw new Error('Firebase not initialized');
    await signOut(this.auth);
    this.userId = null;
  }

  async loadSchedulerState(): Promise<SchedulerState | null> {
    if (!this.db || !this.userId) return null;

    try {
      // Load tasks
      const tasksSnapshot = await getDocs(collection(this.db, `users/${this.userId}/tasks`));
      const tasks = tasksSnapshot.docs.map((doc) => this.deserializeTask(doc.data()));

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
    if (!this.db || !this.userId) throw new Error('Not authenticated');

    // Note: This saves the entire state. For production, you'd want
    // to sync incrementally (only changed items)
    try {
      // Save tasks
      for (const task of state.tasks) {
        await setDoc(doc(this.db, `users/${this.userId}/tasks`, task.id), this.serializeTask(task));
      }

      // Save outcomes
      for (const outcome of state.outcomes) {
        await setDoc(doc(this.db, `users/${this.userId}/outcomes`, outcome.id), outcome);
      }
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
      throw error;
    }
  }

  async createTask(task: Task): Promise<Task> {
    if (!this.db || !this.userId) throw new Error('Not authenticated');

    await setDoc(doc(this.db, `users/${this.userId}/tasks`, task.id), this.serializeTask(task));
    return task;
  }

  async updateTask(task: Task): Promise<Task> {
    return this.createTask(task); // Firestore setDoc handles both create and update
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!this.db || !this.userId) throw new Error('Not authenticated');

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
    return snapshot.docs.map((doc) => this.deserializeTask(doc.data()));
  }

  async createOutcome(outcome: Outcome): Promise<Outcome> {
    if (!this.db || !this.userId) throw new Error('Not authenticated');

    await setDoc(doc(this.db, `users/${this.userId}/outcomes`, outcome.id), outcome);
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
    if (!this.db || !this.userId) throw new Error('Not authenticated');

    const responseId = `${response.taskId}-${Date.now()}`;
    await setDoc(
      doc(this.db, `users/${this.userId}/questionnaire-responses`, responseId),
      response
    );
  }

  async getQuestionnaireResponses(taskId?: string): Promise<QuestionnaireResponse[]> {
    if (!this.db || !this.userId) return [];

    const collectionRef = collection(this.db, `users/${this.userId}/questionnaire-responses`);
    const q = taskId ? query(collectionRef, where('taskId', '==', taskId)) : collectionRef;

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          completedAt: doc.data().completedAt.toDate(),
        }) as QuestionnaireResponse
    );
  }

  async syncToRemote(): Promise<void> {
    // Already syncing in real-time with Firestore
  }

  async syncFromRemote(): Promise<void> {
    // Already syncing in real-time with Firestore
  }

  private serializeTask(task: Task): any {
    return {
      ...task,
      createdAt: task.createdAt.toISOString(),
      effectiveFrom: task.effectiveFrom.toISOString(),
      schedule: {
        ...task.schedule,
        startDate: task.schedule.startDate.toISOString(),
        endDate: task.schedule.endDate?.toISOString(),
        recurrence:
          task.schedule.recurrence.type === 'once'
            ? {
                ...task.schedule.recurrence,
                date: task.schedule.recurrence.date.toISOString(),
              }
            : task.schedule.recurrence,
      },
    };
  }

  private deserializeTask(data: any): Task {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      effectiveFrom: new Date(data.effectiveFrom),
      schedule: {
        ...data.schedule,
        startDate: new Date(data.schedule.startDate),
        endDate: data.schedule.endDate ? new Date(data.schedule.endDate) : undefined,
        recurrence:
          data.schedule.recurrence.type === 'once'
            ? {
                ...data.schedule.recurrence,
                date: new Date(data.schedule.recurrence.date),
              }
            : data.schedule.recurrence,
      },
    };
  }
}
