"use client";

type ModelProps = {
  onConfirm: () => void;
  onCancel: () => void;
};
export default function Model({ onConfirm, onCancel }: ModelProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-95 shadow-lg">
        <h2 className="text-lg font-bold">
          Are you sure you want to delete the trip?
        </h2>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="rounded border  p-2 bg-red-400 hover:bg-red-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded border  p-2 bg-slate-400 hover:bg-slate-500 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
