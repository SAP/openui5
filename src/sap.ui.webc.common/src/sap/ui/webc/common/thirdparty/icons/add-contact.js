sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-contact', './v4/add-contact'], function (Theme, addContact$2, addContact$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addContact$1 : addContact$2;
	var addContact = { pathData };

	return addContact;

});
