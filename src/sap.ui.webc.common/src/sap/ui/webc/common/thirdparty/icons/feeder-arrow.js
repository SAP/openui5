sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/feeder-arrow', './v4/feeder-arrow'], function (exports, Theme, feederArrow$1, feederArrow$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? feederArrow$1.pathData : feederArrow$2.pathData;
	var feederArrow = "feeder-arrow";

	exports.accData = feederArrow$1.accData;
	exports.ltr = feederArrow$1.ltr;
	exports.default = feederArrow;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
