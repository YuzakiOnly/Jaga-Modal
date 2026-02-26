export default function NotFound({ status = 404 }) {
    const config = {
        403: {
            title: "Access Forbidden",
            description: "You don't have permission to access this page.",
        },
        404: {
            title: "Page Not Found",
            description: "The page you're looking for doesn't exist.",
        },
        500: {
            title: "Server Error",
            description:
                "Something went wrong on our end. Please try again later.",
        },
    };

    const { title, description } = config[status] ?? {
        title: "Something Went Wrong",
        description: "An unexpected error occurred.",
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
            <p className="text-8xl font-black text-primary/10 select-none">
                {status}
            </p>
            <h1 className="text-2xl font-bold mt-2">{title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
            <a
                href="/"
                className="mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
                Back to home
            </a>
        </div>
    );
}
