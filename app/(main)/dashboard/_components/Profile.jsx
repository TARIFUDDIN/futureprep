import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Credits from "./Credits";

function ProfileDialog({children}) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-lg bg-white dark:bg-gray-900 border-0 shadow-2xl">
                <DialogHeader>
                    <DialogTitle>Profile & Credits</DialogTitle>
                    <DialogDescription>
                        Manage your account and subscription
                    </DialogDescription>
                </DialogHeader>
                <Credits/>
            </DialogContent>
        </Dialog>
    );
}

export default ProfileDialog;