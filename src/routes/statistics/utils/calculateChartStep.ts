export default (realMax: number, maxStepsAmount: number = 7): { maxChartPoint: number; step: number } => {
    let currentPower = -1;
    let rightStep;
    while (!rightStep) {
        let beautifulNumbers = [
            10 * 10 ** currentPower,
            20 * 10 ** currentPower,
            25 * 10 ** currentPower,
            50 * 10 ** currentPower
        ];
        if (currentPower === -1) {
            beautifulNumbers = [1, 2, 5];
        }
        for (const currentStep of beautifulNumbers) {
            const outputsRightAmountOfSteps = Math.ceil(realMax / currentStep) <= maxStepsAmount;
            if (outputsRightAmountOfSteps) {
                rightStep = currentStep;
                const output = { maxChartPoint: Math.ceil(realMax / rightStep) * rightStep, step: rightStep };
                return output;
            }
        }
        currentPower++;
    }
    return { maxChartPoint: 0, step: 0 };
};
