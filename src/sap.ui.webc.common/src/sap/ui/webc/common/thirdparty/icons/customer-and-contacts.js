sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-and-contacts', './v4/customer-and-contacts'], function (exports, Theme, customerAndContacts$1, customerAndContacts$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customerAndContacts$1.pathData : customerAndContacts$2.pathData;
	var customerAndContacts = "customer-and-contacts";

	exports.accData = customerAndContacts$1.accData;
	exports.ltr = customerAndContacts$1.ltr;
	exports.default = customerAndContacts;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
