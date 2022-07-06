sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/download', './v4/download'], function (exports, Theme, download$1, download$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? download$1.pathData : download$2.pathData;
	var download = "download";

	exports.accData = download$1.accData;
	exports.ltr = download$1.ltr;
	exports.default = download;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
