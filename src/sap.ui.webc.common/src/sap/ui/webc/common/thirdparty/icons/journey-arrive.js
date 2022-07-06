sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/journey-arrive', './v4/journey-arrive'], function (exports, Theme, journeyArrive$1, journeyArrive$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? journeyArrive$1.pathData : journeyArrive$2.pathData;
	var journeyArrive = "journey-arrive";

	exports.accData = journeyArrive$1.accData;
	exports.ltr = journeyArrive$1.ltr;
	exports.default = journeyArrive;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
