sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/palette', './v4/palette'], function (exports, Theme, palette$1, palette$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? palette$1.pathData : palette$2.pathData;
	var palette = "palette";

	exports.accData = palette$1.accData;
	exports.ltr = palette$1.ltr;
	exports.default = palette;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
