# CSS Organization Structure

All components and pages now have their own dedicated CSS files for better maintainability.

## 📁 CSS Files Structure

### **Theme & Base**
- `theme.css` - CSS variables, colors, fonts, shadows
- `animations.css` - Keyframes and animation utilities
- `glassmorphism.css` - Glass effect utilities

### **Layout Components**
- `navbar.css` - Navigation bar styles
- `footer.css` - Footer styles

### **Shared Components**
- `cards.css` - Card component styles
- `skeletons.css` - Loading skeleton styles
- `toast.css` - Toast notification styles  
- `badges.css` - Badge and tag styles
- `empty-states.css` - Empty states and error boundaries
- `search-filter.css` - Search filter component (Meqasa style)
- `sidebars.css` - All sidebar components (Blog, Agent, Home, Insights, Property Message)
- `my-properties.css` - My Properties component styles

### **Page Styles**
- `home.css` - Home page styles
- `properties.css` - Properties page styles
- `blog.css` - Blog page styles
- `agents.css` - Agents page styles
- `insights.css` - Insights page styles
- `profile.css` - Profile page styles
- `messenger.css` - Messenger page styles
- `auth.css` - Authentication pages (Login, Register, etc.)
- `createproperty.css` - Create Property page styles
- `favorites.css` - Favorites page styles
- `pages.css` - Generic page utilities

## 🎯 Benefits

✅ **Better Organization** - Each component/page has its own CSS file
✅ **Easier Maintenance** - Find and update styles quickly
✅ **Reduced Conflicts** - Isolated styles per component
✅ **Improved Performance** - Only load needed styles
✅ **Better Collaboration** - Multiple developers can work simultaneously

## 📝 Import Order in index.css

1. External libraries (Swiper)
2. Theme & base styles
3. Layout components (Navbar, Footer)
4. Shared components
5. Page-specific styles

## 🔧 How to Use

When working on a specific component or page:
1. Locate the corresponding CSS file in `src/styles/`
2. Make your changes
3. No need to search through large CSS files

## 📌 Notes

- All CSS files use CSS custom properties from `theme.css`
- Responsive breakpoints are consistent across files
- Follow BEM naming convention for new styles
- Use existing CSS variables for colors and spacing
