import { NavLink } from 'react-router-dom'
import styles from './PageHeader.module.css'

interface Props {
  title: string
  subtitle?: React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.topRow}>
        <h1 className={styles.title}>{title}</h1>
        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
          >
            Test
          </NavLink>
          <NavLink
            to="/mapper"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
          >
            Mapper
          </NavLink>
        </nav>
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
