import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
}
from '@mui/material';
import { Link } from 'react-router-dom';
import './userList.css';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    };
  }

  componentDidMount() {
    // Fetch user list from window.models.userListModel()
    const users = window.models.userListModel();
    this.setState({ users });
  }

  render() {
    const { users } = this.state;

    return (
      <div>
        <List component="nav">
          {users.map((user, index) => (
            <React.Fragment key={user._id}>
              <ListItem
                button
                component={Link}
                to={`/users/${user._id}`}
              >
                <ListItemText 
                  primary={`${user.first_name} ${user.last_name}`} 
                />
              </ListItem>
              {index < users.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </div>
    );
  }
}

export default UserList;
