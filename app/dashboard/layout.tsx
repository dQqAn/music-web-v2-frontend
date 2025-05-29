import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
        </div>
    )
}
