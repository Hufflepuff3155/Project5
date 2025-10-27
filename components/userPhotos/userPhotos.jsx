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
    );
  }
}

export default UserPhotos;