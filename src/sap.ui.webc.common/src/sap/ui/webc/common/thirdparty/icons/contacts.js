sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/contacts', './v4/contacts'], function (exports, Theme, contacts$1, contacts$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? contacts$1.pathData : contacts$2.pathData;
	var contacts = "contacts";

	exports.accData = contacts$1.accData;
	exports.ltr = contacts$1.ltr;
	exports.default = contacts;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
