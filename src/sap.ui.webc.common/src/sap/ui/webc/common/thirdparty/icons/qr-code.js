sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/qr-code', './v4/qr-code'], function (exports, Theme, qrCode$1, qrCode$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? qrCode$1.pathData : qrCode$2.pathData;
	var qrCode = "qr-code";

	exports.accData = qrCode$1.accData;
	exports.ltr = qrCode$1.ltr;
	exports.default = qrCode;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
