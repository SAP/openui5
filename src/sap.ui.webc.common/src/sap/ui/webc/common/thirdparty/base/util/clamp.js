sap.ui.define(function () { 'use strict';

	const clamp = (val, min, max) => {
		return Math.min(Math.max(val, min), max);
	};

	return clamp;

});
