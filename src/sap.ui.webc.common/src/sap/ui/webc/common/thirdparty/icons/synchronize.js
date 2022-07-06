sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/synchronize', './v4/synchronize'], function (exports, Theme, synchronize$1, synchronize$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? synchronize$1.pathData : synchronize$2.pathData;
	var synchronize = "synchronize";

	exports.accData = synchronize$1.accData;
	exports.ltr = synchronize$1.ltr;
	exports.default = synchronize;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
