
## Add Waitlist Link to Main Page

Add a visible call-to-action button on the main page that directs users to the `/waitlist` page.

### Changes

**1. Header component (`src/components/Header.tsx`)**
- Add a "Lista de espera" button next to the Dashboard button in the header navigation
- Use the `Users` icon from lucide-react to visually distinguish it
- Apply the Mexican gradient text style consistent with the existing Dashboard button
- Link it to `/waitlist` using the existing `navigate` function

### Technical Details

- Add a new `Button` with `variant="ghost"` and `size="sm"` between the Dashboard button and the Connect Wallet button
- Use `onClick={() => navigate("/waitlist")}` for navigation
- Highlight the button when the user is on `/waitlist` by checking `location.pathname === "/waitlist"` (same pattern used for the Dashboard button)
- Use the `Users` icon with `text-mexican-green` styling to match the existing design
