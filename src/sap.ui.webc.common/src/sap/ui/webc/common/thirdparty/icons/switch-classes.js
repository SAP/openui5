sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/switch-classes', './v4/switch-classes'], function (exports, Theme, switchClasses$1, switchClasses$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? switchClasses$1.pathData : switchClasses$2.pathData;
	var switchClasses = "switch-classes";

	exports.accData = switchClasses$1.accData;
	exports.ltr = switchClasses$1.ltr;
	exports.default = switchClasses;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
