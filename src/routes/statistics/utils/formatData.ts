export function formatBytes(sizeInBytes: number): string {
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
}

export function formatMilliseconds(ms: number, decimal: number = 0): string {
	const seconds = ms / 1000;
	const minutes = seconds / 60;
	const hours = minutes / 60;

	if (seconds < 1) {
		return `${ms.toFixed(decimal)} ms`;
	} else if (seconds < 60) {
		return `${seconds.toFixed(2)} s`;
	} else if (minutes < 60) {
		return `${minutes.toFixed(1)} m`;
	} else {
		return `${hours.toFixed(2)} h`;
	}
}

export function addCommas(number: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'decimal'
	}).format(number);
}

export function formatNumber(num: number): string {
	if (num >= 1_000_000) {
		return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
	} else if (num >= 1_000) {
		return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
	}
	return num.toString();
}
