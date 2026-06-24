import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Patient {
  _id: string;
  name: string;
  mobileNumber?: string;
  priorityLevel: 'NORMAL' | 'PRIORITY' | 'CRITICAL';
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'NO_SHOW';
  tokenNumber: number;
}

export interface QueueState {
  currentToken: number | null;
  averageWaitTime: number;
  patientsWaiting: number;
  queue: Patient[];
}

let socket: Socket;

export const useQueue = () => {
  const [queueState, setQueueState] = useState<QueueState>({
    currentToken: null,
    averageWaitTime: 8,
    patientsWaiting: 0,
    queue: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:5000');
    }

    const fetchInitialState = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/queue/state');
        const data = await res.json();
        setQueueState(data);
      } catch (err) {
        console.error('Error fetching queue state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialState();

    socket.on('QUEUE_UPDATED', (newState: QueueState) => {
      setQueueState(newState);
    });

    return () => {
      socket.off('QUEUE_UPDATED');
    };
  }, []);

  const callNext = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/queue/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': 'admin@claritiq.com' }
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to call next');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const undoLastCall = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/queue/undo-last-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': 'admin@claritiq.com' }
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to undo');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { queueState, loading, callNext, undoLastCall };
};
