sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/hide', './v4/hide'], function (exports, Theme, hide$1, hide$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? hide$1.pathData : hide$2.pathData;
	var hide = "hide";

	exports.accData = hide$1.accData;
	exports.ltr = hide$1.ltr;
	exports.default = hide;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
