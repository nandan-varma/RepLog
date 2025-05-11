---
applyTo: '**'
---

prefer simple implementations over complex ones

prefer creating components over implementing features in the page

extract services and components into their own files

dont use null and undefined values unless necessary

dont implement types and interfaces unless necessary

```
import { relations, type InferSelectModel } from "drizzle-orm"
// Interface for workout log entry
export type WorkoutLog = InferSelectModel<typeof workouts>;
```
to infer types from database schema.

use advanced typescript features. you can use `typeof` and `keyof` to create more precise types.

avoid these errors as they are common in this project:
- Warning: Text strings must be rendered within a <Text> component.
- Warning: Each child in a list should have a unique "key" prop.
