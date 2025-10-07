import React from 'react';

export interface ProgressIndicatorProps {
  readonly currentStep: number; // 0-indexed
  readonly totalSteps: number;
  readonly stepLabels?: string[];
  readonly showStepLabels?: boolean;
  readonly className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  showStepLabels = false,
  className,
}) => {
  const percentage = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className={`onboarding-progress ${className || ''}`.trim()} aria-label="Onboarding progress">
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`Step ${currentStep + 1} of ${totalSteps}`}
      >
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="progress-text">
        Step {currentStep + 1} of {totalSteps}
      </div>

      {showStepLabels && stepLabels && stepLabels.length === totalSteps && (
        <ol className="progress-steps" aria-hidden="true">
          {stepLabels.map((label, index) => (
            <li
              key={label}
              className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`.trim()}
            >
              {label}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default ProgressIndicator;
