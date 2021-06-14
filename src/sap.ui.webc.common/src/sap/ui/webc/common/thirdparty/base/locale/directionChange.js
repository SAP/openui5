sap.ui.define(['exports', '../EventProvider'], function (exports, EventProvider) { 'use strict';

	const eventProvider = new EventProvider();
	const DIR_CHANGE = "directionChange";
	const attachDirectionChange = listener => {
		eventProvider.attachEvent(DIR_CHANGE, listener);
	};
	const detachDirectionChange = listener => {
		eventProvider.detachEvent(DIR_CHANGE, listener);
	};
	const fireDirectionChange = () => {
		return eventProvider.fireEvent(DIR_CHANGE);
	};

	exports.attachDirectionChange = attachDirectionChange;
	exports.detachDirectionChange = detachDirectionChange;
	exports.fireDirectionChange = fireDirectionChange;

	Object.defineProperty(exports, '__esModule', { value: true });

});
