import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { formatMoney, parseMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label className="uppercase tracking-[0.14em]">{label}</Label>
      {children}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  className,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}) {
  return (
    <Field label={label} className={className}>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Field label={label}>
      <Textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md bg-cream px-3 text-sm text-ink shadow-[var(--shadow-border)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function MoneyInput({
  value,
  onChange,
  className,
  placeholder = "0",
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(value ? String(value) : "");

  useEffect(() => {
    if (!focused) setText(value ? String(value) : "");
  }, [value, focused]);

  return (
    <Input
      inputMode="decimal"
      className={cn("tabular text-right", className)}
      value={focused ? text : value ? formatMoney(value) : ""}
      placeholder={placeholder}
      onFocus={() => {
        setFocused(true);
        setText(value ? String(value) : "");
      }}
      onBlur={() => {
        setFocused(false);
        onChange(parseMoney(text));
      }}
      onChange={(e) => {
        setText(e.target.value);
        onChange(parseMoney(e.target.value));
      }}
    />
  );
}

export function MoneyField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <MoneyInput value={value} onChange={onChange} />
    </Field>
  );
}

export function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 hover:bg-paper-2/60">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      <span className="text-sm text-ink">{label}</span>
    </label>
  );
}

export function MiniSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-10 w-full rounded-md bg-cream px-2 text-sm text-ink shadow-[var(--shadow-border)]",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o || "—"}
        </option>
      ))}
    </select>
  );
}

export function AddRowButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 text-sm font-medium text-navy-mid underline-offset-4 hover:underline"
    >
      {children}
    </button>
  );
}
