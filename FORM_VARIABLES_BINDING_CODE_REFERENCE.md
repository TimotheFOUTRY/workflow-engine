# Form Variable Binding - Code Diff Reference

## Files Modified

This document provides a detailed reference of the exact code changes made.

---

## 1. FieldConfig.jsx - Added Variable Binding Section

**File:** `/frontend/src/components/FormBuilder/FieldConfig.jsx`

**Location:** Between Options section and Validation section

**Added Code:**
```jsx
        {/* Variable Binding */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Variable Binding</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bind to Variable
            </label>
            <input
              type="text"
              value={config.variableName || ''}
              onChange={(e) => setConfig({ ...config, variableName: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., user_email, product_name"
            />
            <p className="text-xs text-gray-500 mt-1">
              The variable name that will be passed as a parameter when using this form
            </p>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variable Type
            </label>
            <select
              value={config.variableType || 'string'}
              onChange={(e) => setConfig({ ...config, variableType: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> Once you bind a field to a variable, it will appear in the form parameters and can be passed from your workflow or application.
            </p>
          </div>
        </div>
```

**What Changed:**
- Added input field for `variableName` property
- Added dropdown for `variableType` property (6 options)
- Added helpful tip box with information about variable binding
- Proper styling matching existing components
- State management integrated via `config` state object

---

## 2. FormDesigner.jsx - Enhanced Layout & Added Parameters Panel

**File:** `/frontend/src/components/FormBuilder/FormDesigner.jsx`

**Location:** Right sidebar (previously just had configuration or preview)

### 2A. Modified Right Panel Structure
```jsx
        {/* Field Configuration or Preview */}
        <div className="w-96 flex-shrink-0 flex flex-col gap-4">
          {showPreview ? (
            <FormPreview fields={fields} formName={formName} />
          ) : selectedField ? (
            <FieldConfig
              field={selectedField}
              onUpdate={handleFieldUpdate}
              onClose={() => setSelectedField(null)}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500">
              <p>Select a field to configure its properties</p>
            </div>
          )}

          {/* Form Parameters Panel - NEW */}
          <div className="bg-white rounded-lg shadow-sm border p-4 max-h-96 overflow-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
                λ
              </span>
              Form Parameters
            </h3>
            
            {fields.filter(f => f.variableName).length === 0 ? (
              <p className="text-xs text-gray-500">
                Bind fields to variables to see them here
              </p>
            ) : (
              <div className="space-y-2">
                {fields.filter(f => f.variableName).map(field => (
                  <div key={field.id} className="p-2 bg-indigo-50 rounded border border-indigo-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {field.variableName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {field.label}
                        </p>
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                        {field.variableType || 'string'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-3 pt-3 border-t text-xs text-gray-600">
              <p className="font-medium text-gray-700 mb-1">How to use:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Add fields and bind them to variables</li>
                <li>Pass parameter values when calling the form</li>
                <li>Fields will be pre-filled with the values</li>
              </ol>
            </div>
          </div>
        </div>
```

**Key Changes:**
- Changed right panel from `w-96` to flex layout with `flex-col gap-4`
- Configuration/Preview now in top section
- New Parameters panel added below
- Parameters panel shows filtered list of fields with `variableName`
- Real-time updates as fields are bound/unbound
- Helpful instructions included

---

## 3. FormPreview.jsx - Added Variable Display & Parameters Section

**File:** `/frontend/src/components/FormBuilder/FormPreview.jsx`

### 3A. Added Variable Display in Preview
```jsx
                {fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                      {field.variableName && (  {/* NEW */}
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          {field.variableName}
                        </span>
                      )}
                    </label>
                    {renderField(field)}
                    {field.helpText && (
                      <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
                    )}
                  </div>
                ))}
```

**Key Changes:**
- Added conditional rendering for `variableName` as a badge
- Badge styled with indigo color scheme
- Only shows if `variableName` exists

### 3B. Added Form Parameters Section
```jsx
  const boundFields = fields.filter(f => f.variableName);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 h-full overflow-auto">
      <div className="flex flex-col gap-4 h-full">
        {/* Form Preview */}
        <div className="flex-1">
          {/* ... existing preview code ... */}
        </div>

        {/* Form Parameters Section - NEW */}
        {boundFields.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-600 text-xs font-bold">
                λ
              </span>
              Form Parameters ({boundFields.length})
            </h4>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {boundFields.map(field => (
                <div key={field.id} className="p-2 bg-green-50 rounded border border-green-200 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono font-medium text-gray-900 truncate">
                        {field.variableName}
                      </p>
                      <p className="text-gray-600">
                        {field.label}
                      </p>
                    </div>
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded whitespace-nowrap">
                      {field.variableType || 'string'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
```

**Key Changes:**
- Added `boundFields` constant to filter fields with `variableName`
- Wrapped return in flex column layout
- Preview moved to `flex-1` container
- Conditional rendering of Parameters section (only if `boundFields.length > 0`)
- Green color scheme for differentiation from edit mode
- Shows parameter count in header

---

## Data Structure Changes

### Field Object - New Properties

```javascript
// OLD Structure
{
  id: "field-123",
  type: "text",
  label: "Email Address",
  name: "field_456",
  required: false,
  validation: {},
  placeholder: "Enter your email"
}

// NEW Structure (with optional binding)
{
  id: "field-123",
  type: "text",
  label: "Email Address",
  name: "field_456",
  required: false,
  validation: {},
  placeholder: "Enter your email",
  variableName: "user_email",      // NEW - optional
  variableType: "string"            // NEW - optional
}
```

### Form Storage Structure

```json
{
  "id": "form-abc123",
  "name": "User Registration",
  "description": "Registration form",
  "schema": {
    "fields": [
      {
        "id": "field-1",
        "type": "text",
        "label": "Email",
        "name": "field_email",
        "variableName": "user_email",
        "variableType": "string"
      },
      {
        "id": "field-2",
        "type": "number",
        "label": "Age",
        "name": "field_age",
        "variableName": "user_age",
        "variableType": "number"
      }
    ]
  }
}
```

---

## State Management

### New State Properties

No new state variables were added. The feature uses existing patterns:

```javascript
// In FieldConfig.jsx
const [config, setConfig] = useState(field);

// config now includes optional properties:
config.variableName    // string: name of the variable
config.variableType    // string: type of the variable
```

### State Updates

```javascript
// Setting variable name
setConfig({ ...config, variableName: e.target.value })

// Setting variable type
setConfig({ ...config, variableType: e.target.value })

// Both handled through existing config state management
```

---

## Styling Additions

### CSS Classes Used

**Indigo Theme (Edit Mode):**
```
bg-indigo-50      - Light background for parameter cards
border-indigo-200 - Border color
text-indigo-700   - Text color
bg-indigo-100     - Badge background
text-indigo-600   - Badge text color
```

**Green Theme (Preview Mode):**
```
bg-green-50       - Light background for parameter cards
border-green-200  - Border color
text-green-700    - Text color
bg-green-100      - Badge background
text-green-600    - Badge text color
```

**Neutral:**
```
border-t          - Top border for section separation
pt-4              - Padding top
mt-3              - Margin top
gap-4             - Gap between elements (flex)
```

---

## Component Integration

### How Components Work Together

```
FormDesigner
  ├─ FieldPalette (unchanged)
  ├─ FormBuilder (unchanged)
  ├─ Right Panel (MODIFIED)
  │  ├─ FieldConfig (ENHANCED)
  │  │  └─ Variable Binding Section (NEW)
  │  │
  │  └─ FormParameters Panel (NEW)
  │
  └─ FormPreview (ENHANCED)
     ├─ Field Labels (modified to show variable badges)
     └─ Form Parameters Section (NEW)
```

---

## Backward Compatibility

### Breaking Changes
❌ None - All changes are additive

### Compatibility
✅ Existing forms continue to work
✅ Optional properties don't affect old forms
✅ Filtering by `variableName` safely handles undefined
✅ Type defaults to 'string' if not specified

### Migration
No migration needed for existing forms. Variable binding is purely optional.

---

## Performance Considerations

### No Performance Impact
- Filtering: `fields.filter(f => f.variableName)` runs on every render but is O(n) where n is number of fields
- Typical forms have 5-20 fields, so negligible impact
- No new data fetches or async operations
- State management unchanged

### Optimization Opportunities (Future)
- Could memoize `boundFields` calculation if forms become very large
- Could add pagination if parameter list becomes very long

---

## Testing Checklist

```
✅ FieldConfig displays Variable Binding section
✅ Can enter variable name
✅ Can select variable type
✅ Update Field saves binding
✅ FormParameters panel shows bound fields
✅ Panel filters correctly (only shows fields with variableName)
✅ Real-time updates when fields are bound/unbound
✅ Preview shows variable badges on fields
✅ Preview shows Form Parameters section
✅ Forms save with binding data
✅ Forms load with binding data intact
✅ Old forms without bindings still work
✅ Empty variable name doesn't create parameter
```

---

## Rollback Instructions

If needed to rollback:

1. Restore `FieldConfig.jsx` - Remove Variable Binding section (lines containing variable binding code)
2. Restore `FormDesigner.jsx` - Remove Form Parameters Panel (revert to single panel layout)
3. Restore `FormPreview.jsx` - Remove variable badges and parameters section

All files have clear comments marking the NEW sections for easy identification.
