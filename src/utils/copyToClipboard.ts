interface Props {
    text: string;
}
export const copyToClipboard = ({ text }: Props) => {
    navigator.clipboard.writeText(text)
}