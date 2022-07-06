sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/wallet', './v4/wallet'], function (exports, Theme, wallet$1, wallet$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? wallet$1.pathData : wallet$2.pathData;
	var wallet = "wallet";

	exports.accData = wallet$1.accData;
	exports.ltr = wallet$1.ltr;
	exports.default = wallet;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
