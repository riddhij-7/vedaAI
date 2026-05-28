import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { useRouter } from 'next/navigation';
import { getAssignment } from '@/lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';

export function useAssignmentSocket(assignmentId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const { setProgress, setPaper, clearGeneration } = useStore();
  const router = useRouter();

  const startPolling = (id: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const data = await getAssignment(id);
        if (data.status === 'processing') {
          setProgress(data.progress || 50, 'processing');
        }
        if (data.status === 'done' && data.paper) {
          clearInterval(pollRef.current!);
          setPaper(id, data.paper);
          setProgress(100, 'done');
          clearGeneration();
          router.push(`/assignments/${id}`);
        }
        if (data.status === 'failed') {
          clearInterval(pollRef.current!);
          setProgress(0, 'failed');
        }
      } catch {}
    }, 2000); // poll every 2 seconds
  };

  useEffect(() => {
    if (!assignmentId) return;

    // Try WebSocket first
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'subscribe', assignmentId }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'status') setProgress(msg.progress ?? 0, msg.status);
        if (msg.type === 'result' && msg.paper) {
          clearInterval(pollRef.current!);
          setPaper(assignmentId, msg.paper);
          setProgress(100, 'done');
          clearGeneration();
          router.push(`/assignments/${assignmentId}`);
        }
        if (msg.type === 'error') setProgress(0, 'failed');
      };

      // If WS fails to connect, fall back to polling
      ws.onerror = () => startPolling(assignmentId);
      ws.onclose = () => {
        if (pollRef.current === null) startPolling(assignmentId);
      };
    } catch {
      startPolling(assignmentId);
    }

    // Always start polling as safety net
    startPolling(assignmentId);

    return () => {
      wsRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [assignmentId]);
}