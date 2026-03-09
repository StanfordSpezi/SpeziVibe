/**
 * Firebase Firestore audit logging implementation
 *
 * Writes audit events to an `audit_log` collection.
 * The collection should have admin-only read access via Firestore rules.
 */

import type { AuditEvent, AuditQueryFilters, AuditService } from '../types';

export class FirebaseAuditService implements AuditService {
  private collectionName: string;
  private firestore: any; // firebase/firestore instance

  constructor(firestore: any, collectionName = 'audit_log') {
    this.firestore = firestore;
    this.collectionName = collectionName;
  }

  async log(event: AuditEvent): Promise<void> {
    const { collection, addDoc } = await import('firebase/firestore');
    const colRef = collection(this.firestore, this.collectionName);
    await addDoc(colRef, {
      ...event,
      _createdAt: new Date().toISOString(),
    });
  }

  async query(filters: AuditQueryFilters): Promise<AuditEvent[]> {
    const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    const colRef = collection(this.firestore, this.collectionName);

    const constraints: any[] = [];

    if (filters.userId) {
      constraints.push(where('userId', '==', filters.userId));
    }
    if (filters.action) {
      constraints.push(where('action', '==', filters.action));
    }
    if (filters.resource) {
      constraints.push(where('resource', '==', filters.resource));
    }

    constraints.push(orderBy('timestamp', 'desc'));

    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }

    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc: any) => doc.data() as AuditEvent);
  }
}
