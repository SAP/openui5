sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/outdent', './v4/outdent'], function (exports, Theme, outdent$1, outdent$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? outdent$1.pathData : outdent$2.pathData;
	var outdent = "outdent";

	exports.accData = outdent$1.accData;
	exports.ltr = outdent$1.ltr;
	exports.default = outdent;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
