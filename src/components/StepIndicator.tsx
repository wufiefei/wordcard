'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = [
    { number: 1, title: '上传照片', icon: '📸' },
    { number: 2, title: '选择单词', icon: '📚' },
    { number: 3, title: '选择尺寸', icon: '📐' },
  ];

  return (
    <div className="w-full py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* 连接线 */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>

          {/* 步骤圆圈 */}
          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg scale-110'
                      : isActive
                      ? 'bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg scale-110'
                      : 'bg-white border-2 border-gray-300'
                  }`}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>
                <div
                  className={`text-sm font-medium transition-colors ${
                    isActive || isCompleted ? 'text-purple-600' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

