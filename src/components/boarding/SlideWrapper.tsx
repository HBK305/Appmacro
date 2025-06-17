import React, { ReactNode } from 'react';

interface SlideWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showPrev?: boolean;
}

export function SlideWrapper({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  nextLabel = 'Next',
  nextDisabled = false,
  showPrev = false
}: SlideWrapperProps) {
  return (
    <div className="boarding-slide">
      <div className="boarding-slide-content">
        <div className="boarding-slide-header">
          <h1 className="boarding-slide-title">{title}</h1>
          {subtitle && <p className="boarding-slide-subtitle">{subtitle}</p>}
        </div>
        
        <div className="boarding-slide-body">
          {children}
        </div>
        
        <div className="boarding-slide-footer">
          <div className="boarding-slide-actions">
            {showPrev && onPrev && (
              <button
                type="button"
                onClick={onPrev}
                className="boarding-button boarding-button-secondary"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              className="boarding-button boarding-button-primary"
            >
              {nextLabel}
              <span className="boarding-button-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Background effects */}
      <div className="boarding-slide-bg">
        <div className="boarding-grid-overlay" />
        <div className="boarding-scanlines" />
        <div className="boarding-noise" />
      </div>
    </div>
  );
} 