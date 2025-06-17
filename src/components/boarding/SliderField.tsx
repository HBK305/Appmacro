import React from 'react';

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  error?: string;
  showValue?: boolean;
  required?: boolean;
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  error,
  showValue = true,
  required = false
}: SliderFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="boarding-field">
      <div className="boarding-slider-header">
        <label className="boarding-label">
          {label}
          {required && <span className="boarding-required">*</span>}
        </label>
        {showValue && (
          <span className="boarding-slider-value">
            {value}{unit && ` ${unit}`}
          </span>
        )}
      </div>
      <div className="boarding-slider-container">
        <input
          type="range"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={`boarding-slider ${error ? 'error' : ''}`}
          style={{
            background: `linear-gradient(to right, var(--neon-cyan) 0%, var(--neon-cyan) ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <div className="boarding-slider-track">
          <div 
            className="boarding-slider-fill"
            style={{ width: `${percentage}%` }}
          />
          <div 
            className="boarding-slider-thumb"
            style={{ left: `${percentage}%` }}
          />
        </div>
        <div className="boarding-slider-labels">
          <span className="boarding-slider-min">{min}{unit && ` ${unit}`}</span>
          <span className="boarding-slider-max">{max}{unit && ` ${unit}`}</span>
        </div>
      </div>
      {error && <span className="boarding-error">{error}</span>}
    </div>
  );
} 