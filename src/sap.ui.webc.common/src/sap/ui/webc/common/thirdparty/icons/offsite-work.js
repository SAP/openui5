sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/offsite-work', './v4/offsite-work'], function (exports, Theme, offsiteWork$1, offsiteWork$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? offsiteWork$1.pathData : offsiteWork$2.pathData;
	var offsiteWork = "offsite-work";

	exports.accData = offsiteWork$1.accData;
	exports.ltr = offsiteWork$1.ltr;
	exports.default = offsiteWork;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
