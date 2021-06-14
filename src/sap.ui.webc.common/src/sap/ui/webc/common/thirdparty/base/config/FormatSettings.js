sap.ui.define(['exports', '../InitialConfiguration'], function (exports, InitialConfiguration) { 'use strict';

	let formatSettings;
	const getFirstDayOfWeek = () => {
		if (formatSettings === undefined) {
			formatSettings = InitialConfiguration.getFormatSettings();
		}
		return formatSettings.firstDayOfWeek;
	};

	exports.getFirstDayOfWeek = getFirstDayOfWeek;

	Object.defineProperty(exports, '__esModule', { value: true });

});
