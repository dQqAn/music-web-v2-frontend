import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div style={{}}>
            <div>{children}</div>
            <h1>Dashboard Section</h1>
        </div>
    )
}
