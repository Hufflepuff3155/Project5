import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@mui/material';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/LoginRegister';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      main_content: undefined,
      currentUser: null,
    };
  }

  changeMainContent = (main_content) => {
    this.setState({ main_content: main_content });
  };

  //LoginRegister
  setCurrentUser = (user) => {
    this.setState({ currentUser: user });
  }

  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar main_content={this.state.main_content}
          currentUser={this.state.currentUser}
          onLogout={() => this.setState({ currentUser: null })}
          />
        </Grid>
        <div className="main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper className="main-grid-item">

            {this.state.currentUser ? (   
              <UserList />
            ) : (
              <Typography variant="body1">
                Please login to view users.
              </Typography>
            )} 

          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Switch>

            {/* LOGIN REGISTER VIEW */}
            <Route
              path="/login-register" 
              render={(props) => (
                <LoginRegister {...props} onLoginSuccess={this.setCurrentUser} />
              )}
            />
            {/* HOME */}
            <Route exact path="/"
              render={() => (
                this.state.currentUser ? ( 
                  <Typography variant="body1">
                    Welcome to your photosharing app!
                  </Typography>
                ) : (
                  <Redirect to="/login-register" /> 
                )
              )}
            />

              {/* USER DETAIL */}
              <Route path="/users/:userId"
                render={ props =>
                  this.state.currentUser ? ( 
                    <UserDetail {...props} changeMainContent={this.changeMainContent} />
                  ) : (
                    <Redirect to="/login-register" />
                  )
                }
              />

              {/* USER PHOTOS */}
              <Route path="/photos/:userId"
                render ={ props =>
                  this.state.currentUser ? (
                    <UserPhotos {...props} changeMainContent={this.changeMainContent} />
                  ) : (
                    <Redirect to="/login-register" />
                  )
                }
              />

              {/* USER LIST PAGE */}
              <Route path="/users"
                render={(props) =>
                  this.state.currentUser ? (
                    <UserList {...props} />
                  ) : (
                    <Redirect to="/login-register" />
                  )
                }
              />

            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
