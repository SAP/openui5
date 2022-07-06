sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multi-select', './v4/multi-select'], function (exports, Theme, multiSelect$1, multiSelect$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? multiSelect$1.pathData : multiSelect$2.pathData;
	var multiSelect = "multi-select";

	exports.accData = multiSelect$1.accData;
	exports.ltr = multiSelect$1.ltr;
	exports.default = multiSelect;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
