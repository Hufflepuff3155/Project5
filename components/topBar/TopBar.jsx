import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button
} from '@mui/material';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React componment of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appInfo: null,
      contextTitle: 'User List',
      isUploading: false,
      uploadError: '',
      uploadMessage: '',
    };
    this.fileInputRef = React.createRef();
  }

  componentDidMount() {
    this.onAppInfoUpdate();
  }

  onAppInfoUpdate() {
    if (!this.state.appInfo) {
      axios.get('/test/info')
        .then((response) => {
          this.setState({ appInfo: response.data });
        })
        .catch((error) => {
          console.error('Error fetching app info:', error);
          // Optionally set error state
        });
    }
  }

  updateContextTitle(pathname) {
    let contextTitle = 'User List';
    const userRouteMatch = pathname.match(/^\/(users|photos)\/([^/]+)/);

    if (userRouteMatch && window.models && typeof window.models.userModel === 'function') {
      const user = window.models.userModel(userRouteMatch[2]);
      if (user) {
        const fullName = `${user.first_name} ${user.last_name}`;
        contextTitle = userRouteMatch[1] === 'photos' ? `Photos of ${fullName}` : fullName;
      }
    } else if (pathname === '/users' || pathname === '/' || pathname === '') {
      contextTitle = 'User List';
    }

    if (contextTitle !== this.state.contextTitle) {
      this.setState({ contextTitle });
    }
  }

  handleLogout = async () => {
    try {
      await axios.post('/admin/logout');
      if (this.props.onLogout) {
        this.props.onLogout();
      }
      this.props.history.push('/login-register');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  handleAddPhotoClick = () => {
    if (this.fileInputRef.current) {
      this.fileInputRef.current.click();
    }
  };

  handleFileSelected = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('uploadedphoto', file);

    this.setState({ isUploading: true, uploadError: '', uploadMessage: '' });

    axios.post('/photos/new', formData)
      .then(() => {
        this.setState({ isUploading: false, uploadMessage: 'Photo uploaded!' });
        if (this.props.onPhotoUploaded) {
          this.props.onPhotoUploaded();
        }
      })
      .catch((error) => {
        const serverMessage = error.response?.data;
        this.setState({
          isUploading: false,
          uploadError: typeof serverMessage === 'string' ? serverMessage : 'Upload failed',
        });
      })
      .finally(() => {
        if (this.fileInputRef.current) {
          this.fileInputRef.current.value = '';
        }
      });
  };

  render() {
    const { appInfo, contextTitle, isUploading, uploadError, uploadMessage } = this.state;
    const { currentUser } = this.props;

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className="topbar-toolbar">
          <Typography variant="h6" sx={{ flexGrow: 1 }} color="inherit" className="topbar-name">
            {currentUser ? `Hi ${currentUser.first_name}` : 'Please Login'}
          </Typography>

          {appInfo && (
            <Typography variant="h6" sx={{ flexGrow: 1 }} color="inherit" className="topbar-version">
              Version: {appInfo.__v}
            </Typography>
          )}

          <Typography variant="h6" color="inherit" className="topbar-context">
            {contextTitle}
          </Typography>

          {currentUser && (
            <>
              <input
                type="file"
                accept="image/*"
                ref={this.fileInputRef}
                style={{ display: 'none' }}
                onChange={this.handleFileSelected}
              />
              <Button color="inherit" onClick={this.handleAddPhotoClick} disabled={isUploading}>
                {isUploading ? 'Uploading…' : 'Add Photo'}
              </Button>
              <Button color="inherit" onClick={this.handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
        {(uploadError || uploadMessage) && currentUser && (
          <Typography
            variant="caption"
            color={uploadError ? 'error' : 'inherit'}
            className="topbar-upload-status"
            sx={{ padding: '0 16px 8px' }}
          >
            {uploadError || uploadMessage}
          </Typography>
        )}
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
