'use client';

import { useRouter } from 'next/navigation'
import CustomButton from './button/CustomButton';
import styles from '@/public/styles/navbar.module.css'
import UserSection from './UserSection';
import { headerContent } from '@/public/scripts/ts/header';
import { Input } from "@/components/ui/input"
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const router = useRouter()
  const handleClick = (path: string) => {
    router.push(path)
  }

  headerContent()

  return (
    <nav className={styles.nav} style={{ zIndex: 9999 }}>
      <div className={styles.wrapper}>
        <div>
          <Input id="searchInput" type="text" placeholder="Search sound..." />
          <div id="searchResults"></div>
        </div>

        <div>
          <CustomButton text="Homepage" onClickAction={() => handleClick('/')} />
        </div>

        <div>
          <ModeToggle />
        </div>

        <div id="user_section">
          <UserSection />
        </div>
      </div>
    </nav>
  );
}

function ModeToggle() {
  const { setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
