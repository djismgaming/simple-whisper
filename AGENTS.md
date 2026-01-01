# AGENTS.md

This file contains guidelines for agentic coding agents working on the simple-whisper codebase.

## Project Overview

Simple webUI for whisper.cpp server that accepts audio/video files and returns transcription results. Built with pure HTML, CSS, and JavaScript (no build tools or frameworks).

## Commands

This project has no build, lint, or test commands as it uses vanilla JavaScript without a build pipeline.

To test changes:
- Open `index.html` in a browser directly
- Use browser DevTools for debugging
- Test against a running whisper.cpp server on `localhost:8080`

## Code Style Guidelines

### General Principles
- Keep code simple and functional
- Avoid unnecessary abstractions for this small project
- Use vanilla JavaScript (no external dependencies unless explicitly required)
- No comments unless explicitly requested by user

### HTML
- Use semantic HTML5 elements
- IDs and classes: kebab-case (e.g., `file-input`, `submit-btn`)
- Indentation: 4 spaces
- Always include viewport meta tag for responsiveness
- Link external CSS/JS files at the end of body for performance

### CSS
- Use BEM-like naming: block, modifier (e.g., `.container`, `.card`, `.loading`)
- Properties: lowercase, semicolon after each property
- Selectors: avoid overly nested selectors (max 2-3 levels)
- Use CSS variables for repeated values if needed
- Mobile-first approach with `@media` queries at the end
- Gradient backgrounds: `linear-gradient(135deg, ...)`
- Transitions: 0.2-0.3s for interactive elements

### JavaScript
- Use `const` for variables that won't be reassigned
- Use camelCase for variable and function names (e.g., `fileInput`, `showError`)
- Function declarations for named functions (not arrow functions)
- Event listeners can use anonymous functions for simple callbacks
- Use `document.addEventListener('DOMContentLoaded', ...)` for initialization
- Use `async/await` for asynchronous operations
- Error handling: try-catch with meaningful error messages

### Error Handling
- Display user-friendly error messages in the UI
- Always reset UI state in `finally` blocks
- Validate user input before API calls
- Check response.ok and handle HTTP errors
- Show errors in dedicated error container, not console only

### API Integration
- Use `fetch()` for HTTP requests
- Use `FormData` for multipart/form-data requests
- Hardcoded parameters: `temperature="0.0"`, `temperature_inc="0.2"`
- Variable parameter: `model` (from dropdown)
- Endpoint: `http://localhost:8080/v1/audio/transcriptions`
- Method: POST
- Expected response: JSON with `text` field

### UI/UX Patterns
- Disable submit button during loading
- Show loading spinner with animation
- Display results preserving line breaks (`white-space: pre-wrap`)
- Provide copy-to-clipboard functionality
- Show success feedback briefly (2 seconds)
- Hide previous results/errors before new operations
- Responsive design: stack elements on mobile (max-width: 600px)

### File Organization
- `index.html`: Main structure
- `style.css`: All styles (no separate CSS files unless growing)
- `script.js`: All JavaScript logic
- Keep related functionality together

### Making Changes
- When modifying existing code, match existing style
- When adding features, follow established patterns
- Test in browser before marking as complete
- Ensure responsive behavior on mobile devices
- Verify error handling for edge cases

### Common Patterns

DOM element selection:
```javascript
const element = document.getElementById('element-id');
element.classList.add('class-name');
element.textContent = 'text';
```

Event listeners:
```javascript
element.addEventListener('click', function() {
    // handler logic
});
```

Form handling:
```javascript
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    // validation
    // API call
    // result/error handling
});
```

Showing/hiding elements:
```javascript
container.classList.add('show'); // display: block
container.classList.remove('show'); // display: none
```

## Browser Compatibility

Target modern browsers (Chrome, Firefox, Safari, Edge). No legacy browser support needed.

## Testing Manual

Manual testing checklist:
1. Upload audio/video file
2. Select model option
3. Submit and verify transcription appears
4. Test copy to clipboard
5. Test error handling (no file, server down)
6. Test mobile responsiveness
7. Test keyboard navigation