import React, { useEffect, useState } from 'react';
import {
  Button,
  ImageList,
  ImageListItem,
  TextField,
  Typography
} from '@mui/material';
import { Link, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import './userPhotos.css';

/**
 * UserPhotos
 * Functional component that fetches and displays photos for a user.
 */
export default function UserPhotos(props) {
  const { userId } = useParams();
  const location = useLocation();
  const [photos, setPhotos] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [targetPhotoId, setTargetPhotoId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromQuery = params.get('photoId');
    setTargetPhotoId(idFromQuery);
  }, [location.search]);

  useEffect(() => {
    
    if (!targetPhotoId || !photos || !Array.isArray(photos) || photos.length === 0) {
      return;
    }
    const element = document.getElementById(`photo-${targetPhotoId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [targetPhotoId, photos]);

  useEffect(() => {
    let alive = true;
    setPhotos(null);
    setUser(null);
    setError(null);

    axios
      .get(`/photosOfUser/${userId}`)
      .then((response) => {
        if (!alive) return;

        const data = response.data;
        setPhotos(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0 && data[0].user) {
          setUser(data[0].user);
        } else {
          setUser({ first_name: 'Unknown', last_name: '' });
        }
      })
      .catch((err) => {
        console.error('UserPhotos fetch error:', err);
        if (!alive) return;
        setError(`${err.status || ''} ${err.statusText || 'Request failed'}`);
      });

    return () => {
      alive = false;
    };
  }, [userId]);

  const handleNewCommentChange = (evt) => {
    setNewCommentText(evt.target.value);
  };

  const submitComment = async (photoId) => {
    const text = (newCommentText || '').trim();
    if (!text) {
      return;
    }

    try {
      const body = { comment: text };
      await axios.post(`/commentsOfPhoto/${photoId}`, body);
      setNewCommentText('');

      const response = await axios.get(`/photosOfUser/${userId}`);
      const data = response.data;
      setPhotos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('submitComment error:', err);
      setError('Unable to post comment.');
    }
  };

  if (error) {
    return (
      <Typography variant="body1" color="error">
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
          <div
            key={photo._id}
            id={`photo-${photo._id}`}
            className="photo-item"
          >
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
                      <Typography variant="subtitle2">
                        {comment.user.first_name} {comment.user.last_name}
                      </Typography>
                      <Typography variant="caption" className="comment-date">
                        {comment.date_time}
                      </Typography>
                    </div>
                    <Typography variant="body2" className="comment-text">
                      {comment.comment}
                    </Typography>
                  </div>
                ))
              ) : (
                <Typography variant="body2" className="comment-empty">
                  No comments yet.
                </Typography>
              )}

              {props.loggedInUser ? (
                <div className="comment-form">
                  <TextField
                    label="Add a comment"
                    value={newCommentText}
                    onChange={handleNewCommentChange}
                    fullWidth
                    multiline
                    minRows={1}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => submitComment(photo._id)}
                    style={{ marginTop: 8 }}
                  >
                    Post Comment
                  </Button>
                </div>
              ) : (
                <Typography variant="body2">
                  Please login to add comments.
                </Typography>
              )}
            </div>
          </div>
        ))}
      </ImageList>
    </div>
  );
}
