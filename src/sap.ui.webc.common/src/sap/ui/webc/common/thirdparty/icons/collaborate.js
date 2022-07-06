sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collaborate', './v4/collaborate'], function (exports, Theme, collaborate$1, collaborate$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? collaborate$1.pathData : collaborate$2.pathData;
	var collaborate = "collaborate";

	exports.accData = collaborate$1.accData;
	exports.ltr = collaborate$1.ltr;
	exports.default = collaborate;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
