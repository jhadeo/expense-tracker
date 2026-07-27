# Functional Requirements

## Introduction

This document defines the functional requirements of the Expense Tracker application. It describes the expected behavior of the system and serves as a reference during development and testing.

 

## FR-001 Authentication

### Description
The system shall provide secure authentication for guests and registered users.

### Functional Requirements
- Guests shall be able to register a new account.
- Guests shall be able to log in using their credentials.
- Registered users shall be able to log out.
- Registered users shall be able to reset their password.

### Inputs
- First Name
- Last Name
- Email Address
- Password
- Confirm Password

### Validation
- First name is required.
- Last name is required.
- Email address is required.
- Email address must be unique.
- Email address must follow a valid email format.
- Password is required.
- Password must contain at least 8 characters.
- Password confirmation must match the password.

### Business Rules
- Only authenticated users may access protected resources.
- Passwords shall be stored securely.
- Users may only access their own accounts.

### Expected Result
Users can securely register, authenticate, and access the application.

 

## FR-002 Dashboard

### Description
The system shall provide users with a summary of their financial activity.

### Functional Requirements
- View current balance.
- View monthly income.
- View monthly expenses.
- View recent transactions.
- View expense summaries.

### Business Rules
- Dashboard data shall be generated from the authenticated user's transactions.
- Dashboard values shall update whenever income or expense records change.

### Expected Result
Users can quickly understand their current financial status.

 

## FR-003 Income Management

### Description
The system shall allow authenticated users to manage income transactions.

### Functional Requirements
- Create income transactions.
- View income transactions.
- Update income transactions.
- Delete income transactions.
- Categorize income transactions.

### Inputs
- Amount
- Category
- Transaction Date
- Description (optional)

### Validation
- Amount must be greater than zero.
- Category is required.
- Transaction date is required.

### Business Rules
- Users may only manage their own income transactions.
- Transactions shall be associated with the authenticated user.

### Expected Result
Income transactions are successfully stored and reflected in the dashboard and reports.

 

## FR-004 Expense Management

### Description
The system shall allow authenticated users to manage expense transactions.

### Functional Requirements
- Create expense transactions.
- View expense transactions.
- Update expense transactions.
- Delete expense transactions.
- Categorize expense transactions.

### Inputs
- Amount
- Category
- Transaction Date
- Description (optional)

### Validation
- Amount must be greater than zero.
- Category is required.
- Transaction date is required.

### Business Rules
- Users may only manage their own expense transactions.
- Transactions shall be associated with the authenticated user.

### Expected Result
Expense transactions are successfully stored and reflected in the dashboard and reports.

 

## FR-005 Category Management

### Description
The system shall allow authenticated users to manage transaction categories.

### Functional Requirements
- Create categories.
- View categories.
- Update categories.
- Delete categories.
- Assign categories to income and expense transactions.

### Inputs
- Category Name
- Category Type (Income or Expense)

### Validation
- Category name is required.
- Category type is required.
- Category names shall be unique per user and category type.

### Business Rules
- Users may only manage their own categories.
- Categories assigned to existing transactions shall not be permanently deleted.

### Expected Result
Users can organize income and expense transactions using custom categories.

## FR-006 Reports

### Description
The system shall generate financial reports based on recorded transactions.

### Functional Requirements
- Generate monthly reports.
- Generate reports grouped by category.
- Display charts summarizing financial activity.

### Inputs
- Date Range
- Category (optional)

### Validation
- Date range must be valid.

### Business Rules
- Reports shall only include transactions belonging to the authenticated user.
- Report values shall accurately reflect stored transaction data.

### Expected Result
Users can analyze their financial activity over time.


## FR-007 Search, Filtering, and Pagination

### Description
The system shall allow users to efficiently locate and browse financial records.

### Functional Requirements
- Search income and expense transactions.
- Filter transactions by category.
- Filter transactions by date.
- Sort transaction records.
- Paginate transaction listings.

### Inputs
- Search Keyword
- Category
- Date Range
- Sort Order

### Validation
- Search parameters are optional.
- Invalid filter values shall be ignored or rejected appropriately.

### Business Rules
- Search results shall only include the authenticated user's records.
- Pagination shall preserve active filters and sorting.

### Expected Result
Users can efficiently find and navigate their financial records.