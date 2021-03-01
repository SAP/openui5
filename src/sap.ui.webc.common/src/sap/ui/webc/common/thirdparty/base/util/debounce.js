sap.ui.define(function () { 'use strict';

	let debounceInterval = null;
	const debounce = (fn, delay) => {
		clearTimeout(debounceInterval);
		debounceInterval = setTimeout(() => {
			debounceInterval = null;
			fn();
		}, delay);
	};

	return debounce;

});
