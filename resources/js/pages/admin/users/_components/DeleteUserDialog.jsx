import { router } from "@inertiajs/react";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, TriangleAlert } from "lucide-react";

export function DeleteUserDialog({ user, open, onOpenChange }) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setProcessing(true);
        router.delete(route("admin.users.destroy", user.id), {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-sm">
                <AlertDialogHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                        <TriangleAlert className="h-5 w-5 text-destructive" />
                    </div>
                    <AlertDialogTitle className="mt-2 text-base font-semibold">
                        Delete User
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-foreground">
                            {user?.name}
                        </span>
                        ? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleDelete}
                        disabled={processing}
                        variant="destructive"
                    >
                        {processing && (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        )}
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
