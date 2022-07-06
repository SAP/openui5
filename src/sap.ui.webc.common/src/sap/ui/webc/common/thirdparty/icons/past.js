sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/past', './v4/past'], function (exports, Theme, past$1, past$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? past$1.pathData : past$2.pathData;
	var past = "past";

	exports.accData = past$1.accData;
	exports.ltr = past$1.ltr;
	exports.default = past;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
