import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BaseFieldProps = {
  label: string;
  error?: string;
  hint?: string;
};

type InputFieldProps = BaseFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false;
  };

type TextareaFieldProps = BaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
  };

type FieldProps = InputFieldProps | TextareaFieldProps;

const controlClass =
  "mt-2 min-h-11 min-w-0 w-full rounded-lg border-slate-300 bg-white px-3 py-2.5 text-base text-ink-950 shadow-soft transition-colors placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50";

export function Field(props: FieldProps) {
  const { label, error, hint, className, multiline, ...controlProps } = props;
  const describedBy = error ? `${controlProps.id}-error` : hint ? `${controlProps.id}-hint` : undefined;

  return (
    <div className="block">
      <label htmlFor={controlProps.id} className="text-sm font-medium text-ink-900">{label}</label>
      {multiline ? (
        <textarea
          className={cn(controlClass, "min-h-24 resize-y", className)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...(controlProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={cn(controlClass, className)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...(controlProps as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error ? (
        <span id={`${controlProps.id}-error`} className="mt-2 block text-[13px] text-red-700">
          {error}
        </span>
      ) : hint ? (
        <span id={`${controlProps.id}-hint`} className="mt-2 block text-[13px] leading-5 text-slate-500">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
