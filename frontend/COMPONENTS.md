# Workflow Engine Frontend Components

This document provides an overview of all the React components created for the workflow automation platform.

## Component Structure

```
src/
├── components/
│   ├── Layout/
│   │   └── Layout.jsx                 - Main application layout
│   ├── WorkflowDesigner/
│   │   ├── Designer.jsx               - Visual workflow designer
│   │   ├── NodePalette.jsx            - Draggable node types palette
│   │   └── NodeConfig.jsx             - Node configuration panel
│   ├── FormBuilder/
│   │   ├── FormDesigner.jsx           - Visual form builder
│   │   ├── FieldPalette.jsx           - Form field types palette
│   │   ├── FieldConfig.jsx            - Field configuration panel
│   │   └── FormPreview.jsx            - Live form preview
│   ├── TaskManager/
│   │   ├── TaskList.jsx               - List of user tasks
│   │   ├── TaskDetail.jsx             - Detailed task view
│   │   └── TaskActions.jsx            - Task action buttons
│   └── Monitoring/
│       ├── WorkflowList.jsx           - Workflow CRUD operations
│       ├── InstanceMonitor.jsx        - Monitor workflow instances
│       └── Analytics.jsx              - Analytics and charts
├── pages/
│   ├── UserDashboard.jsx              - User dashboard
│   └── AdminDashboard.jsx             - Admin dashboard
├── services/
│   ├── api.js                         - Axios base configuration
│   ├── workflowApi.js                 - Workflow API calls
│   ├── taskApi.js                     - Task API calls
│   ├── formApi.js                     - Form API calls
│   └── adminApi.js                    - Admin API calls
└── App.jsx                            - Main app with routing
```

## Component Details

### Layout Components

#### **Layout.jsx**
Main application layout with:
- Responsive sidebar navigation
- Header with user info
- Mobile-friendly hamburger menu
- Logout functionality
- Toast notifications integration

### Dashboard Pages

#### **UserDashboard.jsx**
User dashboard showing:
- Task statistics (pending, completed, overdue, total)
- Recent tasks list
- Visual indicators for task priority and status
- Quick navigation to task details

#### **AdminDashboard.jsx**
Admin dashboard featuring:
- System-wide statistics
- Workflow instances by status (pie chart)
- Tasks by status (bar chart)
- Completion trend over time (line chart)
- Average completion time by workflow (bar chart)
- Uses Recharts library for data visualization

### Workflow Designer

#### **Designer.jsx**
Visual workflow designer using ReactFlow:
- Drag and drop nodes from palette to canvas
- Connect nodes to create workflow logic
- Six node types: start, task, approval, condition, timer, end
- Save/load workflow definitions as JSON
- Edit workflow name and description
- Mini-map and zoom controls

#### **NodePalette.jsx**
Palette of draggable workflow node types:
- Start node (workflow entry point)
- Task node (assign task to user)
- Approval node (approval step)
- Condition node (conditional branching)
- Timer node (wait/delay)
- End node (workflow completion)

#### **NodeConfig.jsx**
Configuration panel for selected nodes:
- Node label editing
- Node-specific properties:
  - Task/Approval: assigned user, form ID, priority, due date
  - Condition: expression, branch labels
  - Timer: duration type and value
- Real-time node updates

### Form Builder

#### **FormDesigner.jsx**
Visual form builder:
- Click to add field types from palette
- Reorder fields
- Select fields to configure
- Toggle between edit and preview modes
- Save/load form schemas as JSON

#### **FieldPalette.jsx**
Palette of form field types:
- Text input
- Text area
- Number
- Email
- Date
- Dropdown (select)
- Radio buttons
- Checkboxes
- File upload

#### **FieldConfig.jsx**
Field configuration panel:
- Basic properties: label, name, placeholder, help text
- Required field toggle
- Field-specific options (for select, radio, checkbox)
- Validation rules:
  - Text: min/max length, regex pattern
  - Number: min/max values

#### **FormPreview.jsx**
Live form preview:
- Real-time rendering of form as it's being built
- Shows all field types with proper styling
- Demonstrates validation and required fields
- Submit button for visual consistency

### Task Manager

#### **TaskList.jsx**
List of user tasks with:
- Filtering by status, priority, search
- Visual status indicators
- Priority color coding
- Due date highlighting (overdue in red)
- Click to view task details

#### **TaskDetail.jsx**
Detailed task view:
- Task information (description, dates, assignee)
- Dynamic form rendering from task's form schema
- Support for all form field types
- Form data editing
- Task actions sidebar

#### **TaskActions.jsx**
Task action buttons:
- Approve/Reject for approval tasks
- Complete for regular tasks
- Start task (change status to in_progress)
- Add comments to actions
- Task history display
- Disabled state for completed/cancelled tasks

### Monitoring Components

#### **WorkflowList.jsx**
Workflow management interface:
- Grid view of all workflows
- Create new workflow button
- Search workflows
- Edit workflow (opens designer)
- Monitor instances
- Start workflow
- Delete workflow (with confirmation)
- Status badges (draft, active, inactive, archived)

#### **InstanceMonitor.jsx**
Monitor workflow instances:
- Filter by status and search
- Instance list with status icons
- Started by user and timestamps
- Current node display
- Cancel running instances
- Detailed instance modal showing:
  - Status and timeline
  - Current state
  - Instance data
  - Error messages (if any)

#### **Analytics.jsx**
Analytics and performance metrics:
- Date range selector (7, 30, 90, 365 days)
- Workflow performance chart (avg completion time)
- Task completion trend (line chart)
- User activity (tasks completed per user)
- Workflow status distribution (pie chart)
- Summary statistics

## Features

### Styling
- **Tailwind CSS** for all styling
- Responsive design for mobile, tablet, and desktop
- Consistent color scheme using indigo as primary color
- Status-based color coding (green for success, red for errors, etc.)

### Icons
- **Heroicons** for all icons
- Consistent icon usage throughout the application
- 24x24px outline icons

### State Management
- React hooks (useState, useEffect, useCallback)
- No external state management library needed
- Local state for component data

### API Integration
- All components use the API services from `src/services/`
- Proper error handling with toast notifications
- Loading states for async operations

### Notifications
- **react-hot-toast** for user notifications
- Success, error, and info messages
- Auto-dismiss with 3-second timeout

### Data Visualization
- **Recharts** library for charts
- Bar charts, line charts, and pie charts
- Responsive chart sizing
- Custom colors matching theme

### Workflow Designer
- **ReactFlow** library for visual workflow design
- Drag and drop interface
- Node connections with smooth edges
- Mini-map for navigation
- Zoom and pan controls

### Form Validation
- Required field indicators
- Field-specific validation rules
- Help text for user guidance
- Error messages on validation failure

## Routing

The application uses React Router v6:

```javascript
/                          → Redirect to /dashboard
/dashboard                 → UserDashboard
/admin                     → AdminDashboard
/admin/analytics           → Analytics
/workflows                 → WorkflowList
/workflows/new             → WorkflowDesigner (create)
/workflows/:id/edit        → WorkflowDesigner (edit)
/workflows/:id/instances   → InstanceMonitor
/forms/new                 → FormDesigner (create)
/forms/:id/edit            → FormDesigner (edit)
/tasks                     → TaskList
/tasks/:id                 → TaskDetail
```

## Best Practices Implemented

1. **Component Composition**: Small, focused components with clear responsibilities
2. **Prop Types**: Clear prop interfaces for component communication
3. **Error Handling**: Try-catch blocks with user-friendly error messages
4. **Loading States**: Loading indicators during async operations
5. **Accessibility**: Semantic HTML and proper form labels
6. **Code Reusability**: Shared utility functions and consistent patterns
7. **Performance**: Efficient re-rendering with proper dependency arrays
8. **User Feedback**: Toast notifications for all user actions

## Development

### Install Dependencies
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Environment Variables
Create a `.env` file:
```
VITE_API_URL=http://localhost:3001/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

### Core
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.20.1

### UI
- @heroicons/react: ^2.1.1
- @headlessui/react: ^1.7.17
- tailwindcss: ^3.4.0

### Forms & Validation
- react-hook-form: ^7.49.2

### Workflow & Visualization
- reactflow: ^11.10.1
- recharts: ^2.10.3

### Utilities
- axios: ^1.6.2
- date-fns: ^3.0.6
- react-hot-toast: ^2.4.1
- clsx: ^2.1.0

## Future Enhancements

Potential improvements:
1. Real-time updates using WebSockets
2. Advanced workflow versioning
3. Role-based access control UI
4. Workflow templates library
5. Export/import workflows
6. Audit log viewer
7. Advanced analytics with custom date ranges
8. Workflow testing/simulation mode
9. Dark mode support
10. Internationalization (i18n)
