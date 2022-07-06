sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/it-host', './v4/it-host'], function (exports, Theme, itHost$1, itHost$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? itHost$1.pathData : itHost$2.pathData;
	var itHost = "it-host";

	exports.accData = itHost$1.accData;
	exports.ltr = itHost$1.ltr;
	exports.default = itHost;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
