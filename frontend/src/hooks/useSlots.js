import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const useSlots = (date, timezone) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date || !timezone) {
      setSlots([]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .getSlots(date, timezone)
      .then((res) => {
        if (isMounted) {
          setSlots(res.data?.slots || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load available slots.');
          setSlots([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [date, timezone]);

  return { slots, loading, error };
};
