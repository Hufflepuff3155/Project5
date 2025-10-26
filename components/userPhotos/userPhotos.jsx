import React from 'react';
import {
  Typography
} from '@mui/material';
import './userPhotos.css';

/**
 * Define UserPhotos, a React component of project #5
 */
class UserPhotos extends React.Component {
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
    if (window.models && typeof window.models.userModel === 'function') {
      const userModel = window.models.userModel(match.params.userId);
      this.setState({ user: userModel });
    } else {
      this.setState({ user: null });
    }
  }

  render() {
    const { user } = this.state;

    if (!user) {
      return (
        <Typography variant="body1">
          User not found.
        </Typography>
      );
    }

    const {
      first_name: firstName,
      last_name: lastName,
    } = user;

    return (
      <div className="user-photos">
        <Typography variant="h4" className="user-photos__title">
          Photos of {firstName} {lastName}
        </Typography>
        <Typography variant="body1">
          {/* Photo rendering will be implemented later; placeholder keeps layout consistent. */}
          Photo gallery coming soon.
        </Typography>
      </div>
    );
  }
}

export default UserPhotos;
