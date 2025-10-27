<<<<<<< HEAD
import React from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { Link } from 'react-router-dom';
=======
// components/userDetail/userDetail.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import FetchModel from '../../lib/fetchModelData';
>>>>>>> 8ecec784b0fc3252065be7d929b0d7e0d729b67e
import './userDetail.css';

/**
 * Uses FetchModel('/user/:id') instead of window.models.userModel()
 */
<<<<<<< HEAD
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined
    };
  }

  componentDidMount() {
    const userId = this.props.match.params.userId;
    this.loadUser(userId);
  }

  componentDidUpdate(prevProps) {
    const newUserId = this.props.match.params.userId;
    if (prevProps.match.params.userId !== newUserId) {
      this.loadUser(newUserId);
    }
  }

  loadUser(userId) {
    const user = window.models.userModel(userId);
    this.setState({ user });

    if (user && this.props.changeMainContent) {
      const main_content = user.first_name + " " + user.last_name;
      this.props.changeMainContent(main_content);
    }
  }

  render() {
    const { user } = this.state;

    if (!user) {
      return <Typography>Loading user details...</Typography>;
    }

    return (
      <div>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Location:</strong> {user.location}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Occupation:</strong> {user.occupation}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Description:</strong> {user.description}
            </Typography>
          </CardContent>
        </Card>
        <div style={{ marginTop: '16px' }}>
          <Button 
            variant="contained" 
            color="primary"
            component={Link}
            to={`/photos/${user._id}`}
          >
            View Photos
          </Button>
        </div>
      </div>
=======
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
>>>>>>> 8ecec784b0fc3252065be7d929b0d7e0d729b67e
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