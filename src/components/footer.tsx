export function Footer() {
    return (
        <footer className="border-t py-6 md:py-0">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    &copy; {new Date().getFullYear()} xCodeChecker. All rights reserved.
                </p>
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
                    Built with Next.js and Tailwind CSS
                </p>
            </div>
        </footer>
    );
}