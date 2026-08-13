import { PaywallContent } from "#/components/paywall-content";
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog";

type PaywallDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function PaywallDialog({ open, onOpenChange }: PaywallDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-sm">
				<DialogTitle className="sr-only">MyWeight Premium</DialogTitle>
				<PaywallContent />
			</DialogContent>
		</Dialog>
	);
}

export default PaywallDialog;
