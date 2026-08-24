import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { num: string } }) {
  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      let lastCount = -1;
      const tick = async () => {
        try {
          const shipment = await prisma.shipment.findUnique({
            where: { trackingNumber: params.num },
            include: { events: { orderBy: { occurredAt: 'asc' } } },
          });
          if (!shipment) {
            send({ error: 'not_found' });
          } else if (shipment.events.length !== lastCount) {
            lastCount = shipment.events.length;
            send({ shipment });
          }
        } catch {
          /* transient */
        }
      };

      await tick();
      interval = setInterval(tick, 3000);
    },
    cancel() {
      if (interval) clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
