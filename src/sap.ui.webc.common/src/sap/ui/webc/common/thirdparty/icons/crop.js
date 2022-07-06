sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/crop', './v4/crop'], function (exports, Theme, crop$1, crop$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? crop$1.pathData : crop$2.pathData;
	var crop = "crop";

	exports.accData = crop$1.accData;
	exports.ltr = crop$1.ltr;
	exports.default = crop;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
