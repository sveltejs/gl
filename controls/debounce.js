export function debounce(fn) {
	let scheduled = false;
	let event;

	function release() {
		fn(event);
		scheduled = false;
	}

	return function(e) {
		if (!scheduled) {
			requestAnimationFrame(release);
			scheduled = false;
		}

		event = e;
	};
}