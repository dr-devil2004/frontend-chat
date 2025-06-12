import './UsersList.css'

interface User {
  id: string
  username: string
}

interface UsersListProps {
  users: User[]
}

function UsersList({ users }: UsersListProps) {
  return (
    <div className="users-list">
      {users.length === 0 ? (
        <div className="no-users">No users online</div>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id} className="user-item">
              <div className="user-status-indicator"></div>
              <span className="user-name">{user.username}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default UsersList 