import React from 'react';
import {
  AppBar, Toolbar, Typography, Button
} from '@mui/material';
import axios from 'axios';
import './TopBar.css';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appInfo: null,
      uploadMessage: ''
    };
    this.fileInputRef = React.createRef();
  }

  componentDidMount() {
    axios.get('/test/info')
      .then((response) => this.setState({ appInfo: response.data }))
      .catch(() => {});
  }

  handleLogout = () => {
    const { onLogout } = this.props;
    if (onLogout) {
      onLogout();
    }
  };

  handleAddPhotoClick = () => {
    if (this.fileInputRef.current) {
      this.fileInputRef.current.click();
    }
  };

  handlePhotoSelected = (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const domForm = new FormData();
    domForm.append('uploadedphoto', event.target.files[0]);
    axios.post('/photos/new', domForm)
      .then(() => {
        this.setState({ uploadMessage: 'Photo uploaded!' });
        if (this.props.onPhotoUploaded) {
          this.props.onPhotoUploaded();
        }
      })
      .catch((err) => {
        const msg = err.response?.data || 'Upload failed';
        this.setState({ uploadMessage: msg });
      })
      .finally(() => {
        if (this.fileInputRef.current) {
          this.fileInputRef.current.value = null;
        }
      });
  };

  render() {
    const { main_content: mainContent, currentUser } = this.props;
    const { appInfo, uploadMessage } = this.state;

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className="topbar-toolbar">
          <Typography variant="h6" color="inherit" className="topbar-name">
            PhotoShare
          </Typography>

          {appInfo && (
            <Typography variant="body1" color="inherit" className="topbar-version">
              v{appInfo.__v}
            </Typography>
          )}

          <Typography variant="body1" color="inherit" className="topbar-context">
            {mainContent || ''}
          </Typography>

          <div className="topbar-actions">
            {currentUser ? (
              <>
                <Typography variant="body1" color="inherit" className="topbar-greeting">
                  Hi {currentUser.first_name}
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  ref={this.fileInputRef}
                  style={{ display: 'none' }}
                  onChange={this.handlePhotoSelected}
                />
                <Button color="inherit" size="small" onClick={this.handleAddPhotoClick}>
                  Add Photo
                </Button>
                <Button color="inherit" size="small" onClick={this.handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Typography variant="body1" color="inherit">
                Please Login
              </Typography>
            )}
          </div>
        </Toolbar>
        {uploadMessage && (
          <Typography variant="caption" color="inherit" className="topbar-upload-msg">
            {uploadMessage}
          </Typography>
        )}
      </AppBar>
    );
  }
}

export default TopBar;
