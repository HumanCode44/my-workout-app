import { useState, useEffect, useRef, useCallback } from 'react';

export function useRestTimer(onComplete?: () => void) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isRunning || seconds <= 0) {
      if (isRunning && seconds <= 0) {
        setIsRunning(false);
        onCompleteRef.current?.();
      }
      return;
    }
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [isRunning, seconds]);

  const start = useCallback((duration: number) => {
    setSeconds(duration);
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
  }, []);

  return { seconds, isRunning, start, reset };
}
