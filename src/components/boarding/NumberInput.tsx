import React from 'react';

interface NumberInputProps {
  label: string;
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  error,
  placeholder,
  required = false
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange('');
    } else {
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        onChange(numVal);
      }
    }
  };

  return (
    <div className="boarding-field">
      <label className="boarding-label">
        {label}
        {required && <span className="boarding-required">*</span>}
        {unit && <span className="boarding-unit">({unit})</span>}
      </label>
      <div className="boarding-input-container">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className={`boarding-input boarding-number-input ${error ? 'error' : ''}`}
        />
        {unit && <span className="boarding-input-unit">{unit}</span>}
      </div>
      {error && <span className="boarding-error">{error}</span>}
    </div>
  );
} 