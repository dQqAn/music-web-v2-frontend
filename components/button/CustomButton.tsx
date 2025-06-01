'use client'

import styles from '@/public/styles/button.module.css'

interface CustomButtonProps {
  text?: string
  onClickAction: () => void
  type?: 'button' | 'submit' | 'reset'
  children?: React.ReactNode
}

export default function CustomButton({ text, onClickAction, type = 'button', children }: CustomButtonProps) {
  return (
    <button className={styles.button} onClick={onClickAction} type={type}>
      {children ?? text}
    </button>
  )
}
