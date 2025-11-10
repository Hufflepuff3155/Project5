import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import axios from 'axios';
import './userList.css';

/**
 */
export default function UserList() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    axios.get('/user/list')
      .then((response) => {
        if (isMounted) {
          setUsers(response.data);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('UserList fetch error:', err);

        if (isMounted) {
          setError(`${err.response.status} ${err.response.statusText || 'Request failed'}`);
          setUsers([]); // keeps UI rendering even if error
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