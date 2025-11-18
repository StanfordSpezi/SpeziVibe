import { Task } from '@spezivibe/scheduler';

/**
 * Serialize a task for storage (converts Dates to ISO strings)
 */
export function serializeTask(task: Task): any {
  const serialized: any = {
    ...task,
    createdAt: task.createdAt.toISOString(),
    effectiveFrom: task.effectiveFrom.toISOString(),
    schedule: {
      ...task.schedule,
      startDate: task.schedule.startDate.toISOString(),
      recurrence:
        task.schedule.recurrence.type === 'once'
          ? {
              ...task.schedule.recurrence,
              date: task.schedule.recurrence.date.toISOString(),
            }
          : task.schedule.recurrence,
    },
  };

  // Only include endDate if it exists
  if (task.schedule.endDate) {
    serialized.schedule.endDate = task.schedule.endDate.toISOString();
  }

  return serialized;
}

/**
 * Deserialize a task from storage (converts ISO strings to Dates)
 */
export function deserializeTask(data: any): Task {
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
