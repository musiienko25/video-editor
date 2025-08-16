"use client";

import * as React from "react";
import { Circle } from "lucide-react";

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface RadioGroupItemProps {
  value: string;
  id: string;
  className?: string;
  children: React.ReactNode;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ value, onValueChange, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`grid gap-2 ${className || ""}`}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && typeof child.props === 'object' && child.props !== null) {
            return React.cloneElement(child, {
              checked: (child.props as any).value === value,
              onValueChange,
            } as any);
          }
          return child;
        })}
      </div>
    );
  }
);

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps & { checked?: boolean; onValueChange?: (value: string) => void }>(
  ({ value, id, className, children, checked, onValueChange, ...props }, ref) => {
    return (
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          ref={ref}
          type="radio"
          value={value}
          id={id}
          checked={checked}
          onChange={() => onValueChange?.(value)}
          className="sr-only"
          {...props}
        />
        <div className={`aspect-square h-4 w-4 rounded-full border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ""}`}>
          {checked && (
            <Circle className="h-2.5 w-2.5 fill-current text-current mx-auto mt-0.5" />
          )}
        </div>
        <span>{children}</span>
      </label>
    );
  }
);

RadioGroup.displayName = "RadioGroup";
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
