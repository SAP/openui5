sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/my-view', './v4/my-view'], function (exports, Theme, myView$1, myView$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? myView$1.pathData : myView$2.pathData;
	var myView = "my-view";

	exports.accData = myView$1.accData;
	exports.ltr = myView$1.ltr;
	exports.default = myView;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
