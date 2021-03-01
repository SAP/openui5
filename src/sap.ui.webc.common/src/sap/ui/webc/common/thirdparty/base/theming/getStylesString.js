sap.ui.define(function () { 'use strict';

	const getStylesString = styles => {
		if (Array.isArray(styles)) {
			return flatten(styles.filter(style => !!style)).join(" ");
		}
		return styles;
	};
	const flatten = arr => {
		return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
	};

	return getStylesString;

});
