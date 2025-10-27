import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
<<<<<<< HEAD
}
from '@mui/material';
import { Link } from 'react-router-dom';
=======
  Typography,
} from '@mui/material';
import FetchModel from '../../lib/fetchModelData';
>>>>>>> 8ecec784b0fc3252065be7d929b0d7e0d729b67e
import './userList.css';

/**
 * UserList component — now uses FetchModel('/user/list')
 * instead of window.models.userListModel()   (PBI-6)
 */
<<<<<<< HEAD
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
=======
export default function UserList() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    FetchModel('/user/list')
      .then(({ data }) => {
        if (isMounted) {
          setUsers(data);
          setError(null);
        }
      })
      .catch((e) => {
        console.error('UserList fetch error:', e);
        if (isMounted) {
          setError(`${e.status || ''} ${e.statusText || 'Request failed'}`);
          setUsers([]); // keeps UI rendering even if error (501)
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (users === null) {
    return <Typography sx={{ p: 2 }}>Loading users…</Typography>;
  }

  if (error) {
    return (
      <Typography sx={{ p: 2, color: 'error.main' }}>
        Error loading users: {error}
      </Typography>
>>>>>>> 8ecec784b0fc3252065be7d929b0d7e0d729b67e
    );
  }

  if (users.length === 0) {
    return <Typography sx={{ p: 2 }}>No users found.</Typography>;
  }

  return (
    <div>
      <List component="nav" className="user-list">
        {users.map((u, idx) => (
          <React.Fragment key={u._id}>
            <ListItem button component={Link} to={`/users/${u._id}`}>
              <ListItemText primary={`${u.first_name} ${u.last_name}`} />
            </ListItem>
            {idx < users.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}