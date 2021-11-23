sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-and-contacts', './v4/customer-and-contacts'], function (Theme, customerAndContacts$2, customerAndContacts$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? customerAndContacts$1 : customerAndContacts$2;
	var customerAndContacts = { pathData };

	return customerAndContacts;

});
