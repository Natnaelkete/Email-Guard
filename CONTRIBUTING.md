# Contributing to Email Guard

Thank you for your interest in contributing to Email Guard!

## How to Contribute

### Reporting Bugs

**Before submitting a bug report:**
1. Check existing issues to avoid duplicates
2. Verify the bug exists in the latest version
3. Collect relevant information

**Bug Report Template:**
```
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Chrome Version: 
- Extension Version:
- OS:
- Email Client: Gmail/Outlook
```

### Suggesting Features

Open an issue with:
- Feature description
- Use case
- Proposed solution
- Alternatives considered

### Code Contributions

#### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/email-guard.git
   cd email-guard
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow coding standards
   - Write clear commit messages
   - Test thoroughly

4. **Submit a Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots if UI changes

#### Commit Message Guidelines

Follow Conventional Commits:

```
<type>(<scope>): <subject>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests

**Examples:**
```
feat(detection): add URL shortener detection
fix(gmail): resolve sender extraction issue
docs(readme): update installation instructions
```

#### Coding Standards

**JavaScript Style:**
- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Add JSDoc comments for functions
- Keep functions small and focused
- Use meaningful variable names

### Testing

**Before Submitting:**
1. Test on Gmail and Outlook
2. Test all modified features
3. Check browser console for errors
4. Verify no performance issues

## Development Setup

1. Clone the repository
2. Load in Chrome (`chrome://extensions/`)
3. Make changes
4. Test thoroughly

## Pull Request Process

1. Ensure PR is focused (one feature/fix per PR)
2. Update documentation if needed
3. Test thoroughly
4. Describe your changes clearly
5. Wait for approval

## Security

- Never commit sensitive data
- Report security issues privately
- Follow secure coding practices

---

**Thank you for contributing to Email Guard! 🛡️**
