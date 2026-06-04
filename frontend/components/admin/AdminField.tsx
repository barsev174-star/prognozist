type AdminFieldProps = {
  label: string;
  children: React.ReactNode;
};

export function AdminField({ label, children }: AdminFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

export const inputClassName = "rounded-md border border-black/10 bg-white px-3 py-2 text-sm";

