sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/endoscopy', './v4/endoscopy'], function (exports, Theme, endoscopy$1, endoscopy$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? endoscopy$1.pathData : endoscopy$2.pathData;
	var endoscopy = "endoscopy";

	exports.accData = endoscopy$1.accData;
	exports.ltr = endoscopy$1.ltr;
	exports.default = endoscopy;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
