export default (sizeInBytes: number): string => {
	const formatNumber = (number: number): string => {
		if (number % 1 === 0) {
			return number.toFixed(0); 
		}
		return number.toFixed(2); 
	};

	if (sizeInBytes >= 1000 * 1000 * 1000 * 1000) {
		return formatNumber(sizeInBytes / (1000 * 1000 * 1000 * 1000)) + ' TB';
	} else if (sizeInBytes >= 1000 * 1000 * 1000) {
		return formatNumber(sizeInBytes / (1000 * 1000 * 1000)) + ' GB';
	} else if (sizeInBytes >= 1000 * 1000) {
		return formatNumber(sizeInBytes / (1000 * 1000)) + ' MB';
	} else if (sizeInBytes >= 1000) {
		return formatNumber(sizeInBytes / 1000) + ' KB';
	} else {
		return sizeInBytes + ' B';
	}
};
