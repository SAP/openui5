sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chain-link', './v4/chain-link'], function (exports, Theme, chainLink$1, chainLink$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? chainLink$1.pathData : chainLink$2.pathData;
	var chainLink = "chain-link";

	exports.accData = chainLink$1.accData;
	exports.ltr = chainLink$1.ltr;
	exports.default = chainLink;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
