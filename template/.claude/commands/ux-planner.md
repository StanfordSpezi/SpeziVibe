# UX Planner

Plan user experience flows for digital health apps.

## When to Use

Invoke `/ux-planner` when you need to:
- Design user journeys for patients
- Plan onboarding flows
- Structure health tracking workflows
- Design engagement and notification strategies

## Core User Flows

### 1. Onboarding Flow

```
App Launch
    │
    ▼
┌─────────────┐
│  Welcome    │
│  Screen     │
└─────────────┘
    │
    ▼
┌─────────────┐
│  Sign Up /  │
│  Sign In    │
└─────────────┘
    │
    ▼
┌─────────────┐
│  Consent    │◄── Required for studies
│  Screen     │
└─────────────┘
    │
    ▼
┌─────────────┐
│  Profile    │◄── Name, DOB, etc.
│  Setup      │
└─────────────┘
    │
    ▼
┌─────────────┐
│  HealthKit  │◄── iOS only
│  Permission │
└─────────────┘
    │
    ▼
┌─────────────┐
│  Tutorial   │◄── Optional
│  / Guide    │
└─────────────┘
    │
    ▼
┌─────────────┐
│   Home      │
│   Screen    │
└─────────────┘
```

### 2. Daily Engagement Flow

```
Push Notification
    │
    ▼
┌─────────────┐
│  Open App   │
└─────────────┘
    │
    ▼
┌─────────────┐
│  Today's    │
│  Tasks      │
└─────────────┘
    │
    ├──────────────────┐
    ▼                  ▼
┌─────────────┐  ┌─────────────┐
│ Questionnaire│  │ Health Data │
│    Task     │  │   Review    │
└─────────────┘  └─────────────┘
    │                  │
    ▼                  ▼
┌─────────────┐  ┌─────────────┐
│  Complete   │  │   Trends    │
│  Feedback   │  │   & Stats   │
└─────────────┘  └─────────────┘
```

### 3. Questionnaire Flow

```
Task Card Tap
    │
    ▼
┌─────────────┐
│  Question 1 │
│  [Progress] │
└─────────────┘
    │
    ▼
┌─────────────┐
│  Question 2 │◄── Conditional logic
│  [Progress] │    may skip questions
└─────────────┘
    │
    ▼
┌─────────────┐
│  Question N │
│  [Progress] │
└─────────────┘
    │
    ▼
┌─────────────┐
│   Review    │◄── Optional review
│   Answers   │    before submit
└─────────────┘
    │
    ▼
┌─────────────┐
│  Complete!  │
│  [Return]   │
└─────────────┘
```

## Screen Templates

### Home Screen

```typescript
interface HomeScreenLayout {
  header: {
    greeting: string;        // "Good morning, Sarah"
    date: string;            // "Monday, January 15"
  };

  todaysTasks: {
    completed: number;
    total: number;
    tasks: TaskCard[];
  };

  healthSnapshot: {
    metrics: HealthMetric[]; // Steps, heart rate, etc.
    trend: 'up' | 'down' | 'stable';
  };

  quickActions: {
    logSymptom: () => void;
    viewHistory: () => void;
    contactSupport: () => void;
  };
}
```

### Task Card

```typescript
interface TaskCard {
  title: string;
  category: 'questionnaire' | 'measurement' | 'medication';
  estimatedTime: string;     // "2 min"
  dueTime?: string;          // "Due by 10:00 AM"
  status: 'pending' | 'completed' | 'overdue';
  icon: string;
  onPress: () => void;
}
```

### Health Dashboard

```typescript
interface HealthDashboard {
  timeRange: '7d' | '30d' | '90d' | 'all';

  metrics: {
    primary: HealthChart;    // Main metric (e.g., steps)
    secondary: HealthChart[];// Supporting metrics
  };

  insights: {
    title: string;
    description: string;
    trend: 'positive' | 'negative' | 'neutral';
  }[];

  exportData: () => void;
}
```

## Engagement Strategies

### Notification Schedule

```typescript
const notificationStrategy = {
  taskReminders: {
    timing: 'At scheduled time',
    fallback: '2 hours before window closes',
    message: "Time for your daily check-in",
  },

  streakMaintenance: {
    timing: 'Evening if no activity',
    message: "Keep your 5-day streak going!",
  },

  weeklyDigest: {
    timing: 'Sunday 10:00 AM',
    message: "See your weekly health summary",
  },

  milestones: {
    trigger: 'On achievement',
    message: "You completed 30 days of tracking!",
  },
};
```

### Gamification Elements

```typescript
interface GamificationFeatures {
  streaks: {
    currentStreak: number;
    longestStreak: number;
    display: 'flame' | 'calendar' | 'counter';
  };

  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
  }[];

  progress: {
    studyCompletion: number;  // 0-100%
    weeklyGoal: number;       // Tasks completed
    totalContributions: number;
  };
}
```

## Accessibility Considerations

```typescript
const accessibilityChecklist = {
  visual: [
    'Text size adjustable (Dynamic Type)',
    'Color contrast meets WCAG AA (4.5:1)',
    'Images have alt text',
    'Icons have labels',
  ],

  motor: [
    'Touch targets minimum 44x44pt',
    'No time-limited interactions',
    'Gesture alternatives available',
  ],

  cognitive: [
    'Clear, simple language',
    'Progress indicators',
    'Confirmation dialogs for actions',
    'Undo capability where possible',
  ],

  technical: [
    'VoiceOver support',
    'Reduced motion option',
    'High contrast mode',
  ],
};
```

## Error States

```typescript
const errorStates = {
  networkError: {
    title: "Can't connect",
    message: "Check your internet connection and try again.",
    action: "Retry",
    offlineMode: true,
  },

  syncError: {
    title: "Sync failed",
    message: "Your data is saved locally. We'll sync when connected.",
    action: "Try again",
  },

  authError: {
    title: "Session expired",
    message: "Please sign in again to continue.",
    action: "Sign in",
  },

  validationError: {
    title: "Please check your input",
    message: "[Specific field error]",
    action: "Fix",
  },
};
```

## Empty States

```typescript
const emptyStates = {
  noTasks: {
    icon: 'checkmark.circle',
    title: "All caught up!",
    message: "No tasks for today. Check back tomorrow.",
  },

  noHealthData: {
    icon: 'heart',
    title: "No health data yet",
    message: "Connect Apple Health to see your metrics here.",
    action: "Connect Health",
  },

  noHistory: {
    icon: 'clock',
    title: "No history yet",
    message: "Complete tasks to see your progress over time.",
  },
};
```

## Checklist

- [ ] Onboarding flow designed
- [ ] Core user journeys mapped
- [ ] Screen layouts defined
- [ ] Navigation structure planned
- [ ] Notification strategy set
- [ ] Engagement features planned
- [ ] Error states designed
- [ ] Empty states designed
- [ ] Accessibility requirements met
- [ ] Loading states defined
