# GHL Dashboard Fix Scripts - Quick Reference

## 🚨 Main Fix Script
### `fix-all-errors.bat`
**Use this first!** Fixes ALL known errors in one go:
- Type errors (.includes, .toLowerCase)
- Null reference errors (firstName)
- Cleans cache and rebuilds project

```cmd
fix-all-errors.bat
```

## 🔧 Specific Fix Scripts

### `fix-dashboard-null.bat`
Fixes: "Cannot read properties of null (reading 'firstName')"
```cmd
fix-dashboard-null.bat
```

### `fix-lead-finder.bat`
Fixes: "TypeError: e.value.includes is not a function"
```cmd
fix-lead-finder.bat
```

### `clean-and-rebuild.bat`
General cleanup and rebuild (use when in doubt)
```cmd
clean-and-rebuild.bat
```

## 🧪 Test Scripts

### `test-dashboard.bat`
Tests if the dashboard API is working correctly
```cmd
test-dashboard.bat
```

### `test-search.bat`
Tests the lead finder search functionality
```cmd
test-search.bat
```

### `test-utm.bat`
Tests UTM field discovery
```cmd
test-utm.bat
```

## 📚 Documentation

### `ALL_FIXES_SUMMARY.md`
Complete overview of all fixes applied

### `DASHBOARD_NULL_FIX_SUMMARY.md`
Details about the null reference fix

### `LEAD_FINDER_COMPLETE_GUIDE.md`
Comprehensive guide for lead finder fixes

### `UTM_ERROR_FIX_SUMMARY.md`
Information about UTM field type fixes

## 🚀 Quick Start After Errors

1. **Run the main fix**:
   ```cmd
   fix-all-errors.bat
   ```

2. **Start the server**:
   ```cmd
   npm start
   ```

3. **If errors persist, test specific components**:
   ```cmd
   test-dashboard.bat
   test-search.bat
   ```

## 💡 Prevention Tips

1. Always use the type-safe utilities:
   ```typescript
   import { safeIncludes, isValidString } from '@/utils/field-type-safety';
   ```

2. Check for null before accessing properties:
   ```typescript
   const name = contact?.firstName || 'Unknown';
   ```

3. Validate field types before string operations:
   ```typescript
   if (typeof value === 'string' && value.includes('search')) { }
   ```

---

Remember: When in doubt, run `fix-all-errors.bat` - it handles everything!
