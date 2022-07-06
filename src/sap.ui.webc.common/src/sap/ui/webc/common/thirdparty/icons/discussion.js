sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/discussion', './v4/discussion'], function (exports, Theme, discussion$1, discussion$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? discussion$1.pathData : discussion$2.pathData;
	var discussion = "discussion";

	exports.accData = discussion$1.accData;
	exports.ltr = discussion$1.ltr;
	exports.default = discussion;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
