import React from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { Link } from 'react-router-dom';
import './userDetail.css';


/**
 * Define UserDetail, a React component of project #5
 */
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
    );
  }
}

export default UserDetail;
