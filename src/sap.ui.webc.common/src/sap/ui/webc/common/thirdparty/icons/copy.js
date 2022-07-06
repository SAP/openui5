sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/copy', './v4/copy'], function (exports, Theme, copy$1, copy$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? copy$1.pathData : copy$2.pathData;
	var copy = "copy";

	exports.accData = copy$1.accData;
	exports.ltr = copy$1.ltr;
	exports.default = copy;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
