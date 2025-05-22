'use client'
import { useEffect } from 'react'

export function useDropdownToggle(buttonId: string, dropdownId: string) {
  useEffect(() => {
    const toggle = document.getElementById(buttonId)
    const dropdown = document.getElementById(dropdownId)

    if (toggle && dropdown) {
      const handler = () => {
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none"
      }
      toggle.addEventListener("click", handler)
      return () => toggle.removeEventListener("click", handler)
    }
  }, [buttonId, dropdownId])
}
