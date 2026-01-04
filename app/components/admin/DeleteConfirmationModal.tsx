import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { Button } from "~/components/ui/Button";
import { TextField } from "~/components/ui/TextField";

export interface DeleteConfirmationModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onConfirm: () => void;
	itemName: string;
	itemType: "note" | "topic";
	warningMessage?: string;
	isDeleting?: boolean;
}

export function DeleteConfirmationModal({
	isOpen,
	onOpenChange,
	onConfirm,
	itemName,
	itemType,
	warningMessage,
	isDeleting = false,
}: DeleteConfirmationModalProps) {
	const [confirmText, setConfirmText] = useState("");
	const isConfirmEnabled = confirmText === itemName && !isDeleting;

	useEffect(() => {
		if (!isOpen) {
			setConfirmText("");
		}
	}, [isOpen]);

	const handleConfirm = () => {
		if (isConfirmEnabled) {
			onConfirm();
		}
	};

	return (
		<ModalOverlay
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			isDismissable={!isDeleting}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
		>
			<Modal className="w-full max-w-md mx-4 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
				<Dialog className="bg-[var(--color-bg)] dark:bg-[var(--color-dark-surface)] rounded-2xl p-6 shadow-2xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] outline-none">
					<div className="flex flex-col gap-4">
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
								<AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
							</div>
							<div className="flex-1 min-w-0">
								<Heading
									slot="title"
									className="font-serif text-xl font-medium text-[var(--color-text)] dark:text-[var(--color-dark-text)] tracking-tight"
								>
									Delete {itemType}
								</Heading>
								<p className="mt-1 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
									This action cannot be undone.
								</p>
							</div>
						</div>

						{warningMessage && (
							<div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
								<p className="text-sm text-amber-800 dark:text-amber-200">
									{warningMessage}
								</p>
							</div>
						)}

						<div className="space-y-2">
							<p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
								To confirm, type{" "}
								<span className="font-medium text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
									{itemName}
								</span>{" "}
								below:
							</p>
							<TextField
								value={confirmText}
								onChange={setConfirmText}
								autoFocus
								isDisabled={isDeleting}
								aria-label="Confirmation text"
							/>
						</div>

						<div className="flex gap-3 pt-2">
							<Button
								variant="secondary"
								onPress={() => onOpenChange(false)}
								isDisabled={isDeleting}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								onPress={handleConfirm}
								isDisabled={!isConfirmEnabled}
								className="flex-1 bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900 disabled:text-red-100"
							>
								{isDeleting ? "Deleting..." : "Delete"}
							</Button>
						</div>
					</div>
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}
