sap.ui.define(['exports', './util/setToArray'], function (exports, setToArray) { 'use strict';

	const Definitions = new Set();
	const Failures = new Set();
	let failureTimeout;
	const registerTag = tag => {
		Definitions.add(tag);
	};
	const isTagRegistered = tag => {
		return Definitions.has(tag);
	};
	const getAllRegisteredTags = () => {
		return setToArray(Definitions);
	};
	const recordTagRegistrationFailure = tag => {
		Failures.add(tag);
		if (!failureTimeout) {
			failureTimeout = setTimeout(() => {
				displayFailedRegistrations();
				failureTimeout = undefined;
			}, 1000);
		}
	};
	const displayFailedRegistrations = () => {
		console.warn(`The following tags have already been defined by a different UI5 Web Components version: ${setToArray(Failures).join(", ")}`);
		Failures.clear();
	};

	exports.getAllRegisteredTags = getAllRegisteredTags;
	exports.isTagRegistered = isTagRegistered;
	exports.recordTagRegistrationFailure = recordTagRegistrationFailure;
	exports.registerTag = registerTag;

	Object.defineProperty(exports, '__esModule', { value: true });

});
