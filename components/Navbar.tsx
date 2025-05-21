'use client';

import { useRouter } from 'next/navigation'
import CustomButton from './button/CustomButton';
import styles from './Navbar.module.css'

export default function Navbar() {
  const router = useRouter()
  const handleClick = (path: string) => {
    router.push(path)
  }

  return (
    <nav className={styles.nav}>
  <div className={styles.wrapper}>
    <div>
      <input
        type="text"
        id="searchInput"
        placeholder="Search sound..."
      />
      <div id="searchResults"></div>
    </div>

    <div>
      
    <CustomButton text="Homepage" onClickAction={() => handleClick('/')} />
    </div>

    <div>
      <CustomButton text="Dashboard" onClickAction={() => handleClick('/dashboard')} />
    </div>

    <div id="user_section"></div>
  </div>
</nav>
  );
}
