sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/outbox', './v4/outbox'], function (exports, Theme, outbox$1, outbox$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? outbox$1.pathData : outbox$2.pathData;
	var outbox = "outbox";

	exports.accData = outbox$1.accData;
	exports.ltr = outbox$1.ltr;
	exports.default = outbox;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
