import React, { useEffect, useState } from 'react';
import {
  Button,
  ImageList,
  ImageListItem,
  TextField,
  Typography
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './userPhotos.css';

/**
 * UserPhotos
 * Functional component that fetches and displays photos for a user.
 */
export default function UserPhotos(props) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    let alive = true;
    setPhotos(null);
    setUser(null);
    setError(null);

    axios.get(`/photosOfUser/${userId}`)
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
    const text = (newCommentText || "").trim();
    if (!text) {
      return;
    }

    try {
      const res = await fetch(`/commentsOfPhoto/${photoId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: text }),
      });

      if (res.status === 400) {
        return;
      }
      if (res.status === 401) {
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to add comment");
      }

      const createdComment = await res.json();

      // Update local UI immediately: append createdComment to the right photo's comments
      setPhotos((prevPhotos) => {
        return (prevPhotos || []).map((p) => {
          if (String(p._id) === String(photoId)) {
            const comments = Array.isArray(p.comments) ? p.comments.slice() : [];
            comments.push(createdComment);
            return { ...p, comments };
          }
          return p;
        });
      });
      setNewCommentText('');
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

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
            <div className="comments-section">
              <Typography variant="h6">Comments</Typography>

              {Array.isArray(photo.comments) && photo.comments.length > 0 ? (
                photo.comments.map((c) => (
                  <div key={c._id || c.date_time} className="comment">
                    <Typography variant="body2">
                      <strong>{c.user_id || (c.user && c.user.first_name) || "User"}</strong>{" "}
                      <em>({c.date_time})</em>: {c.comment}
                    </Typography>
                  </div>
                ))
              ) : (
                <Typography variant="body2">No comments yet.</Typography>
              )}

              {/* add comment ui*/}
              {props.currentUser ? (
                <div style={{ marginTop: 8 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={4}
                    placeholder="Write a comment..."
                    value={newCommentText}
                    onChange={handleNewCommentChange}
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
                <Typography variant="body2">Please login to add comments.</Typography>
              )}
            </div>
          </div>
        ))}
      </ImageList>
    </div>
  );
}
