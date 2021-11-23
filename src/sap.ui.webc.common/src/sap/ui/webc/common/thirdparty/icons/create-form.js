sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/create-form', './v4/create-form'], function (Theme, createForm$2, createForm$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? createForm$1 : createForm$2;
	var createForm = { pathData };

	return createForm;

});
