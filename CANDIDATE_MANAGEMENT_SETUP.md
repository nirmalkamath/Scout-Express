# Candidate Management System Setup

This document provides instructions for integrating the independent Candidate Management system into your existing Scout Express application.

## Files Created

### Controllers
- `src/controllers/candidateManagementController.ts` - Main controller with all candidate management logic

### Services
- `src/services/candidateManagementService.ts` - Service layer for database operations

### Routes
- `src/routes/candidateManagementRoutes.ts` - Route definitions
- `src/routes/candidateManagementIndex.ts` - Route mounting configuration

### Views
- `views/admin/candidate-management/candidate-list.ejs` - Candidates list page
- `views/admin/candidate-management/candidate-view.ejs` - Candidate details page
- `views/admin/candidate-management/candidate-edit.ejs` - Candidate edit page
- `views/admin/candidate-management/error.ejs` - Error page

### Assets
- `public/css/candidate-management.css` - Dedicated CSS styles

### Integration
- `src/server-integration/candidateManagementServer.ts` - Server integration helper

## Installation Steps

### Step 1: Add to Your Main Server File

In your main server file (likely `src/index.ts`), add the following:

```typescript
import { setupCandidateManagement } from './server-integration/candidateManagementServer';

// After creating your Express app
setupCandidateManagement(app);
```

### Step 2: Update Database Connection

The candidate management system expects a database connection. Ensure your database setup matches the expected structure:

```typescript
// Make sure your db/mysql.ts exports the database connection
export { db } from './mysql';
```

### Step 3: Add Types (if needed)

Add the Candidate type to your types file if it doesn't exist:

```typescript
// src/types/index.ts
export interface Candidate {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  professional_headline?: string;
  professional_summary?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  isd_code?: string;
  city?: string;
  district?: string;
  country?: string;
  state?: string;
  pin_code?: string;
  photo?: string;
  education?: any[];
  work_experience?: any[];
  skills?: any[];
  job_preferences?: any;
}
```

### Step 4: Update Admin Sidebar

The admin sidebar has already been updated to link to `/admin/candidates`. No changes needed.

### Step 5: Build and Restart

```bash
# Build the TypeScript files
npm run build

# Restart your server
npm start
```

## Features Included

### 1. Candidate List
- View all candidates with pagination
- Search by name, email, or professional headline
- Filter by status (pending, approved, rejected, under review)
- Export to CSV
- Quick actions (View, Edit, Approve, Delete)

### 2. Candidate Details View
- Complete candidate profile
- Professional summary
- Work experience history
- Education background
- Skills overview
- Job preferences
- Contact information

### 3. Candidate Edit
- Edit all candidate information
- Add/remove work experience entries
- Add/remove education entries
- Add/remove skills
- Update job preferences
- Update status

### 4. Status Management
- Quick status updates (approve/reject)
- Bulk status changes
- Status-based filtering

### 5. Export Functionality
- Export filtered candidates to CSV
- Include all basic information

## Route Structure

```
GET    /admin/candidates              - List candidates
GET    /admin/candidates/:id          - View candidate
GET    /admin/candidates/:id/edit     - Edit candidate form
POST   /admin/candidates/:id/update   - Update candidate
PUT    /admin/candidates/:id/status   - Update candidate status
DELETE /admin/candidates/:id          - Delete candidate
GET    /admin/candidates/export       - Export to CSV
```

## Database Tables Required

The system expects the following tables to exist:

1. `candidates` - Main candidate information
2. `education` - Candidate education details
3. `work_experience` - Candidate work experience
4. `skills` - Candidate skills
5. `job_preferences` - Candidate job preferences

## Security Considerations

- All routes include admin authentication middleware
- Input validation is implemented
- SQL injection protection through parameterized queries
- XSS protection through proper escaping

## Troubleshooting

### If routes don't work:
1. Ensure the server integration is properly added to your main server file
2. Check that the routes are mounted correctly
3. Verify the database connection is working

### If views don't render:
1. Ensure the view paths are correct
2. Check that the admin header and sidebar includes are working
3. Verify the CSS file is being loaded

### If database operations fail:
1. Check database connection
2. Verify table structures match expected format
3. Check database credentials and permissions

## Independence

This system is designed to be completely independent:
- No modifications to existing controllers
- No modifications to existing routes
- No modifications to existing services
- Uses separate view files
- Uses separate CSS file
- Can be easily removed if needed

## Support

If you encounter any issues, you can:
1. Check the browser console for JavaScript errors
2. Check the server logs for database errors
3. Verify all files are created in the correct locations
4. Ensure the build process completed successfully
