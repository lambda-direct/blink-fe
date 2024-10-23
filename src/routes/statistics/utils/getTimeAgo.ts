export default (timestamp: number, isDays: boolean): string => {
	const now = new Date().getTime();
	const diffInSeconds = Math.floor((now - timestamp) / 1000);

	const hours = Math.floor(diffInSeconds / 3600);
	const days = Math.floor(hours / 24);
	const weeks = Math.floor(days / 7);
	const months = Math.floor(days / 30);

	if (hours < 1) {
		return 'Now';
	} else if (hours < 24) {
		return isDays ? 'Today' : `${hours} hour${hours !== 1 ? 's' : ''} ago`;
	} else if (days < 7) {
		return `${days} day${days !== 1 ? 's' : ''} ago`;
	} else if (weeks < 4) {
		return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
	} else {
		return `${months || 1} month${months || 1 !== 1 ? 's' : ''} ago`;
	}
};
