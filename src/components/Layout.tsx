import { NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'

export function Layout() {
  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <NavLink to="/" end className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}>
          Test
        </NavLink>
        <NavLink to="/mapper" className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}>
          Mapper
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
