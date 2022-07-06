sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vds-file', './v4/vds-file'], function (exports, Theme, vdsFile$1, vdsFile$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? vdsFile$1.pathData : vdsFile$2.pathData;
	var vdsFile = "vds-file";

	exports.accData = vdsFile$1.accData;
	exports.ltr = vdsFile$1.ltr;
	exports.default = vdsFile;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
