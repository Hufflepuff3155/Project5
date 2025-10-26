import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import './TopBar.css';
import fetchModel from '../../lib/fetchModelData';

/**
 * Define TopBar, a React componment of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contextTitle: 'User List',
      appInfo: null,
    };
  }

  componentDidMount() {
    this.updateContextTitle(this.props.location.pathname);
    this.loadAppInfo();
  }

  componentDidUpdate(prevProps) {
    const { pathname } = this.props.location;
    if (prevProps.location.pathname !== pathname) {
      this.updateContextTitle(pathname);
    }
  }

  loadAppInfo() {
    if (this.state.appInfo) {
      return;
    }

    fetchModel('/test/info')
      .then((response) => {
        if (response && response.data) {
          this.setState({ appInfo: response.data });
        }
      })
      .catch(() => {
        // Silently ignore failures; TopBar remains functional without version info.
      });
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

  render() {
    const { contextTitle, appInfo } = this.state;

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className="topbar-toolbar">
          <Typography variant="h6" color="inherit" className="topbar-name">
            Heather Lassiter
          </Typography>
          {appInfo && (
            <Typography variant="h6" color="inherit" className="topbar-version">
              Version: {appInfo.__v}
            </Typography>
          )}
          <Typography variant="h6" color="inherit" className="topbar-context">
            {contextTitle}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
