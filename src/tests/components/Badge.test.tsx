import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText(/test badge/i)).toBeInTheDocument();
  });

  it('should render with default variant', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText(/default/i);
    expect(badge).toHaveClass('bg-primary');
  });

  it('should render with secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText(/secondary/i);
    expect(badge).toHaveClass('bg-secondary');
  });

  it('should render with destructive variant', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText(/destructive/i);
    expect(badge).toHaveClass('bg-destructive');
  });

  it('should render with outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText(/outline/i);
    expect(badge).toHaveClass('text-foreground');
  });

  it('should render with success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText(/success/i);
    expect(badge).toHaveClass('bg-green-500');
  });

  it('should render with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText(/warning/i);
    expect(badge).toHaveClass('bg-yellow-500');
  });

  it('should accept custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    expect(screen.getByText(/custom/i)).toHaveClass('custom-badge');
  });

  it('should have rounded-full class for pill shape', () => {
    render(<Badge>Pill</Badge>);
    expect(screen.getByText(/pill/i)).toHaveClass('rounded-full');
  });

  it('should have proper typography classes', () => {
    render(<Badge>Typography</Badge>);
    const badge = screen.getByText(/typography/i);
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-semibold');
  });

  it('should pass through HTML div attributes', () => {
    render(
      <Badge data-testid="test-badge" title="Test Title">
        With Attributes
      </Badge>,
    );
    const badge = screen.getByTestId('test-badge');
    expect(badge).toHaveAttribute('title', 'Test Title');
  });
});
