export default (interval: string, chartWidth: number, totalTimestamps: number): number[] => {
	const indices: number[] = [0];

	let count: number;

	if (interval === '1h') {
		count = 6;
	} else if (interval === '1d') {
		count = 5;
	} else if (interval === '7d') {
		count = 7;
	} else if (interval === '30d') {
		count = 6;
	} else {
		return indices;
	}

	const spacing = Math.floor(totalTimestamps / (chartWidth < 400 ? count - 1 : count));

	for (let i = 1; i < count; i++) {
		const index = i * spacing;
		if (index < totalTimestamps) {
			indices.push(index);
		}
	}

	if (indices[indices.length - 1] !== totalTimestamps - 1) {
		indices.push(totalTimestamps - 1);
	}

	return indices;
};
