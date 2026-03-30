# Feature Specification: Personal Finance Management Web App

**Feature Branch**: `001-personal-finance-web-app`  
**Created**: 2026-03-30  
**Status**: Draft  
**Input**: User description: "Trang web quản lý tài chính cá nhân với responsive cho mobile, giao diện render bằng markdown. Các trang: sign up, login, home, import, setting."

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Account Registration & Login (Priority: P1)

A new user visits the application for the first time and creates an account using their
email address and a password. On subsequent visits they log in with the same credentials
and are taken directly to the Home page.

**Why this priority**: Without authentication, no other page is accessible. This is the
entry gate for all other functionality.

**Independent Test**: Can be tested end-to-end by (1) completing Sign Up, (2) logging
out, (3) logging back in — and verifying the user reaches the Home page with their
session active. Delivers a viable, authenticated shell of the application.

**Acceptance Scenarios**:

1. **Given** a visitor on the Sign Up page, **When** they submit a valid email and a
   password that meets strength rules, **Then** their account is created and they are
   redirected to the Home page as an authenticated user.
2. **Given** a visitor on the Sign Up page, **When** they submit an email already
   registered, **Then** an error message informs them the email is taken and no account
   is created.
3. **Given** a visitor on the Sign Up page, **When** they submit a password that does
   not meet strength requirements, **Then** inline validation highlights the issue before
   submission.
4. **Given** a registered user on the Login page, **When** they enter correct credentials,
   **Then** they are authenticated and redirected to the Home page.
5. **Given** a registered user on the Login page, **When** they enter incorrect credentials,
   **Then** a generic error message is shown (no hint whether email or password is wrong)
   and they remain on the Login page.
6. **Given** an authenticated user, **When** they navigate to the Login or Sign Up page
   directly, **Then** they are redirected to the Home page instead.

---

### User Story 2 — Manage Transactions (Import Page) (Priority: P2)

An authenticated user records new income or expense entries, edits existing ones, and
removes incorrect entries. After each action the transaction list updates immediately to
reflect the change.

**Why this priority**: Transaction management is the core value of the application; all
reports depend on this data. Without it, the Home dashboard has nothing to display.

**Independent Test**: Can be tested by adding at least one income entry and one expense
entry, then editing one and deleting another — verifying the list reflects all changes
without a full page reload.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the Import page, **When** they click the **Add**
   button, **Then** a modal popup appears with fields: Date (calendar picker, defaults
   to today), Note (text input, required), Amount (numeric input, required), Type
   (dropdown: Income / Expense, required), Category (dropdown filtered by Type, required),
   and buttons Cancel and Save.
2. **Given** the Add popup is open with all required fields filled, **When** the user
   clicks **Save**, **Then** the new transaction is persisted, the popup closes, and the
   transaction list updates to include the new entry in its correct date group.
3. **Given** the Add popup is open with one or more required fields empty, **When** the
   user clicks **Save**, **Then** validation errors highlight the empty fields and the
   popup remains open.
4. **Given** the Add popup is open, **When** the user clicks **Cancel**, **Then** the
   popup closes with no data saved and the list is unchanged.
5. **Given** a transaction in the list, **When** the user clicks its **Edit** icon,
   **Then** a popup pre-populated with the transaction's current data appears, with the
   same fields as Add plus Cancel and Save buttons.
6. **Given** the Edit popup is open with valid changes, **When** the user clicks **Save**,
   **Then** the changes are persisted, the popup closes, and the list reflects the
   updated data immediately.
7. **Given** a transaction in the list, **When** the user clicks its **Delete** icon,
   **Then** a confirmation popup appears asking the user to confirm deletion.
8. **Given** the delete confirmation popup is open, **When** the user confirms, **Then**
   the transaction is soft-deleted and removed from the visible list immediately.
9. **Given** the delete confirmation popup is open, **When** the user cancels, **Then**
   the popup closes and the transaction remains in the list unchanged.

---

### User Story 3 — Dashboard Overview (Home Page) (Priority: P3)

An authenticated user views a high-level summary of their financial activity for a
chosen time period, displayed as two pie charts: income breakdown by category and
expense breakdown by category.

**Why this priority**: The dashboard provides insight but requires transaction data
(P2) to be meaningful. It is the primary motivator for ongoing use.

**Independent Test**: Can be tested by pre-seeding transaction data and verifying the
correct pie chart proportions appear for each of the four time period options.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the Home page, **When** the page loads, **Then**
   the time-period dropdown defaults to **1 Month** and both pie charts render data for
   the last 30 days.
2. **Given** an authenticated user on the Home page, **When** they select a different
   option from the dropdown (1 Month / 3 Months / 6 Months / 1 Year), **Then** both
   pie charts update immediately to reflect data for the selected period without a full
   page reload.
3. **Given** the selected period has income data, **When** the income pie chart renders,
   **Then** each slice represents a category's proportion of total income, and a colour-
   coded legend lists each category name and its percentage or amount.
4. **Given** the selected period has expense data, **When** the expense pie chart renders,
   **Then** each slice represents a category's proportion of total expenses, with a
   colour-coded legend.
5. **Given** the selected period has no transactions for one chart, **When** that chart
   renders, **Then** an empty-state message ("No data for this period") is displayed
   instead of an empty chart.
6. **Given** a mobile viewport (< 768 px), **When** the Home page renders, **Then** the
   income and expense charts stack vertically rather than side-by-side, each occupying
   full width.

---

### User Story 4 — Manage Categories (Settings Page) (Priority: P4)

An authenticated user creates, renames, and removes income and expense categories that
are used when recording transactions.

**Why this priority**: Categories are required before meaningful transactions can be
created (the Import page dropdown depends on them), but a default seed set can cover
early usage.

**Independent Test**: Can be tested by creating a new Income category, verifying it
appears in the Import page's category dropdown, then editing and deleting it and
confirming the dropdown updates accordingly.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the Settings page, **When** the page loads,
   **Then** two separate lists are shown: Income categories and Expense categories, each
   with an **Add** button.
2. **Given** the user clicks **Add** under Income or Expense, **When** they enter a
   unique category name and confirm, **Then** the new category appears in the
   corresponding list and becomes available in the Import page dropdown.
3. **Given** an existing category, **When** the user clicks its **Edit** icon, enters a
   new name, and saves, **Then** the category name is updated everywhere it appears
   (Settings list and Import dropdown).
4. **Given** an existing category with no associated transactions, **When** the user
   clicks its **Delete** icon and confirms, **Then** the category is removed from both
   the Settings list and the Import dropdown.
5. **Given** an existing category that has associated transactions, **When** the user
   attempts to delete it, **Then** a warning informs them how many transactions are
   linked and asks for explicit confirmation before proceeding.
6. **Given** the user attempts to create a duplicate category name within the same type
   (Income or Expense), **Then** an error is shown and the duplicate is not saved.

---

### Edge Cases

- What happens when a user submits the Add/Edit transaction form with an amount of 0 or
  a negative number?
- What happens when a user deletes a category that is currently selected in an open
  Add/Edit transaction popup?
- How does the Home page pie chart behave when a single category accounts for 100% of
  income or expenses?
- What happens if the user's session expires while a popup is open — does the next Save
  prompt re-authentication or silently discard the entry?
- How does the transaction list on the Import page handle a large number of entries
  (pagination, infinite scroll, or windowed list)?
- What happens if the user's device loses connectivity mid-save — is the user informed,
  and is partial data prevented?

---

## Requirements _(mandatory)_

### Functional Requirements

#### Authentication

- **FR-001**: The system MUST allow a visitor to register with a unique email address
  and a password that meets minimum strength requirements (at least 8 characters).
- **FR-002**: The system MUST reject registration when the submitted email is already
  associated with an existing account and display an appropriate error message.
- **FR-003**: The system MUST allow a registered user to authenticate with their email
  and password and establish a session.
- **FR-004**: On failed login, the system MUST display a generic error message that does
  not reveal whether the email or password is incorrect.
- **FR-005**: The system MUST redirect authenticated users away from the Login and Sign
  Up pages to the Home page.
- **FR-006**: The system MUST provide a mechanism for users to end their session (logout).

#### Home — Dashboard

- **FR-007**: The Home page MUST display a time-period dropdown with exactly four
  options: 1 Month, 3 Months, 6 Months, 1 Year.
- **FR-008**: The default selected period MUST be 1 Month on every page load.
- **FR-009**: Changing the dropdown selection MUST update both pie charts without
  a full page reload.
- **FR-010**: The income pie chart MUST render a slice per category proportional to
  that category's share of total income in the selected period, accompanied by a
  colour-coded legend showing category name and value/percentage.
- **FR-011**: The expense pie chart MUST render a slice per category proportional to
  that category's share of total expenses in the selected period, accompanied by a
  colour-coded legend.
- **FR-012**: When no data exists for a given chart in the selected period, the chart
  area MUST display an empty-state message instead of an empty or broken chart.
- **FR-013**: On mobile viewports, the income and expense charts MUST stack vertically.

#### Import — Transaction Management

- **FR-014**: The Import page MUST display an **Add** button that opens an Add
  Transaction popup.
- **FR-015**: The Add Transaction popup MUST contain the following fields:
  - Date picker (calendar UI, defaults to the current date)
  - Note (free-text input, supports Markdown, required)
  - Amount (numeric input, positive values only, required)
  - Type (dropdown: Income / Expense, required)
  - Category (dropdown whose options are filtered by the selected Type, required)
- **FR-016**: The popup MUST have a **Cancel** button that closes it without saving
  and a **Save** button that validates and persists the entry.
- **FR-017**: On Save, required fields that are empty MUST be highlighted with inline
  validation messages and the popup MUST remain open.
- **FR-018**: After a successful save, the popup MUST close and the transaction list
  MUST update to include the new entry without a full page reload.
- **FR-019**: The transaction list MUST be grouped by date (most recent first) and each
  row MUST display: date, note (Markdown rendered), amount (colour-coded: income green /
  expense red), type, category, and Edit and Delete action icons.
- **FR-020**: Clicking the **Edit** icon on a transaction row MUST open the Edit popup
  pre-populated with the transaction's current values.
- **FR-021**: After a successful edit save, the transaction list MUST reflect the
  updated data immediately without a full page reload.
- **FR-022**: Clicking the **Delete** icon on a transaction row MUST open a confirmation
  popup before any deletion occurs.
- **FR-023**: Confirmed deletion MUST soft-delete the record and remove it from the
  visible list immediately without a full page reload.
- **FR-024**: Transaction amounts MUST be stored and displayed in the user's chosen
  currency with proper formatting (thousands separators, currency symbol).

#### Settings — Category Management

- **FR-025**: The Settings page MUST display Income categories and Expense categories
  in two separate, clearly labelled lists.
- **FR-026**: Each list MUST have an **Add** button that allows the user to create a
  new category by providing a name.
- **FR-027**: Duplicate category names within the same type MUST be rejected with an
  error message.
- **FR-028**: Each category item MUST have an **Edit** icon that allows renaming.
- **FR-029**: Renaming a category MUST propagate the updated name everywhere it appears,
  including the Import page dropdown.
- **FR-030**: Each category item MUST have a **Delete** icon.
- **FR-031**: Deleting a category that has linked transactions MUST require an explicit
  secondary confirmation warning the user of the impact.
- **FR-032**: After deletion, the category MUST no longer appear in the Settings list
  or in any dropdown.

#### Responsive & Markdown

- **FR-033**: All pages MUST be fully functional and readable at viewport widths from
  320 px to 1920 px+ without horizontal scrolling at the page level.
- **FR-034**: The transaction list on the Import page MUST be horizontally scrollable
  (table) on small viewports OR switch to a card-list layout, with the action icons
  always accessible.
- **FR-035**: All Markdown-rendered fields (transaction notes) MUST sanitize user input
  before rendering to prevent XSS.

### Key Entities

- **User**: Represents an account holder. Key attributes: email (unique), hashed
  password, created date. A User owns all other entities.
- **Category**: Represents a classification for transactions. Key attributes: name,
  type (Income or Expense), owner (User). Categories are user-scoped (not shared).
- **Transaction**: Represents a single financial record. Key attributes: date, note
  (Markdown text), amount (integer in minor currency units), type (Income or Expense),
  category (reference to Category), soft-delete flag, created/updated timestamps.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new user can complete registration and reach the Home page in under
  2 minutes on a standard mobile connection.
- **SC-002**: Adding, editing, or deleting a transaction takes under 1 minute from
  clicking the action icon to seeing the updated list.
- **SC-003**: The Home page charts update visually within 1 second of selecting a
  different time period.
- **SC-004**: All pages render correctly and are fully operable on screen widths of
  320 px, 375 px, 768 px, 1024 px, and 1280 px — verified without horizontal page
  scroll.
- **SC-005**: 100% of transaction note fields render Markdown formatting (bold, italic,
  lists, code) correctly, with no raw Markdown syntax visible to the user.
- **SC-006**: Zero data loss occurs on a confirmed Save — a transaction saved by the
  user is retrievable on the next page load or session.
- **SC-007**: Deleting a transaction or category requires at least one explicit user
  confirmation step; no accidental one-click deletions are possible.
- **SC-008**: Unauthenticated users are prevented from accessing any page other than
  Login and Sign Up — verified by attempting direct URL navigation.

---

## Assumptions

- Users have a stable internet connection during active use; offline support is out of
  scope for this version.
- Each user manages their own private data; multi-user sharing of categories or
  transactions is out of scope.
- Currency is single per user account; multi-currency support is out of scope for v1.
  The default display currency is VND (Vietnamese Dong).
- A default seed set of Income and Expense categories will be provided at account
  creation so new users can record transactions immediately without visiting Settings first.
- The application supports modern browsers (Chrome, Firefox, Safari, Edge — latest two
  major versions); IE11 support is out of scope.
- Password reset / "Forgot password" email flow is out of scope for v1; it will be
  addressed in a subsequent feature.
- The transaction list on the Import page uses date-based grouping with newest dates
  first; pagination or infinite scroll strategy is left to the implementation plan.
- Markdown rendering in note fields supports: bold, italic, inline code, fenced code
  blocks, unordered lists, ordered lists, blockquotes, and links. Images embedded via
  Markdown in notes are out of scope.
