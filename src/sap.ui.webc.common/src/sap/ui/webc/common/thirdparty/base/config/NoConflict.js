sap.ui.define(['exports', '../InitialConfiguration'], function (exports, InitialConfiguration) { 'use strict';

	const excludeList = [
		"value-changed",
	];
	const shouldFireOriginalEvent = eventName => {
		return excludeList.includes(eventName);
	};
	let noConflict;
	const shouldNotFireOriginalEvent = eventName => {
		const nc = getNoConflict();
		return !(nc.events && nc.events.includes && nc.events.includes(eventName));
	};
	const getNoConflict = () => {
		if (noConflict === undefined) {
			noConflict = InitialConfiguration.getNoConflict();
		}
		return noConflict;
	};
	const skipOriginalEvent = eventName => {
		const nc = getNoConflict();
		if (shouldFireOriginalEvent(eventName)) {
			return false;
		}
		if (nc === true) {
			return true;
		}
		return !shouldNotFireOriginalEvent(eventName);
	};
	const setNoConflict = noConflictData => {
		noConflict = noConflictData;
	};

	exports.getNoConflict = getNoConflict;
	exports.setNoConflict = setNoConflict;
	exports.skipOriginalEvent = skipOriginalEvent;

	Object.defineProperty(exports, '__esModule', { value: true });

});
