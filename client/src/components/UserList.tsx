import type { User } from '../types';
import styles from './UserList.module.css';

interface Props {
  members: User[];
  currentUser: User;
}

export const UserList = ({ members, currentUser }: Props) => (
  <aside className={styles.aside}>
    <p className={styles.heading}>Online — {members.length}</p>
    <ul className={styles.list}>
      {members.map((member) => (
        <li key={member.id} className={styles.member}>
          <div className={styles.avatar}>
            {member.username[0].toUpperCase()}
          </div>
          <span className={styles.name}>
            {member.username}
            {member.id === currentUser.id && (
              <span className={styles.you}> (you)</span>
            )}
          </span>
          <span className={styles.dot} />
        </li>
      ))}
    </ul>
  </aside>
);