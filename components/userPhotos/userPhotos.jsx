// components/userPhotos/userPhotos.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import FetchModel from '../../lib/fetchModelData';
import './userPhotos.css';

/**
 * Refactor to use FetchModel instead of window.models.userModel()
 */
export default function UserPhotos() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setUser(null);
    setError(null);

    // Fetch user’s photo data
    FetchModel(`/photosOfUser/${userId}`)
      .then(({ data }) => {
        if (!alive) return;
        if (Array.isArray(data) && data.length > 0 && data[0].user) {
          setUser(data[0].user);
        } else {
          setUser({ first_name: 'Unknown', last_name: '' });
        }
      })
      .catch((e) => {
        console.error('UserPhotos fetch error:', e);
        if (!alive) {
          return;
        }
        setError(`${e.status || ''} ${e.statusText || 'Request failed'}`);
        setUser(false);
      });

    return () => {
      alive = false;
    };
  }, [userId]);

  if (user === null && !error) {
    return <Typography variant="body1">Loading photos…</Typography>;
  }

  if (error || user === false) {
    return (
      <Typography variant="body1" sx={{ color: 'error.main' }}>
        Error loading photos: {error || 'Unknown error'}
      </Typography>
    );
  }

  const { first_name: firstName, last_name: lastName } = user;

  return (
    <div className="user-photos">
      <Typography variant="h4" className="user-photos__title">
        Photos of {firstName} {lastName}
      </Typography>
      <Typography variant="body1">
        {}
        Photo gallery coming soon.
      </Typography>
    </div>
  );
}