import { useTranslation } from "@/hooks/useTranslation";
import React from "react";

export const AuthHeader = ({ title, description, showDescription = true }) => {
    return (
        <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold">{title}</h2>
            {showDescription && (
                <p className="text-muted-foreground mt-2 text-sm">
                    {description}
                </p>
            )}
        </div>
    );
};

export const BgImage = ({ type = "login" }) => {
    const { lang } = useTranslation();

    const getImage = () => {
        return "url('/assets/images/cashier.jpg')";
    };

    const getTitle = () => {
        if (type === "login") {
            return lang("welcome_back");
        }
        return lang("create_account");
    };

    return (
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: getImage() }}
            >
                <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/50 to-transparent" />
            </div>

            <div className="relative z-20 flex items-center text-lg font-medium">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-6 w-6"
                >
                    <path
                        d="M12 2L3 7v7c0 5 9 8 9 8s9-3 9-8V7l-9-5z"
                        opacity="0.5"
                    />

                    <rect x="7" y="7" width="10" height="12" rx="1" ry="1" />
                    <line x1="9" y1="10" x2="15" y2="10" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="16" x2="12" y2="16" />
                </svg>
                <span className="text-white">Jaga Modal</span>
            </div>

            {/* <div className="relative z-20 mt-8">
                <h1 className="text-3xl font-bold text-white">{getTitle()}</h1>
            </div> */}

            <div className="relative z-20 mt-auto">
                <blockquote className="space-y-2">
                    <p className="text-lg text-white/90">
                        &ldquo;{lang("app_quote")}&rdquo;
                    </p>
                    <footer className="text-sm text-white/70">
                        - {lang("quote_author")}
                    </footer>
                </blockquote>
            </div>
        </div>
    );
};

export const GoogleAccount = () => {
    const { lang } = useTranslation();

    return (
        <>
            <div className="flex items-center justify-between mt-4">
                <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/4"></span>
                <div className="text-xs text-center text-gray-500 uppercase dark:text-gray-400">
                    {lang("or_continue_with")}
                </div>
                <span className="w-1/5 border-b dark:border-gray-400 lg:w-1/4"></span>
            </div>

            <a
                href="/auth-google-redirect"
                className="flex items-center justify-center mt-4 text-gray-600 transition-colors duration-300 transform border rounded-lg dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
                <div className="px-4 py-2">
                    <svg className="w-6 h-6" viewBox="0 0 40 40">
                        <path
                            d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                            fill="#FFC107"
                        />
                        <path
                            d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
                            fill="#FF3D00"
                        />
                        <path
                            d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
                            fill="#4CAF50"
                        />
                        <path
                            d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                            fill="#1976D2"
                        />
                    </svg>
                </div>
                <span className="w-5/6 px-4 py-3 font-bold text-center">
                    {lang("sign_up_with_google", "Sign up with Google")}
                </span>
            </a>
        </>
    );
};
