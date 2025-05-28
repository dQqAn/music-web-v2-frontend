import { ReactNode } from 'react'

export default function ProfileLayout({ children }: { children: ReactNode }) {
    return (
        <div style={{ }}>
            <div>{children}</div>
            <h1>Profile Section</h1>
        </div>
    )
}
