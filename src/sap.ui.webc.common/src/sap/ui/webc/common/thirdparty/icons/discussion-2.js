sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/discussion-2', './v4/discussion-2'], function (exports, Theme, discussion2$1, discussion2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? discussion2$1.pathData : discussion2$2.pathData;
	var discussion2 = "discussion-2";

	exports.accData = discussion2$1.accData;
	exports.ltr = discussion2$1.ltr;
	exports.default = discussion2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
