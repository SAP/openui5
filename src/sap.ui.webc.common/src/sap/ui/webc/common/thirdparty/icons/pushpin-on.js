sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pushpin-on', './v4/pushpin-on'], function (exports, Theme, pushpinOn$1, pushpinOn$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pushpinOn$1.pathData : pushpinOn$2.pathData;
	var pushpinOn = "pushpin-on";

	exports.accData = pushpinOn$1.accData;
	exports.ltr = pushpinOn$1.ltr;
	exports.default = pushpinOn;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
