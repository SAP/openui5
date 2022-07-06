sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/photo-voltaic', './v4/photo-voltaic'], function (exports, Theme, photoVoltaic$1, photoVoltaic$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? photoVoltaic$1.pathData : photoVoltaic$2.pathData;
	var photoVoltaic = "photo-voltaic";

	exports.accData = photoVoltaic$1.accData;
	exports.ltr = photoVoltaic$1.ltr;
	exports.default = photoVoltaic;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
