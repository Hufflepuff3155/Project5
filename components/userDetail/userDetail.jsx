import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import './userDetail.css';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    this.loadUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.loadUser();
    }
  }

  loadUser() {
    const { match } = this.props;
    const userModel = window.models.userModel(match.params.userId);
    this.setState({ user: userModel });
  }

  render() {
    const { user } = this.state;

    if (!user) {
      return (
        <Typography variant="body1" className="user-detail__empty">
          User not found.
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
}

export default UserDetail;
