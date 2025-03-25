import { Check, Copy } from "lucide-react"
import { Button } from "../ui/button"

export const ButtonCopy = ({ onClick, isCopied }: { onClick: () => void, isCopied: boolean }) => {
    return (
        <Button variant="ghost" size="icon" onClick={(e) => {
            e.stopPropagation()
            onClick()
        }}>
            {isCopied ? < Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy username</span>
        </Button>
    )
}