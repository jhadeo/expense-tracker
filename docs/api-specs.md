# API Specification

## Overview

### Base URL

```
/api
```

### Authentication

- Laravel Sanctum
- Bearer Token

### Request Format

JSON

### Response Format

JSON

### Date Format

YYYY-MM-DD

---

# Authentication

## Register

### Endpoint

POST /api/register

### Authentication

Not required.

### Request

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

### Validation

| Field      | Rules                      |
| ---------- | -------------------------- |
| first_name | required, string, max:255  |
| last_name  | required, string, max:255  |
| email      | required, email, unique    |
| password   | required, confirmed, min:8 |

### Success Response (201)

```json
{
  "message": "User registered successfully.",
  "token": "...",
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  }
}
```

### Error Responses

| Status | Description      |
| ------ | ---------------- |
| 422    | Validation Error |

## Login

### Endpoint

POST /api/login

### Authentication

Not required.

### Request

```json
{
  "email": "john@example.com",
  "password": "password",

}
```

### Validation

| Field    | Rules            |
| -------- | ---------------- |
| email    | required, email, |
| password | required         |

### Success Response (200)

```json
{
  "message": "User logged in successfully.",
  "token": "...",
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  }
}
```

### Error Responses

| Status | Description      |
| ------ | ---------------- |
| 401    | Unauthorized     |
| 422    | Validation Error |

## Logout

### Endpoint

POST /api/logout

### Authentication

Required.

### Request

None


### Success Response (200)

```json
{
  "message": "User logged out successfully."
}
```

### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |

## Get authenticated user

### Endpoint

GET /api/user

### Authentication

Required.

### Request

None

### Success Response (200)

```json
{
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  }
}
```

### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |

# Categories

## List Categories

### Endpoint

GET /api/categories

### Purpose

Retrieve all categories available to the authenticated user.

### Authentication

Required.

### Request

None

### Success Response (200)

```json
{
    "data": [
        {
            "id": 1,
            "user_id": null,
            "name": "Food",
            "type": "expenses"
        },
        {
            "id": 2,
            "user_id": 1,
            "name": "Mortgage",
            "type": "expenses"
        }
    ]
}
```

### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |

## Create Category

### Endpoint

POST /api/categories

### Purpose

Create a category that belongs to the authenticated user.

### Authentication

Required.

### Request

```json
{
  "name": "Debt",
  "type": "expenses",

}
```

### Validation

| Field | Rules                              |
| ----- | ---------------------------------- |
| name  | required, max:255, unique per user |
| type  | required, in:income,expenses       |

### Success Response (201)

```json
{
  "message": "Category created successfully.",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Debt",
    "type": "expenses",
  }
}
```

### Error Responses

| Status | Description      |
| ------ | ---------------- |
| 401    | Unauthorized     |
| 422    | Validation Error |

### Business Rules

- The created category is assigned to the authenticated user.
- `user_id` is automatically populated by the server.
- Category names are unique per user, regardless of type.
- System categories (`user_id = NULL`) are considered when checking uniqueness for user-created categories.

## Update Category

### Endpoint

PUT /api/categories/{id}

### Purpose

Edit a category owned by the authenticated user.

### Authentication

Required.

### Request

```json
{
  "name": "Debt"
}
```

### Validation

| Field | Rules                                                        |
| ----- | ------------------------------------------------------------ |
| name  | required, max:255, unique per user (ignore current category) |

### Success Response (200)

```json
{
  "message": "Category edited successfully.",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Debt"
  }
}
```

### Error Responses

| Status | Description      |
| ------ | ---------------- |
| 401    | Unauthorized     |
| 403    | Forbidden        |
| 404    | Not found        |
| 422    | Validation Error |

### Business Rules
- Only the owner may update the category.
- System categories cannot be edited.
- Category names are unique per user.
- Category type cannot be changed.

## View Category

### Endpoint

GET /api/categories/{id}

### Purpose

View a specific category owned by the authenticated user.

### Authentication

Required.

### Request

None

### Route Parameters

| Parameter | Type    | Description         |
| --------- | ------- | ------------------- |
| id        | integer | Category identifier |

### Success Response (200)

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Debt",
    "type": "expenses"
  }
}
```

### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |
| 403    | Forbidden    |
| 404    | Not found    |

### Business Rules

- Users may view their own categories.
- Users may view system categories (`user_id = NULL`).
- Users cannot view categories owned by other users.

## Delete Category

### Endpoint

DELETE /api/categories/{id}

### Purpose

Delete a specific category owned by the authenticated user.

### Authentication

Required.

### Request

None

### Route Parameters

| Parameter | Type    | Description         |
| --------- | ------- | ------------------- |
| id        | integer | Category identifier |

### Success Response (200)

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Debt",
    "type": "expenses"
  }
}
```

### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |
| 403    | Forbidden    |
| 404    | Not found    |

### Business Rules

- Users may delete their own categories.
- Users cannot delete categories (`user_id = NULL`).
- Users cannot delete categories owned by other users.

# Expenses

## List Expenses

### Endpoint

GET /api/expenses

### Purpose

Retrieve all expenses belonging to the authenticated user.

### Authentication

Required.

### Request

None

### Success Response (200)

```json
{
    "data": [
        {
            "id": 1,
            "title": "Lunch",
            "amount": 200.00,
            "category_id": 1,
            "date": "2026-07-28"
        },
        {
            "id": 2,
            "title": "Dinner Date",
            "category_id": 1,
            "amount": 500.00,
            "date": "2026-07-28"
        },
    ]
}
```
### Query Parameters

| Paramenter  | Type    | Description          |
| ----------- | ------- | -------------------- |
| search      | string  | Search expense title |
| category_id | integer | Filter by category   |
| start_date  | date    | Filter from date     |
| end_date    | date    | Filter to date       |
| page        | integer | Pagination           |


### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |

## Create Expense

### Endpoint

POST /api/expenses

### Purpose

Create an expense that belongs to the authenticated user.

### Authentication

Required.

### Request

```json
    {
        "title": "Lunch",
        "amount": 200.00,
        "category_id": 1,
        "date": "2026-07-28"
    },
```

### Validation

| Field       | Rules                          |
| ----------- | ------------------------------ |
| title       | required, max:255              |
| amount      | required, numeric, min:1       |
| category_id | required, exists:categories,id |
| date        | required                       |

### Success Response (201)

```json
{
  "message": "Expense created successfully.",
  "data": {
        "id": 1,
        "user_id": 1,
        "title": "Lunch",
        "amount": 200.00,
        "category_id": 1,
        "date": "2026-07-28"
    },
}
```

### Error Responses

| Status | Description      |
| ------ | ---------------- |
| 401    | Unauthorized     |
| 422    | Validation Error |

### Business Rules

- The created expense is assigned to the authenticated user.
- user_id is automatically populated by the server.
- category_id must reference an existing category.
- The category must belong to the authenticated user or be a system category.
- The category type must be "expense".

## Update Expense

### Endpoint

PUT /api/expenses/{id}

### Purpose

Edit an expense owned by the authenticated user.

### Authentication

Required.

### Request

```json
    {
        "title": "Brunch",
        "amount": 230.00,
        "category_id": 1,
        "date": "2026-07-28"
    },
```

### Validation

| Field       | Rules                          |
| ----------- | ------------------------------ |
| title       | required, max:255              |
| amount      | required, numeric              |
| category_id | required, exists:categories,id |
| date        | required ,  date               |

### Success Response (200)

```json
{
    "message": "Expense updated successfully.",
    "data": {
        "id": 1,
        "user_id": 1,
        "title": "Brunch",
        "amount": 230.00,
        "category_id": 1,
        "date": "2026-07-28"
    }
}
```

### Error Responses

| Status | Description      |
| ------ | ---------------- |
| 401    | Unauthorized     |
| 403    | Forbidden        |
| 404    | Not found        |
| 422    | Validation Error |

### Business Rules
- Only the owner of an expense may update it.
- The selected category must belong to the authenticated user or be a system category.
- The selected category must have the type expense.

## View Expense

### Endpoint

GET /api/expenses/{id}

### Purpose

Retrieve a specific expense by the authenticated user.

### Authentication

Required.

### Request

None

### Route Parameters

| Parameter | Type    | Description        |
| --------- | ------- | ------------------ |
| id        | integer | Expense identifier |

### Success Response (200)

```json
{
    "data": {
        "id": 1,
        "user_id": 1,
        "title": "Lunch",
        "amount": 200.00,
        "category_id": 1,
        "date": "2026-07-28"
    }
}
```

### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |
| 403    | Forbidden    |
| 404    | Not found    |

### Business Rules

- Users may only view their own expenses.
- Soft-deleted expenses are not returned.

## Delete Expense

### Endpoint

DELETE /api/expenses/{id}

### Purpose

Soft delete an expense by the authenticated user.

### Authentication

Required.

### Request

None

### Route Parameters

| Parameter | Type    | Description        |
| --------- | ------- | ------------------ |
| id        | integer | Expense identifier |

### Success Response (200)

```json
{
    "message": "Expense deleted successfully."
}
```

### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |
| 403    | Forbidden    |
| 404    | Not found    |

### Business Rules
- Only the owner of an expense may delete it.
Expenses are soft deleted.
- Deleted expenses are excluded from list and view endpoints.

# Income

## List incomes

### Endpoint

GET /api/incomes

### Purpose

Retrieve all incomes belonging to the authenticated user.

### Authentication

Required.

### Request

None

### Success Response (200)

```json
{
    "data": [
        {
            "id": 1,
            "title": "Side hustle",
            "amount": 200.00,
            "category_id": 2,
            "date": "2026-07-28"
        },
        {
            "id": 2,
            "title": "Salary from June 12",
            "category_id": 1,
            "amount": 500.00,
            "date": "2026-07-28"
        },
    ]
}
```
### Query Parameters

| Paramenter  | Type    | Description         |
| ----------- | ------- | ------------------- |
| search      | string  | Search income title |
| category_id | integer | Filter by category  |
| start_date  | date    | Filter from date    |
| end_date    | date    | Filter to date      |
| page        | integer | Pagination          |


### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |

## Create income

### Endpoint

POST /api/incomes

### Purpose

Create an income that belongs to the authenticated user.

### Authentication

Required.

### Request

```json
    {
        "title": "Cashback",
        "amount": 12,
        "category_id": 1,
        "date": "2026-07-28"
    },
```

### Validation

| Field       | Rules                          |
| ----------- | ------------------------------ |
| title       | required, max:255              |
| amount      | required, numeric, min:1       |
| category_id | required, exists:categories,id |
| date        | required                       |

### Success Response (201)

```json
{
  "message": "Income created successfully.",
  "data": {
        "id": 1,
        "title": "Cashback",
        "amount": 12,
        "category_id": 1,
        "date": "2026-07-28"
    },
}
```

### Error Responses

| Status | Description      |
| ------ | ---------------- |
| 401    | Unauthorized     |
| 422    | Validation Error |

### Business Rules

- The created income is assigned to the authenticated user.
- user_id is automatically populated by the server.
- category_id must reference an existing category.
- The category must belong to the authenticated user or be a system category.
- The category type must be "income".

## Update income

### Endpoint

PUT /api/incomes/{id}

### Purpose

Edit an income owned by the authenticated user.

### Authentication

Required.

### Request

```json
    {
        "title": "Lunch allowance",
        "amount": 20.00,
        "category_id": 1,
        "date": "2026-07-28"
    },
```

### Validation

| Field       | Rules                          |
| ----------- | ------------------------------ |
| title       | required, max:255              |
| amount      | required, numeric              |
| category_id | required, exists:categories,id |
| date        | required                       |

### Success Response (200)

```json
{
    "message": "Income updated successfully.",
    "data": {
        "id": 1,
        "user_id": 1,
        "title": "Lunch Allowance",
        "amount": 20.00,
        "category_id": 1,
        "date": "2026-07-28"
    }
}
```

### Error Responses

| Status | Description      |
| ------ | ---------------- |
| 401    | Unauthorized     |
| 403    | Forbidden        |
| 404    | Not found        |
| 422    | Validation Error |

### Business Rules
- Only the owner of an income may update it.
- The selected category must belong to the authenticated user or be a system category.
- The selected category must have the type income.

## View income

### Endpoint

GET /api/incomes/{id}

### Purpose

Retrieve a specific income by the authenticated user.

### Authentication

Required.

### Request

None

### Route Parameters

| Parameter | Type    | Description       |
| --------- | ------- | ----------------- |
| id        | integer | income identifier |

### Success Response (200)

```json
{
    "data": {
        "id": 1,
        "title": "Lunch allowance",
        "amount": 20.00,
        "category_id": 1,
        "date": "2026-07-28"
    }
}
```

### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |
| 403    | Forbidden    |
| 404    | Not found    |

### Business Rules

- Users may only view their own incomes.
- Soft-deleted incomes are not returned.

## Delete income

### Endpoint

DELETE /api/incomes/{id}

### Purpose

Soft delete an income by the authenticated user.

### Authentication

Required.

### Request

None

### Route Parameters

| Parameter | Type    | Description       |
| --------- | ------- | ----------------- |
| id        | integer | income identifier |

### Success Response (200)

```json
{
    "message": "Income deleted successfully."
}
```

### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |
| 403    | Forbidden    |
| 404    | Not found    |

### Business Rules
- Only the owner of an income may delete it.
incomes are soft deleted.
- Deleted incomes are excluded from list and view endpoints.

# Reports

## Generate monthly report

### Endpoint

GET /api/reports/monthly

### Purpose

Generate a financial report for a specific month

### Authentication

Required.

### Query Parameters

| Paramenter | Type    | Rules                  |
| ---------- | ------- | ---------------------- |
| month      | integer | required, between:1,12 |
| year       | integer | required, digits:4     |

### Example
`GET /api/reports/monthly?month=7&year=2026`

### Success Response (200)

```json
{
    "data": {
        "month": 7,
        "year": 2026,
        "total_income": 5000.00,
        "total_expenses": 3200.00,
        "balance": 1800.00,
        "income": [
            {
                "id": 1,
                "title": "Salary",
                "amount": 5000.00,
                "category_id": 1,
                "date": "2026-07-15"
            }
        ],
        "expenses": [
            {
                "id": 2,
                "title": "Rent",
                "amount": 1200.00,
                "category_id": 4,
                "date": "2026-07-01"
            },
            {
                "id": 3,
                "title": "Groceries",
                "amount": 400.00,
                "category_id": 2,
                "date": "2026-07-08"
            }
        ]
    }
}
```

### Error Responses

| Status | Description      |
| ------ | ---------------- |
| 401    | Unauthorized     |
| 422    | Validation Error |

- Only transactions belonging to the authenticated user are included.
- Only transactions within the specified month and year are included.
- `balance` is calculated as total income − total expenses.
- Soft-deleted income and expense records are excluded.

## Generate category report

### Endpoint

GET /api/reports/category

### Purpose

Generate a financial report for a specific category.

### Authentication

Required.

### Query Parameters

| Paramenter  | Type    | Rules                          |
| ----------- | ------- | ------------------------------ |
| category_id | integer | required, exists:categories,id |
| month       | integer | between:1,12                   |
| year        | integer | digits:4                       |
| start_date  | date    | date                           |
| end_date    | date    | date                           |


### Example
`GET /api/reports/monthly?month=7&year=2026`

### Success Response (200)

```json
{
    "data": {
        "category": {
            "id": 1,
            "name": "Food",
            "type": "expense"
        },
        "period": {
            "month": 7,
            "year": 2026
        },
        "transaction_count": 12,
        "total_amount": 1250.00,
        "transactions": [
            {
                "id": 10,
                "title": "Lunch",
                "amount": 200.00,
                "date": "2026-07-10"
            },
            {
                "id": 15,
                "title": "Dinner",
                "amount": 350.00,
                "date": "2026-07-20"
            }
        ]
    }
}
```

### Error Responses

| Status | Description        |
| ------ | ------------------ |
| 401    | Unauthorized       |
| 403    | Forbidden          |
| 404    | Category Not Found |
| 422    | Validation Error   |

- Only categories accessible to the authenticated user may be reported on.
- The category must belong to the authenticated user or be a system category (user_id = NULL).
- Only transactions belonging to the authenticated user are included.
- If no date filter is provided, all transactions for the category are included.

# Dashboard

## Get dashboard data

### Endpoint

GET /api/dashboard

### Purpose

Retrieve a summary of the authenticated user's financial data for the dashboard.

### Authentication

Required.

### Request

None

### Success Response (200)

```json
{
    "data": {
        "total_income": 5000.00,
        "total_expenses": 3200.00,
        "balance": 1800.00,
        "recent_income": [
            {
                "id": 1,
                "title": "Salary",
                "amount": 5000.00,
                "date": "2026-07-15"
            }
        ],
        "recent_expenses": [
            {
                "id": 1,
                "title": "Lunch",
                "amount": 200.00,
                "date": "2026-07-20"
            }
        ],
        "expense_by_category": [
            {
                "category": "Food",
                "total": 1200.00
            },
            {
                "category": "Transportation",
                "total": 450.00
            }
        ],
        "monthly_summary": [
            {
                "month": "2026-05",
                "income": 4800.00,
                "expenses": 3500.00
            },
            {
                "month": "2026-06",
                "income": 5000.00,
                "expenses": 3700.00
            }
        ]
    }
}
```

### Error Responses

| Status | Description  |
| ------ | ------------ |
| 401    | Unauthorized |


### Business Rules

- Only data belonging to the authenticated user is returned.
- Soft-deleted income and expense records are excluded.
- `balance` is calculated as total income − total expenses.
- `expense_by_category` contains the total expenses grouped by category.
- `monthly_summary` contains monthly income and expense totals for dashboard charts.