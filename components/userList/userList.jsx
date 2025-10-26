import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import FetchModel from '../../lib/fetchModelData';
import './userList.css';

/**
 * UserList component — now uses FetchModel('/user/list')
 * instead of window.models.userListModel()   (PBI-6)
 */
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