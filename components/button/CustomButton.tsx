'use client'

import styles from './CustomButton.module.css'

interface CustomButtonProps {
  text: string
  onClickAction: () => void
  type?: 'button' | 'submit' | 'reset'
}

export default function CustomButton({ text, onClickAction, type = 'button' }: CustomButtonProps) {
  return (
    <button className={styles.button} onClick={onClickAction} type={type}>
      {text}
    </button>
  )
}
