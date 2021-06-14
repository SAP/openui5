sap.ui.define(function () { 'use strict';

	const allowList = [
		"disabled",
		"title",
		"hidden",
		"role",
		"draggable",
	];
	const isValidPropertyName = name => {
		if (allowList.includes(name) || name.startsWith("aria")) {
			return true;
		}
		const classes = [
			HTMLElement,
			Element,
			Node,
		];
		return !classes.some(klass => klass.prototype.hasOwnProperty(name));
	};

	return isValidPropertyName;

});
