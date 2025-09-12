import type { Story, StoryDefault } from "@ladle/react";
import { useState } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { Button } from "@/components/ui/button";

export default {
  title: "veritas/common/ConfirmationDialog",
} satisfies StoryDefault;

// Interactive story for testing the dialog
export const Interactive: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string>("");

  const handleClose = () => {
    setIsOpen(false);
    setLastAction("Dialog closed");
  };

  const handleCancel = () => {
    setIsOpen(false);
    setLastAction("Cancel clicked");
  };

  const handleConfirm = () => {
    setIsOpen(false);
    setLastAction("Confirm clicked");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">ConfirmationDialog Interativo</h3>
        <p className="text-sm text-muted-foreground">
          Teste o componente ConfirmationDialog com diferentes conteúdos
        </p>
      </div>

      {/* Dialog Controls */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Controles do Dialog</h4>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            size="sm"
          >
            Abrir Dialog
          </Button>
        </div>
      </div>

      {/* Action Log */}
      <div className="space-y-2">
        <h4 className="text-md font-medium">Log de Ações</h4>
        <div className="text-sm text-muted-foreground">
          <p><strong>Última ação:</strong> {lastAction || "Nenhuma"}</p>
        </div>
      </div>

      {/* Dialog Component */}
      <ConfirmationDialog
        isOpen={isOpen}
        description="Are you sure you want to cancel this verification? If you cancel, everything done so far will be lost."
        confirmText="Cancel Verification"
        cancelText="Close"
        onClose={handleClose}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </div>
  );
};
