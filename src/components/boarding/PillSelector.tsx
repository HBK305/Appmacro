import React from 'react';

interface PillOption {
  value: string | number;
  label: string;
  description?: string;
}

interface PillSelectorProps {
  label: string;
  options: PillOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
}

export function PillSelector({
  label,
  options,
  value,
  onChange,
  error,
  required = false
}: PillSelectorProps) {
  return (
    <div className="boarding-field">
      <label className="boarding-label">
        {label}
        {required && <span className="boarding-required">*</span>}
      </label>
      <div className="boarding-pill-container">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`boarding-pill ${
              value === option.value ? 'active' : ''
            } ${error ? 'error' : ''}`}
          >
            <span className="boarding-pill-label">{option.label}</span>
            {option.description && (
              <span className="boarding-pill-description">{option.description}</span>
            )}
          </button>
        ))}
      </div>
      {error && <span className="boarding-error">{error}</span>}
    </div>
  );
} 