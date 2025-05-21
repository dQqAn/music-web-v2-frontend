'use client';

import { useRouter } from 'next/navigation'
import CustomButton from './button/CustomButton';
import styles from './Navbar.module.css'

export default function Navbar() {
  const router = useRouter()
  const handleClick = () => {
    router.push('/dashboard')
  }

  return (
    <nav className={styles.nav}>
      <div>
        <CustomButton text="Dashboard" onClickAction={handleClick} />
      </div>
    </nav>
  );
}
