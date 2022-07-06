sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/share-2', './v4/share-2'], function (exports, Theme, share2$1, share2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? share2$1.pathData : share2$2.pathData;
	var share2 = "share-2";

	exports.accData = share2$1.accData;
	exports.ltr = share2$1.ltr;
	exports.default = share2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
