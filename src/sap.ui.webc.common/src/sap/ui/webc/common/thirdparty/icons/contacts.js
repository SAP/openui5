sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/contacts', './v4/contacts'], function (Theme, contacts$2, contacts$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? contacts$1 : contacts$2;
	var contacts = { pathData };

	return contacts;

});
