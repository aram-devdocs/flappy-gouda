import { DEFAULT_COLORS, drawCloudsPrerendered, prerenderCloud } from '@repo/engine';
import type { Cloud } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useMemo } from 'react';
import { CanvasStage } from '../../CanvasStage';

function makeCloud(x: number, y: number, w: number): Cloud {
  return { x, y, w, speed: 0.2, _canvas: null, _pad: 0, _logW: 0, _logH: 0 };
}

function makePrerenderedCloud(x: number, y: number, w: number): Cloud {
  const c = makeCloud(x, y, w);
  prerenderCloud(c, 1, DEFAULT_COLORS);
  return c;
}

function SingleCloudPreview({ cloudWidth }: { cloudWidth: number }) {
  const cloud = useMemo(() => makePrerenderedCloud(60, 30, cloudWidth), [cloudWidth]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawCloudsPrerendered(ctx, [cloud]);
    },
    [cloud],
  );

  return (
    <CanvasStage width={200} height={100} backgroundColor={DEFAULT_COLORS.light} draw={draw} />
  );
}

function CloudRowPreview() {
  const clouds = useMemo(
    () => [
      makePrerenderedCloud(10, 15, 60),
      makePrerenderedCloud(90, 30, 80),
      makePrerenderedCloud(200, 10, 50),
      makePrerenderedCloud(280, 35, 70),
    ],
    [],
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawCloudsPrerendered(ctx, clouds);
    },
    [clouds],
  );

  return <CanvasStage width={380} height={80} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

const meta: Meta<typeof SingleCloudPreview> = {
  title: 'Canvas Assets/Cloud',
  component: SingleCloudPreview,
  argTypes: {
    cloudWidth: { control: { type: 'range', min: 30, max: 150, step: 5 } },
  },
};

export default meta;

export const SingleCloud: StoryObj<typeof SingleCloudPreview> = {
  args: { cloudWidth: 80 },
};

export const CloudRow: StoryObj<typeof CloudRowPreview> = {
  render: () => <CloudRowPreview />,
};
