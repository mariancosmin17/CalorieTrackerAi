import {ProgressBar} from '../../common/ProgressBar';

export function NutrientsTab({
    protein={current:0,goal:150},
    carbs={current:0,goal:250},
    fat={current:0,goal:65},
    }) {

  return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
            Macronutrients today
        </h3>
        <div className="space-y-6">
            <ProgressBar
                label="Protein"
                current={protein.current}
                goal={protein.goal}
                color="#0284c7"
                unit="g"
            />
            <ProgressBar
                label="Carbs"
                current={carbs.current}
                goal={carbs.goal}
                color="#4CAF50"
                unit="g"
            />
            <ProgressBar
                label="Fat"
                current={fat.current}
                goal={fat.goal}
                color="#FF9800"
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
                            {protein.current}g
                        </span>
                        <span className="text-gray-900">
                            Protein
                        </span>
                </div>

                <div className="flex flex-col items-center gap-1">
                        <span className="text-xl font-bold text-[#4CAF50]">
                            {carbs.current}g
                        </span>
                        <span className="text-gray-900">
                            Carbs
                        </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                        <span className="text-xl font-bold text-[#FF9800]">
                            {fat.current}g
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