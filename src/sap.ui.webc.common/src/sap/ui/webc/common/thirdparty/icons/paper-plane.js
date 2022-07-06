sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/paper-plane', './v4/paper-plane'], function (exports, Theme, paperPlane$1, paperPlane$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? paperPlane$1.pathData : paperPlane$2.pathData;
	var paperPlane = "paper-plane";

	exports.accData = paperPlane$1.accData;
	exports.ltr = paperPlane$1.ltr;
	exports.default = paperPlane;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
