export default (length: number, chartWidth: number): number[] => {
	let indices: number[] = [];

	if (chartWidth < 400) {
		if (length === 24) {
			indices = [0, 8, 16, 23];
		} else if (length === 7) {
			indices = [0, 2, 4, 6];
		} else if (length === 14) {
			indices = [0, 6, 13];
		} else if (length === 30) {
			indices = [0, 10, 20, 29];
		} else if (length === 90) {
			indices = [0, 30, 60, 89];
		}
	} else {
		if (length === 24) {
			indices = [0, 6, 12, 18, 23];
		} else if (length === 7) {
			indices = [0, 1, 2, 3, 4, 5, 6];
		} else if (length === 14) {
			indices = [0, 3, 6, 9, 13];
		} else if (length === 30) {
			indices = [0, 6, 12, 18, 24, 29];
		} else if (length === 90) {
			indices = [0, 18, 36, 54, 72, 89];
		}
	}

	return indices;
};
