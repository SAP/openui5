sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/create-entry-time', './v4/create-entry-time'], function (exports, Theme, createEntryTime$1, createEntryTime$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? createEntryTime$1.pathData : createEntryTime$2.pathData;
	var createEntryTime = "create-entry-time";

	exports.accData = createEntryTime$1.accData;
	exports.ltr = createEntryTime$1.ltr;
	exports.default = createEntryTime;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
