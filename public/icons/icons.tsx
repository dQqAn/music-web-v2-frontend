import { icons } from "lucide-react"
import { DynamicIcon } from "lucide-react/dynamic"

type IconButtonProps = {
    iconName: string
    className: string
}

export default function IconButton({ iconName, className }: IconButtonProps) {
    return (
        <button
            className={`${className}`}>
            <DynamicIcon name={`${iconName as keyof typeof icons}` as any} size={32} />
        </button>
    )
}