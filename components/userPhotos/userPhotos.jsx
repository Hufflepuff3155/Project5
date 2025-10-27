<<<<<<< HEAD
import React from 'react';
import {
  Button,
  ImageList,
  ImageListItem,
  Typography
} from '@mui/material';
import { Link } from 'react-router-dom';
import './userPhotos.css';

/**
 * Define UserPhotos, a React component of project #5
 * Displays all photos for a specific user with their comments
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id: undefined,
      photos: undefined
    };
  }

  componentDidMount() {
    const new_user_id = this.props.match.params.userId;
    this.handleUserChange(new_user_id);
  }

  componentDidUpdate() {
    const new_user_id = this.props.match.params.userId;
    const current_user_id = this.state.user_id;
    if (current_user_id !== new_user_id) {
      this.handleUserChange(new_user_id);
    }
  }

  handleUserChange(user_id) {
    const photos = window.models.photoOfUserModel(user_id);
    const user = window.models.userModel(user_id);

    this.setState({
      user_id: user_id,
      photos: photos
    });

    if (user && this.props.changeMainContent) {
      const main_content = "Photos of " + user.first_name + " " + user.last_name;
      this.props.changeMainContent(main_content);
    }
  }

  render() {
    return this.state.user_id && this.state.photos ? (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <Button 
            variant="contained" 
            component={Link}
            to={`/users/${this.state.user_id}`}
          >
            User Detail
          </Button>
        </div>
        <ImageList variant="masonry" cols={1} gap={8}>
          {this.state.photos.map((photo) => (
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
                        <Link 
                          className="comment-author" 
                          to={`/users/${comment.user._id}`}
                        >
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
    ) : (
      <div>Loading photos...</div>
=======
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
>>>>>>> 8ecec784b0fc3252065be7d929b0d7e0d729b67e
    );
  }

<<<<<<< HEAD
export default UserPhotos;
=======
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
>>>>>>> 8ecec784b0fc3252065be7d929b0d7e0d729b67e
