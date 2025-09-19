# Todo App

A modern, responsive React todo application with comprehensive task management features including drag-and-drop, tagging, and persistent storage.

## Features

- ✅ Add, edit, complete, and delete todo items
- 🖱️ Drag and drop to reorder todos for prioritization
- 🏷️ Tag system with color-coded labels for organization
- 📱 Responsive design that works on desktop and mobile
- 💾 Persistent storage using localStorage - data survives browser sessions
- 🎨 Beautiful dark mode UI with hover effects
- ✨ Collapsible "Done" section with strikethrough text
- 🔄 Mark items as done/undone with visual feedback
- 🔗 Automatic URL detection and linking in todo text
- 📋 Tag-filtered lists showing todos organized by categories
- ⚡ Navigation menu with tag management
- 🎯 Three-column responsive layout for tag-organized views

## Live Demo

[View the live app](https://cbonade.github.io/work-to-do)

## Changelog

### v2.0.0 (2025-09-19) - Tag Management & Enhanced Layout
**Major Features:**
- 🏷️ **Tag System**: Complete tag management with color-coded labels
  - Create, edit, and delete tags with custom colors
  - Assign multiple tags to todos
  - Tag selector in add todo form with visual feedback
- 🎯 **Enhanced Layout**: Improved organization and user experience
  - Navigation menu with sticky positioning
  - Collapsible done section (collapsed by default)
  - Tag-filtered lists in responsive 3-column grid layout
  - Read-only tag lists showing todos organized by categories
- ⚡ **Edit Functionality**: Edit existing todos and their tags
  - Modal-based editing interface
  - Tag assignment and removal in edit mode
  - Extensible design for future todo properties

**Technical Improvements:**
- Modal-based UI design avoiding page navigation
- Comprehensive localStorage persistence for tags
- CSS Grid responsive layout system
- Enhanced dark mode styling throughout
- Proper contrast calculation for tag colors

### v1.1.0 (2025-01-XX) - URL Linking & Dark Mode
**Features:**
- 🔗 **URL Detection**: Automatic URL recognition and linking in todo text
- 🎨 **Dark Mode**: Complete dark theme implementation
  - Traditional dark color scheme
  - Improved visual hierarchy
  - Enhanced hover effects and transitions

**Technical Improvements:**
- Regex-based URL parsing and link generation
- Updated CSS with dark mode color palette
- Improved accessibility with proper contrast ratios

### v1.0.0 (2025-01-XX) - Initial Release
**Core Features:**
- ✅ **Basic Todo Management**: Add, complete, delete todos
- 🖱️ **Drag & Drop**: Reorder todos with @dnd-kit library
- 💾 **Persistent Storage**: localStorage integration for data persistence
- 📱 **Responsive Design**: Mobile-friendly layout
- ✨ **Done Section**: Separate section for completed todos with strikethrough
- 🔄 **Status Toggle**: Mark todos as done/undone

**Technical Foundation:**
- React 19 with functional components and hooks
- @dnd-kit for drag-and-drop functionality (React 19 compatible)
- GitHub Pages deployment with automated build process
- Create React App foundation with modern tooling

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

To deploy to GitHub Pages:

1. Update the `homepage` field in `package.json` with your GitHub username:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/todo-app"
   ```

2. Create a new repository on GitHub named `todo-app`

3. Push your code to GitHub:
   ```bash
   git push origin main
   ```

4. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

5. Enable GitHub Pages in your repository settings and set the source to the `gh-pages` branch

For more deployment options, see: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
