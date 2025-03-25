/**
 * Formats a Unix timestamp into a readable date string
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDate(timestamp?: string): string {
    if (!timestamp) return 'N/A';

    // Convert string timestamp to number
    const timestampNum = parseInt(timestamp, 10);

    // Check if it's a valid number
    if (isNaN(timestampNum)) return 'Invalid date';

    // Create a Date object (Unix timestamp is in seconds, Date expects milliseconds)
    const date = new Date(timestampNum * 1000);

    // Format the date as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}