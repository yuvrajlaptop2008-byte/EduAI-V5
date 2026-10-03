# Notification Engine Specification — Marks App

> **Notification Scope**: In-App Feed, Instant Sonner Toasts, Global Broadcast Banners  
> **Persistence**: Firestore `notifications/{id}` Collection  

---

## 1. Notification Categories & Triggers

| Category | Type Key | Target Role | Trigger Event | Priority |
|---|---|---|---|---|
| **Low Score Alert** | `low_score` | Parent, Student | Student scores `< 40%` on a scheduled group test. | High |
| **Missed Exam Alert** | `missed_test` | Parent, Student | Scheduled test expires without a student submission. | Critical |
| **Attendance Warning** | `attendance` | Parent, Student | Teacher marks student `absent` or `late` in batch register. | High |
| **Teacher Feedback** | `remark` | Parent, Student | Teacher logs remark with `isParentVisible: true`. | Normal |
| **New Test Scheduled**| `homework` | Student | Faculty schedules and publishes a new test for the batch. | Normal |
| **Institute Broadcast**| `announcement` | All | Admin broadcasts maintenance window or exam date notice. | High |

---

## 2. Notification Document Schema & Lifecycle

```typescript
interface InAppNotification {
  id: string;               // Document ID
  userId: string;           // Target recipient UID
  type: "low_score" | "missed_test" | "attendance" | "remark" | "announcement" | "homework";
  title: string;            // Headline e.g. "Attendance Alert: Batch Dropper-A"
  body: string;             // Detailed explanation
  read: boolean;            // Read receipt
  link?: string;            // In-app destination route (e.g. "/parent/attendance")
  createdAt: number;        // Epoch timestamp (ms)
}
```

### Lifecycle Flow:
1. **Creation**: Triggered from service functions (e.g. `attendanceDB.ts`, `remarksDB.ts`).
2. **Real-time Delivery**: Client `NotificationBell` subscribes via Firestore `onSnapshot`:
   ```typescript
   const q = query(
     collection(db, "notifications"),
     where("userId", "==", user.uid),
     where("read", "==", false),
     orderBy("createdAt", "desc")
   );
   ```
3. **Mark as Read**: When user opens the notification drawer or clicks a notification item, document is updated with `{ read: true }`.

---

## 3. Global Platform Broadcast Banners

For global maintenance or urgent alerts affecting all users:
- Configured in Firestore document `platform/config`.
- Listened to by `<PlatformBanner />` mounted at the root of `src/App.tsx`.
- Types:
  - `info`: Blue banner for upcoming updates.
  - `warning`: Amber banner for planned downtime.
  - `alert`: Red banner locking navigation when `maintenanceMode == true`.
