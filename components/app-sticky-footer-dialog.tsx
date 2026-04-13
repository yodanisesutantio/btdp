import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DialogStickyFooterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogTitle?: string | React.ReactNode;
  dialogDescription?: string | React.ReactNode;
  content?: React.ReactNode;
  dialogAction?: React.ReactNode;
}

export function DialogStickyFooter(props: DialogStickyFooterProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={`text-xl`}>
            {props.dialogTitle ?? "Sticky Footer"}
          </DialogTitle>
          {props.dialogDescription && (
            <DialogDescription>{props.dialogDescription}</DialogDescription>
          )}
        </DialogHeader>
        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          {props.content ?? "No content available."}
        </div>
        <DialogFooter>
          {props.dialogAction ?? (
            <DialogClose>
              <Button variant="outline">Close</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
