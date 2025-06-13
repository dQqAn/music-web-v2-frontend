'use client';

import { useRouter } from 'next/navigation'
import CustomButton from './button/CustomButton';
import styles from '@/public/styles/navbar.module.css'
import UserSection from './UserSection';
import { headerContent } from '@/public/scripts/ts/header';
import { Input } from "@/components/ui/input"

export default function Navbar() {
  const router = useRouter()
  const handleClick = (path: string) => {
    router.push(path)
  }

  headerContent()

  return (
    <nav className={styles.nav}>
      <div className={styles.wrapper}>
        <div>
          <Input id="searchInput" type="text" placeholder="Search sound..." />
          <div id="searchResults"></div>
        </div>

        <div>

          <CustomButton text="Homepage" onClickAction={() => handleClick('/')} />
        </div>

        <div id="user_section">
          <UserSection />
        </div>
      </div>
    </nav>
  );
}
