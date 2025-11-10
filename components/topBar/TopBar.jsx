import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography
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
    };
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

  render() {
    if (this.state.appInfo === undefined) {
      return (<div />);
    } else {
      const { contextTitle, appInfo } = this.state;

      return (
        <AppBar className="topbar-appBar" position="absolute">
          <Toolbar className="topbar-toolbar">
            <Typography variant="h6" sx={{ flexGrow: 1 }} color="inherit" className="topbar-name">Heather Lassiter{' '}</Typography>

            {appInfo && (
              <Typography variant="h6" sx={{ flexGrow: 1 }} color="inherit" className="topbar-version">
                Version: {this.state.appInfo.__v}
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
}

export default withRouter(TopBar);
