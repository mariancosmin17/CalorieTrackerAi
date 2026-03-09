export function calculateCalorieGoal(profile){
    const { age, gender,height_cm,weight_kg,activity_level,goal_type}=profile;

    if (!age||!gender||!height_cm||!weight_kg) return null;
    let bmr;

    if(gender==='male'){
    bmr=10*weight_kg+6.25*height_cm-5*age+5;
    }
    else{
    bmr=10*weight_kg+6.25*height_cm-5*age-161;
    }

    const activityFactors ={
        sedentary:1.2,
        light:1.375,
        moderate:1.55,
        active:1.725,
    };

    const factor = activityFactors[activity_level] || 1.2;
    const tdee=Math.round(bmr * factor);
    const goalAdjustments={lose:-500,maintain:0,gain:+300};
    const adjustment=goalAdjustments[goal_type] ?? 0;
    return Math.max(1200, tdee + adjustment);
}

export function calculateMacroGoals(calorieGoal) {
    return {
        protein:Math.round((calorieGoal * 0.30) / 4),
        carbs:Math.round((calorieGoal * 0.40) / 4),
        fat:Math.round((calorieGoal * 0.30) / 9),
    };
}