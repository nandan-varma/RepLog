---
applyTo: '**'
---

This is a React Native project using TypeScript and Tailwind CSS.

avoid these errors as they are common in this project:
- Warning: Text strings must be rendered within a <Text> component.
- Warning: Each child in a list should have a unique "key" prop.
- (NOBRIDGE) ERROR  Warning: ReanimatedError: [Reanimated] Interpolation input and output ranges should contain at least two values.
- ERROR  Warning: Error: React.Children.only expected to receive a single React element child.

use animations from `react-native-reanimated` library
default animations would be to animate in from left and out to right

everything should work on both iOS and Android

use UI components from the `components/ui` folder for all UI elements
available components are:
accordion.tsx
alert-dialog.tsx
alert.tsx
aspect-ratio.tsx
avatar.tsx
badge.tsx
button.tsx
card.tsx
checkbox.tsx
collapsible.tsx
context-menu.tsx
dialog.tsx
dropdown-menu.tsx
hover-card.tsx
input.tsx
label.tsx
menubar.tsx
navigation-menu.tsx
popover.tsx
progress.tsx
radio-group.tsx
select.tsx
separator.tsx
skeleton.tsx
switch.tsx
table.tsx
tabs.tsx
text.tsx
textarea.tsx
toggle-group.tsx
toggle.tsx
tooltip.tsx
