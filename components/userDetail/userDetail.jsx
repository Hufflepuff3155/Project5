import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import axios from 'axios';
import './userDetail.css';

/**
 * UserDetail - functional component.
 */
export default function UserDetail({ changeMainContent }) {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [mostRecentPhoto, setMostRecentPhoto] = useState(null);


  useEffect(() => {
    let alive = true;
    setUser(null);
    setError(null);
    setMostRecentPhoto(null);

    axios.get(`/user/${userId}`)
      .then((response) => {
        if (alive) {
          setUser(response.data);
          if (changeMainContent) {
            changeMainContent(`${response.data.first_name} ${response.data.last_name}`);
          }
        }
      })
      .catch((e) => {
        console.error('UserDetail fetch error:', e);
        if (alive) {
          setError(`${e.response?.status || ''} ${e.response?.statusText || 'Request failed'}`);
          setUser(false);
        }
      });

      axios.get(`/mostRecentPhotoOfUser/${userId}`)
        .then((response) => {
          if (alive) {
            setMostRecentPhoto(response.data);
          }
        })
        .catch((e) => {
          console.error('Most recent photo fetch error:', e);
          if (alive) {
            setMostRecentPhoto(false);
          }
        });


    return () => {
      alive = false;
    };
  }, [userId, changeMainContent]);

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
        
        {/* Most Recent Photo thumbnail (User Story 1) */}
        {mostRecentPhoto && mostRecentPhoto !== false && (
          <div className="user-detail__most-recent">
            <Typography variant="subtitle2" className="user-detail__label">
              Most Recent Photo:
            </Typography>

            <div
              className="user-detail__most-recent-content"
              style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
            >
              <img
                src={`images/${mostRecentPhoto.file_name}`}
                alt="Most recent"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 4
                }}
              />

              <Typography variant="body2" className="user-detail__value">
                {new Date(mostRecentPhoto.date_time).toLocaleString()}
              </Typography>
            </div>
          </div>
        )}

        
        View Photos
      </Button>
    </div>
  );
}
