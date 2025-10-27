import React, { useEffect, useState } from 'react';
import { Button, ImageList, ImageListItem, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import FetchModel from '../../lib/fetchModelData';
import './userPhotos.css';

/**
 * UserPhotos
 * Functional component that fetches and displays photos for a user.
 */
export default function UserPhotos() {
  const { userId } = useParams();
  const [photos, setPhotos] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setPhotos(null);
    setUser(null);
    setError(null);

    FetchModel(`/photosOfUser/${userId}`)
      .then(({ data }) => {
        if (!alive) return;
        setPhotos(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0 && data[0].user) {
          setUser(data[0].user);
        } else {
          setUser({ first_name: 'Unknown', last_name: '' });
        }
      })
      .catch((e) => {
        console.error('UserPhotos fetch error:', e);
        if (!alive) return;
        setError(`${e.status || ''} ${e.statusText || 'Request failed'}`);
      });

    return () => {
      alive = false;
    };
  }, [userId]);

  if (error) {
    return (
      <Typography variant="body1" sx={{ color: 'error.main' }}>
        Error loading photos: {error}
      </Typography>
    );
  }

  if (photos === null) {
    return <Typography variant="body1">Loading photos...</Typography>;
  }

  const firstName = user && user.first_name ? user.first_name : '';
  const lastName = user && user.last_name ? user.last_name : '';

  return (
    <div className="user-photos">
      <div style={{ marginBottom: 16 }}>
        <Button variant="contained" component={Link} to={`/users/${userId}`}>
          User Detail
        </Button>
      </div>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Photos of {firstName} {lastName}
      </Typography>

      <ImageList variant="masonry" cols={1} gap={8}>
        {photos.map((photo) => (
          <div key={photo._id} className="photo-item">
            <Typography variant="body2" className="photo-date">
              {photo.date_time}
            </Typography>
            <ImageListItem>
              <img
                src={`images/${photo.file_name}`}
                srcSet={`images/${photo.file_name}`}
                alt={photo.file_name}
                loading="lazy"
              />
            </ImageListItem>
            <div className="photo-comments">
              {photo.comments && photo.comments.length > 0 ? (
                photo.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <div className="comment-header">
                      <Link className="comment-author" to={`/users/${comment.user._id}`}>
                        {comment.user.first_name} {comment.user.last_name}
                      </Link>
                      <span className="comment-date">{comment.date_time}</span>
                    </div>
                    <Typography variant="body2" className="comment-text">
                      {comment.comment}
                    </Typography>
                  </div>
                ))
              ) : (
                <Typography variant="body2" className="no-comments">
                  No comments
                </Typography>
              )}
            </div>
          </div>
        ))}
      </ImageList>
    </div>
  );
}
