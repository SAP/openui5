sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/paint-bucket', './v4/paint-bucket'], function (exports, Theme, paintBucket$1, paintBucket$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? paintBucket$1.pathData : paintBucket$2.pathData;
	var paintBucket = "paint-bucket";

	exports.accData = paintBucket$1.accData;
	exports.ltr = paintBucket$1.ltr;
	exports.default = paintBucket;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
