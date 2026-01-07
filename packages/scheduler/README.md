# @spezivibe/scheduler

A comprehensive scheduling and task management package for React Native applications, inspired by Stanford Spezi's SpeziScheduler.

## Features

✅ **Complete Schedule Management** - Ready-to-use `ScheduleView` component with calendar, event list, and interactions
✅ **Flexible Recurrence** - Daily, weekly, custom intervals, and one-time events
✅ **Completion Policies** - Time windows or anytime completion
✅ **Local Storage** - Automatic persistence with AsyncStorage
✅ **Reactive Updates** - Real-time UI updates when tasks change
✅ **Themeable** - Built-in light/dark themes with customization
✅ **TypeScript** - Full type safety

## Installation

```bash
npm install @spezivibe/scheduler
# or
yarn add @spezivibe/scheduler
```

**Peer Dependencies:**
```bash
npm install react react-native @react-native-async-storage/async-storage
```

## Quick Start

### 1. Wrap Your App with SchedulerProvider

```tsx
import { SchedulerProvider } from '@spezivibe/scheduler';

export default function App() {
  return (
    <SchedulerProvider>
      <YourApp />
    </SchedulerProvider>
  );
}
```

### 2. Use the ScheduleView Component

```tsx
import { ScheduleView } from '@spezivibe/scheduler';
import { useColorScheme } from 'react-native';

export default function ScheduleScreen() {
  const colorScheme = useColorScheme();

  return (
    <ScheduleView
      isDark={colorScheme === 'dark'}
    />
  );
}
```

That's it! You have a fully functional schedule screen.

## Complete Example with Customization

```tsx
import { ScheduleView, Event } from '@spezivibe/scheduler';
import { useColorScheme, View, Text } from 'react-native';
import { router } from 'expo-router';

export default function ScheduleScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleQuestionnaireOpen = async (event: Event) => {
    if (event.task.questionnaireId) {
      router.push({
        pathname: '/questionnaire/[id]',
        params: {
          id: event.task.questionnaireId,
          taskId: event.task.id,
          eventId: event.occurrence.index.toString(),
        },
      });
    }
  };

  return (
    <ScheduleView
      isDark={isDark}
      onQuestionnaireOpen={handleQuestionnaireOpen}
      renderHeader={() => (
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold' }}>
            My Schedule
          </Text>
        </View>
      )}
    />
  );
}
```

## Adding Tasks

### Basic Task Creation

```tsx
import { useScheduler } from '@spezivibe/scheduler';

function MyComponent() {
  const { scheduler } = useScheduler();

  const addTask = async () => {
    if (!scheduler) return;

    await scheduler.createOrUpdateTask({
      id: 'morning-wellness',
      title: 'Morning Wellness Check',
      instructions: 'Complete your daily wellness assessment',
      category: 'questionnaire',
      questionnaireId: 'wellness-daily',
      schedule: {
        startDate: new Date(),
        recurrence: {
          type: 'daily',
          hour: 8,
          minute: 30,
        },
      },
      completionPolicy: {
        type: 'window',
        start: 0,
        end: 180, // 3 hours
      },
    });
  };

  return <Button onPress={addTask}>Add Morning Task</Button>;
}
```

## Schedule Types

### Daily Recurring

```tsx
schedule: {
  startDate: new Date(),
  recurrence: {
    type: 'daily',
    hour: 9,
    minute: 30,
  },
}
```

### Weekly Recurring

```tsx
schedule: {
  startDate: new Date(),
  recurrence: {
    type: 'weekly',
    weekday: 1, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    hour: 14,
    minute: 0,
  },
}
```

### Monthly Recurring

```tsx
schedule: {
  startDate: new Date(),
  recurrence: {
    type: 'monthly',
    day: 15, // Day of month (1-31)
    hour: 12,
    minute: 0,
  },
}
```

### One-Time Event

```tsx
schedule: {
  startDate: new Date(),
  recurrence: {
    type: 'once',
    date: new Date('2024-12-25T10:00:00'),
  },
}
```

### With End Date

```tsx
schedule: {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'), // Task expires at end of year
  recurrence: {
    type: 'daily',
    hour: 9,
    minute: 0,
  },
}
```

## Completion Policies

### Anytime Completion

User can complete the task at any time:

```tsx
completionPolicy: {
  type: 'anytime',
}
```

### Time Window

User can only complete within a specific time window:

```tsx
completionPolicy: {
  type: 'window',
  start: 0,     // minutes before scheduled time
  end: 180,     // minutes after scheduled time (3 hours)
}
```

## Task Categories

- `'task'` - Generic task
- `'questionnaire'` - Opens a questionnaire (requires `questionnaireId`)
- `'measurement'` - Health measurement task
- `'reminder'` - Simple reminder

## API Reference

### Scheduler Methods

```tsx
const { scheduler, tasks } = useScheduler();

// Create or update a task
await scheduler.createOrUpdateTask(task);

// Get all tasks
const tasks = scheduler.getTasks();

// Get a specific task
const task = scheduler.getTask('task-id');

// Delete a task
await scheduler.deleteTask('task-id');

// Clear all tasks
await scheduler.clearAll();

// Query events for a date range
const events = scheduler.queryEvents(startDate, endDate);

// Complete an event
await scheduler.completeEvent(event);

// Uncomplete an event
await scheduler.uncompleteEvent(event);
```

### ScheduleView Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isDark` | `boolean` | `false` | Enable dark theme |
| `theme` | `SchedulerUITheme` | - | Custom theme object |
| `onQuestionnaireOpen` | `(event: Event) => void` | - | Handle questionnaire tasks |
| `onEventPress` | `(event: Event) => void` | - | Override default event press |
| `renderHeader` | `() => ReactNode` | - | Custom header component |
| `headerContent` | `ReactNode` | - | Content above calendar |
| `subHeaderContent` | `ReactNode` | - | Content below date info |
| `textColor` | `string` | - | Date label text color |
| `mutedTextColor` | `string` | - | Completion text color |
| `refreshKey` | `number` | - | Force refresh (increment) |
| `style` | `ViewStyle` | - | Container style |

### Individual Components

If you need more control, you can use individual components:

```tsx
import {
  CalendarStrip,
  EventList,
  EventCard,
  useScheduleScreen,
} from '@spezivibe/scheduler';

function CustomSchedule() {
  const { scheduler, tasks } = useScheduler();
  const {
    selectedDate,
    setSelectedDate,
    events,
    completedCount,
    totalCount,
  } = useScheduleScreen({ scheduler, tasks });

  return (
    <>
      <CalendarStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <Text>{completedCount} of {totalCount} completed</Text>
      <EventList events={events} />
    </>
  );
}
```

## Utilities

### Date Formatting

```tsx
import {
  getDateLabel,
  getRelativeDateLabel,
  formatTime,
} from '@spezivibe/scheduler';

getDateLabel(new Date()); // "Today" or "Monday, January 1"
getRelativeDateLabel(new Date()); // "Today", "Tomorrow", "Yesterday"
formatTime(new Date()); // "2:30 PM"
```

### Completion Check

```tsx
import { isAllowedToComplete } from '@spezivibe/scheduler';

const canComplete = isAllowedToComplete(event);
```

## Theming

### Using Built-in Themes

```tsx
import { ScheduleView, defaultLightTheme, defaultDarkTheme } from '@spezivibe/scheduler';

<ScheduleView theme={defaultDarkTheme} />
```

### Custom Theme

```tsx
import { ScheduleView, SchedulerUITheme } from '@spezivibe/scheduler';

const myTheme: SchedulerUITheme = {
  colors: {
    background: '#000000',
    cardBackground: '#1a1a1a',
    cardBorder: '#333333',
    cardPressed: '#2a2a2a',
    primary: '#007AFF',
    border: '#333333',
    primaryText: '#ffffff',
    secondaryText: '#999999',
    mutedText: '#666666',
    accentText: '#007AFF',
    // ... other colors
  },
};

<ScheduleView theme={myTheme} />
```

## Testing

```bash
npm test
```

## Sample Data

Load sample tasks for testing:

```tsx
import { createSampleTasks } from '@spezivibe/scheduler';

const loadSamples = async () => {
  const samples = createSampleTasks();
  for (const task of samples) {
    await scheduler.createOrUpdateTask(task);
  }
};
```

## TypeScript

Full TypeScript support with exported types:

```tsx
import type {
  Task,
  Event,
  Schedule,
  Outcome,
  AllowedCompletionPolicy,
  RecurrenceRule,
  TaskCategory,
  SchedulerUITheme,
} from '@spezivibe/scheduler';
```

## License

MIT

## Credits

Inspired by [Stanford Spezi's SpeziScheduler](https://github.com/StanfordSpezi/SpeziScheduler)
