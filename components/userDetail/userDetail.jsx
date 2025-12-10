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
  const [mostCommentedPhoto, setMostCommentedPhoto] = useState(null);

  useEffect(() => {
    let alive = true;

    setUser(null);
    setError(null);
    setMostRecentPhoto(null);
    setMostCommentedPhoto(null);

    axios
      .get(`/user/${userId}`)
      .then((response) => {
        if (!alive) return;
        setUser(response.data);
        if (changeMainContent) {
          changeMainContent(
            `${response.data.first_name} ${response.data.last_name}`
          );
        }
      })
      .catch((e) => {
        console.error('UserDetail fetch error:', e);
        if (!alive) return;
        setError(
          `${e.response?.status || ''} ${
            e.response?.statusText || 'Request failed'
          }`
        );
        setUser(false);
      });

    axios.get(`/mostRecentPhoto/${userId}`)
      .then((response) => {
        if (!alive) return;
        setMostRecentPhoto(response.data || false);
      })
      .catch((e) => {
        console.error('MostRecentPhoto fetch error:', e);
        if (!alive) return;
        setMostRecentPhoto(false);
      });

    axios
      .get(`/mostCommentedPhoto/${userId}`)
      .then((response) => {
        if (!alive) return;
        setMostCommentedPhoto(response.data || false);
      })
      .catch((e) => {
        console.error('MostCommentedPhoto fetch error:', e);
        if (!alive) return;
        setMostCommentedPhoto(false);
      });

    return () => {
      alive = false;
    };
  }, [userId, changeMainContent]);

  if (error) {
    return (
      <Typography variant="body1" color="error">
        Error loading user: {error}
      </Typography>
    );
  }

  if (user === null) {
    return <Typography variant="body1">Loading user...</Typography>;
  }

  if (user === false) {
    return (
      <Typography variant="body1" color="error">
        User not found.
      </Typography>
    );
  }

  const {
    first_name: firstName,
    last_name: lastName,
    location,
    occupation,
    description
  } = user;

  const _id = user._id;

  return (
    <div className="user-detail">
      <div className="user-detail__info">
        <Typography variant="h4" className="user-detail__name">
          {firstName} {lastName}
        </Typography>

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
        {}
        {mostRecentPhoto && mostRecentPhoto !== false && (
          <div
            className="user-detail__most-recent"
            onClick={(event) => {
              event.stopPropagation();
              window.location.hash = `#/photos/${_id}?photoId=${mostRecentPhoto._id}`;
            }}
          >
            <Typography variant="subtitle2" className="user-detail__label">
              Most Recent Photo:
            </Typography>

            <div
              className="user-detail__most-recent-content"
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 8
              }}
            >
              <img
                src={`images/${mostRecentPhoto.file_name}`}
                alt="Most recent"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 4
                }}
              />

              <Typography variant="body2" className="user-detail__value">
                {new Date(mostRecentPhoto.date_time).toLocaleString()}
              </Typography>
            </div>
          </div>
        )}

        {mostCommentedPhoto && mostCommentedPhoto !== false && (
          <div
            className="user-detail__most-commented"
            onClick={(event) => {
              event.stopPropagation();
              window.location.hash = `#/photos/${_id}?photoId=${mostCommentedPhoto._id}`;
            }}
          >
            <Typography variant="subtitle2" className="user-detail__label">
              Most Commented Photo:
            </Typography>
            <div className="user-detail__most-commented-content">
              <img
                src={`images/${mostCommentedPhoto.file_name}`}
                alt="Most commented"
                className="user-detail__thumb"
              />
              <Typography variant="body2" className="user-detail__value">
                {mostCommentedPhoto.commentCount} comment
                {mostCommentedPhoto.commentCount === 1 ? '' : 's'}
              </Typography>
            </div>
          </div>
        )}

        View Photos
      </Button>
    </div>
  );
}
