sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/unwired', './v4/unwired'], function (exports, Theme, unwired$1, unwired$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? unwired$1.pathData : unwired$2.pathData;
	var unwired = "unwired";

	exports.accData = unwired$1.accData;
	exports.ltr = unwired$1.ltr;
	exports.default = unwired;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
