# Form Variable Binding Guide

## Overview

This guide explains how to bind form fields to variables, making them available as form parameters that can be passed from your workflow or application.

## Problem Solved

Previously, when creating forms in the Form Builder, there was no way to bind individual form fields to variables. This meant that variables couldn't be passed as parameters to the form, limiting the ability to pre-fill forms dynamically.

## Solution

We've added a **Variable Binding** section to the Field Configuration panel that allows you to:

1. **Link each field to a variable** - Give it a meaningful variable name (e.g., `user_email`, `product_name`)
2. **Specify the variable type** - Choose from String, Number, Boolean, Date, Array, or Object
3. **Track form parameters** - See all bound variables in a dedicated parameters panel

## How to Use

### Step 1: Create/Edit a Form

1. Go to the Form Designer
2. Add fields to your form from the Field Palette

### Step 2: Bind Fields to Variables

1. **Select a field** in the form builder
2. In the right panel, scroll down to **"Variable Binding"** section
3. Enter a **Variable Name** (e.g., `user_email`, `applicant_name`, `product_id`)
4. Choose the **Variable Type** from the dropdown
5. Click **"Update Field"** to save

### Step 3: View Form Parameters

Two places show your bound variables:

**Panel View (Form Designer):**
- Right side of the screen shows "Form Parameters"
- Lists all variables bound to your form
- Shows variable name, field label, and type
- Updates in real-time as you bind fields

**Preview View:**
- When in Preview mode, bound variables are highlighted with a badge
- Each field shows its variable name (e.g., `[user_email]`)
- A "Form Parameters" section at the bottom lists all parameters
- Shows count of parameters and their types

## Example

### Form: "User Registration"

**Fields:**
| Field | Type | Variable Name | Variable Type |
|-------|------|---------------|---------------|
| Email | text | user_email | string |
| Age | number | user_age | number |
| Newsletter | checkbox | subscribe_newsletter | boolean |
| Join Date | date | join_date | date |

**Form Parameters:**
```
λ Form Parameters
- user_email (string): Email field
- user_age (number): Age field
- subscribe_newsletter (boolean): Newsletter field
- join_date (date): Join Date field
```

## Integration with Workflows

### In Workflow Designer

When using this form in a workflow (form node), you can:

1. Link variables from your workflow to form fields
2. Pass values when the form is presented
3. Capture form submissions back into workflow variables

### Example: Workflow Integration

```
[Variable Node] → user_email = "john@example.com"
                 → user_age = 25
                 ↓
            [Form Node] → Pre-fills form with those values
                 ↓
         [Form Submission] → Returns filled values
```

## Benefits

✅ **Pre-fill forms dynamically** - Pass values from workflow context
✅ **Type safety** - Define expected variable types
✅ **Clear documentation** - See all form parameters at a glance
✅ **Reusable forms** - Same form can be used with different variable sets
✅ **Better integration** - Seamless flow between workflow and forms

## Technical Details

### Storage

Variable bindings are stored in the form schema:

```json
{
  "id": "field-123",
  "type": "text",
  "label": "Email",
  "name": "field_456",
  "variableName": "user_email",
  "variableType": "string",
  "required": true,
  "validation": {}
}
```

### Form Parameters Schema

When a form is loaded, the system identifies all bound variables and makes them available as form parameters.

### Backward Compatibility

Existing forms without variable bindings continue to work as before. Variable binding is completely optional.

## Tips & Best Practices

1. **Use meaningful names** - Use snake_case for variable names (e.g., `user_email` not `email1`)
2. **Match types** - Ensure variable types match field types (string for text, number for numeric inputs)
3. **Document patterns** - Use consistent naming across your organization
4. **Test integration** - Test form parameter passing in your workflow
5. **Use preview** - Check the preview to see highlighted parameter names

## Troubleshooting

### Variables not showing in Form Parameters panel?
- Make sure you've filled in the "Bind to Variable" field
- The field must have a non-empty `variableName`
- Click "Update Field" to save changes

### Variable not appearing in Workflow Form Node?
- Ensure the form is saved
- Refresh the workflow designer
- Check that the variable name is correctly entered in the form

### Type mismatches?
- Verify the variable type matches the expected data type
- Use "string" for text-like data that might need formatting
- Use specific types (number, boolean, date) only when the value is strictly that type

## Related Documentation

- [Form Builder Documentation](docs/API.md) - API reference
- [Workflow Engine](docs/WORKFLOW_ENGINE.md) - How workflows use forms
- [Form Schema](docs/DATABASE_SEEDING.md) - Database structure
