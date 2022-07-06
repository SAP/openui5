sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/upload', './v4/upload'], function (exports, Theme, upload$1, upload$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? upload$1.pathData : upload$2.pathData;
	var upload = "upload";

	exports.accData = upload$1.accData;
	exports.ltr = upload$1.ltr;
	exports.default = upload;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
