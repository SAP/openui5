sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/shelf', './v4/shelf'], function (exports, Theme, shelf$1, shelf$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? shelf$1.pathData : shelf$2.pathData;
	var shelf = "shelf";

	exports.accData = shelf$1.accData;
	exports.ltr = shelf$1.ltr;
	exports.default = shelf;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
