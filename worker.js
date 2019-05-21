self.onmessage = e => {
	self.onmessage = null;
	eval(e.data);
};