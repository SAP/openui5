sap.ui.define(function () { 'use strict';

	const isDescendantOf = (klass, baseKlass, inclusive = false) => {
		if (typeof klass !== "function" || typeof baseKlass !== "function") {
			return false;
		}
		if (inclusive && klass === baseKlass) {
			return true;
		}
		let parent = klass;
		do {
			parent = Object.getPrototypeOf(parent);
		} while (parent !== null && parent !== baseKlass);
		return parent === baseKlass;
	};

	return isDescendantOf;

});
