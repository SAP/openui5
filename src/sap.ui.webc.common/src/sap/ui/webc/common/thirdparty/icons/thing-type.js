sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/thing-type', './v4/thing-type'], function (exports, Theme, thingType$1, thingType$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? thingType$1.pathData : thingType$2.pathData;
	var thingType = "thing-type";

	exports.accData = thingType$1.accData;
	exports.ltr = thingType$1.ltr;
	exports.default = thingType;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
