# Fix Admin Dashboard 403 Errors - Cookie Auth Only
Status: 🔄 In Progress

## Steps:
### 1. Create Custom Cookie JWT Authentication (Backend)
- [x] Create `backend/auctions/authentication.py` with `CookieJWTAuthentication` class
- [ ] Reads `access_token` from cookies
- [ ] Validates JWT and sets `request.user`
- [ ] Add to `settings.py` DRF `DEFAULT_AUTHENTICATION_CLASSES`

### 2. Update Backend Views Permissions
- [x] Remove manual `check_admin()` calls
- [x] Use `@permission_classes([IsAuthenticated, IsAdminUser])` consistently
- [x] Test all admin endpoints (/admin/users/, deposits, etc.)

### 3. Frontend Minor Fixes
- [x] Ensure api.ts has `credentials: "include"` (already good)
- [x] Add auth check in AdminDashboard redirect to /admin-login if 403 persists

### 4. Test Flow
- [ ] Create admin user: `python manage.py createsuperuser`
- [ ] Login at /admin-login
- [ ] Verify AdminDashboard loads data without 403
- [ ] Check Network tab: cookies sent, 200 responses

### 5. Completion
- [ ] attempt_completion once verified working
