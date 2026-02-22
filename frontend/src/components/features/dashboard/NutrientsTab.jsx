import {ProgressBar} from '../../common/ProgressBar';

export function NutrientsTab() {
  const macros={
    protein:{
      current:72,
      goal:150,
      color:'#0284c7',
    },
    carbs:{
      current:118,
      goal:250,
      color:'#4CAF50',
    },
    fat:{
      current:22,
      goal:65,
      color:'#FF9800',
    },
  };

  return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
            Macronutrients today
        </h3>
        <div className="space-y-6">
            <ProgressBar
                label="Protein"
                current={macros.protein.current}
                goal={macros.protein.goal}
                color={macros.protein.color}
                unit="g"
            />
            <ProgressBar
                label="Carbs"
                current={macros.carbs.current}
                goal={macros.carbs.goal}
                color={macros.carbs.color}
                unit="g"
            />
            <ProgressBar
                label="Fat"
                current={macros.fat.current}
                goal={macros.fat.goal}
                color={macros.fat.color}
                unit="g"
            />
        </div>
        <div className="mt-6 bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-gray-900 font-medium mb-2">
                Total Macros
            </p>
            <div className="flex items-center justify-around gap-14 text-sm">
                <div className="flex flex-col items-center gap-1">
                        <span className="text-xl font-bold text-[#0284c7]">
                            {macros.protein.current}g
                        </span>
                        <span className="text-gray-900">
                            Protein
                        </span>
                </div>

                <div className="flex flex-col items-center gap-1">
                        <span className="text-xl font-bold text-[#4CAF50]">
                            {macros.carbs.current}g
                        </span>
                        <span className="text-gray-900">
                            Carbs
                        </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                        <span className="text-xl font-bold text-[#FF9800]">
                            {macros.fat.current}g
                        </span>
                        <span className="text-gray-900">
                            Fat
                        </span>
                </div>
            </div>
        </div>
      </div>
    );
}