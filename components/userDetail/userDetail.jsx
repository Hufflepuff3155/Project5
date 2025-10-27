import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import FetchModel from '../../lib/fetchModelData';
import './userDetail.css';

/**
 * UserDetail - functional component using FetchModel
 */
export default function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setUser(null);
    setError(null);

    FetchModel(`/user/${userId}`)
      .then(({ data }) => {
        if (alive) setUser(data);
      })
      .catch((e) => {
        console.error('UserDetail fetch error:', e);
        if (alive) {
          setError(`${e.status || ''} ${e.statusText || 'Request failed'}`);
          setUser(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [userId]);

  if (user === null && !error) {
    return (
      <Typography variant="body1" className="user-detail__empty">
        Loading user…
      </Typography>
    );
  }

  if (error || user === false) {
    return (
      <Typography variant="body1" className="user-detail__empty">
        Error loading user: {error || 'Unknown error'}
      </Typography>
    );
  }

  const {
    _id,
    first_name: firstName,
    last_name: lastName,
    location,
    description,
    occupation,
  } = user;

  return (
    <div className="user-detail">
      <Typography variant="h4" className="user-detail__name">
        {firstName} {lastName}
      </Typography>

      <div className="user-detail__info">
        <div className="user-detail__row">
          <Typography variant="subtitle2" className="user-detail__label">
            Location:
          </Typography>
          <Typography variant="body1" className="user-detail__value">
            {location}
          </Typography>
        </div>

        <div className="user-detail__row">
          <Typography variant="subtitle2" className="user-detail__label">
            Occupation:
          </Typography>
          <Typography variant="body1" className="user-detail__value">
            {occupation}
          </Typography>
        </div>

        <div className="user-detail__row user-detail__row--description">
          <Typography variant="subtitle2" className="user-detail__label">
            Description:
          </Typography>
          <Typography
            variant="body1"
            className="user-detail__value"
            component="span"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      </div>

      <Button
        className="user-detail__photos-button"
        component={Link}
        to={`/photos/${_id}`}
        variant="contained"
        color="primary"
      >
        View Photos
      </Button>
    </div>
  );
}