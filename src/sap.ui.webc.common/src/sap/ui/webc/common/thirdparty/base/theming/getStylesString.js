sap.ui.define(function () { 'use strict';

	const getStylesString = styles => {
		if (Array.isArray(styles)) {
			return flatten(styles.filter(style => !!style)).map(style => {
				return typeof style === "string" ? style : style.content;
			}).join(" ");
		}
		return typeof styles === "string" ? styles : styles.content;
	};
	const flatten = arr => {
		return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
	};

	return getStylesString;

});
