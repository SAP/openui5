sap.ui.define(['exports'], function (exports) { 'use strict';

	const rtlAwareSet = new Set();
	const markAsRtlAware = klass => {
		rtlAwareSet.add(klass);
	};
	const isRtlAware = klass => {
		return rtlAwareSet.has(klass);
	};

	exports.isRtlAware = isRtlAware;
	exports.markAsRtlAware = markAsRtlAware;

	Object.defineProperty(exports, '__esModule', { value: true });

});
