sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-contact', './v4/add-contact'], function (exports, Theme, addContact$1, addContact$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addContact$1.pathData : addContact$2.pathData;
	var addContact = "add-contact";

	exports.accData = addContact$1.accData;
	exports.ltr = addContact$1.ltr;
	exports.default = addContact;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
