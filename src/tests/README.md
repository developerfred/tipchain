# TipChain Test Suite

Comprehensive test suite for the TipChain platform using Vitest, React Testing Library, and modern testing practices.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
src/tests/
├── unit/              # Unit tests for utilities and services
│   └── lib/          # Library function tests
│       ├── utils.test.ts
│       └── divvi.test.ts
├── components/        # Component tests
│   ├── Button.test.tsx
│   ├── Badge.test.tsx
│   └── NetworkBadge.test.tsx
├── integration/       # Integration tests
└── setup.ts          # Test setup and global mocks
```

## Coverage

Current test coverage:
- **88 tests passing**
- Unit tests for utility functions (formatAmount, shortenAddress, validation, etc.)
- Component tests for UI components (Button, Badge, NetworkBadge)
- Service layer tests (Divvi referral tracking)

## Writing Tests

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '@/lib/utils';

describe('Feature Name', () => {
  it('should do something', () => {
    expect(yourFunction('input')).toBe('expected');
  });
});
```

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { YourComponent } from '@/components/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
```

## Mocking

Global mocks are configured in `setup.ts` for:
- `wagmi` - Web3 hooks
- `@reown/appkit/react` - Wallet connection
- `window.matchMedia` - Media queries
- `IntersectionObserver` - Intersection observation

## Best Practices

1. **Descriptive test names**: Use clear, action-oriented descriptions
2. **Arrange-Act-Assert**: Structure tests in three clear phases
3. **Test behavior, not implementation**: Focus on user-facing behavior
4. **Avoid test interdependence**: Each test should be independent
5. **Mock external dependencies**: Use mocks for APIs, wallet connections, etc.

## CI/CD Integration

Tests are run automatically on:
- Pull requests
- Pre-commit hooks (via Husky)
- Before builds

## Future Improvements

- [ ] Increase coverage to 80%+
- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Add performance tests
- [ ] Test accessibility compliance
