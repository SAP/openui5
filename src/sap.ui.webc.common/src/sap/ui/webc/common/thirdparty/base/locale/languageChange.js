sap.ui.define(['exports', '../EventProvider'], function (exports, EventProvider) { 'use strict';

	const eventProvider = new EventProvider();
	const LANG_CHANGE = "languageChange";
	const attachLanguageChange = listener => {
		eventProvider.attachEvent(LANG_CHANGE, listener);
	};
	const detachLanguageChange = listener => {
		eventProvider.detachEvent(LANG_CHANGE, listener);
	};
	const fireLanguageChange = lang => {
		return eventProvider.fireEventAsync(LANG_CHANGE, lang);
	};

	exports.attachLanguageChange = attachLanguageChange;
	exports.detachLanguageChange = detachLanguageChange;
	exports.fireLanguageChange = fireLanguageChange;

	Object.defineProperty(exports, '__esModule', { value: true });

});
