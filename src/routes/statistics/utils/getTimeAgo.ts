export default (timestamp: number): string => {
	const now = new Date().getTime();
	const diffInSeconds = Math.floor((now - timestamp) / 1000);

	const seconds = diffInSeconds;
	const minutes = Math.floor(diffInSeconds / 60);
	const hours = Math.floor(diffInSeconds / 3600);
	const days = Math.floor(diffInSeconds / 86400);
	const weeks = Math.floor(days / 7);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (seconds < 60) {
		return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
	} else if (minutes < 60) {
		return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
	} else if (hours < 24) {
		return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
	} else if (days < 7) {
		return `${days} day${days !== 1 ? 's' : ''} ago`;
	} else if (weeks <= 4) {
		return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
	} else if (months < 12) {
		return `${months} month${months !== 1 ? 's' : ''} ago`;
	} else {
		return `${years} year${years !== 1 ? 's' : ''} ago`;
	}
};
