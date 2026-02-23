import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { FlappyNatureGame } from '../FlappyNatureGame';

const mockGradient = { addColorStop: vi.fn() };

const mockCtx = {
  createLinearGradient: vi.fn(() => mockGradient),
  scale: vi.fn(),
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  ellipse: vi.fn(),
  quadraticCurveTo: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  drawImage: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 10 })),
  setTransform: vi.fn(),
};

beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    mockCtx as unknown as CanvasRenderingContext2D,
  );
  // jsdom does not implement URL.createObjectURL; stub it so the engine's
  // image-loading code does not throw an unhandled rejection.
  URL.createObjectURL = vi.fn(() => 'blob:mock');
});

describe('FlappyNatureGame', () => {
  it('renders without crashing', () => {
    const { container } = render(<FlappyNatureGame />);
    expect(container.firstChild).not.toBeNull();
  });

  it('displays the title "Flappy Nature"', () => {
    render(<FlappyNatureGame />);
    // The title text appears in a <span>; use getAllByText to handle any
    // duplicate matches (e.g. the SVG aria-label) and assert at least one hit.
    const matches = screen.getAllByText('Flappy Nature');
    expect(matches.length).toBeGreaterThan(0);
  });
});
