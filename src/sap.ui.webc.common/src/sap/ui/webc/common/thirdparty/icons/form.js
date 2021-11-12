sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/form', './v4/form'], function (Theme, form$2, form$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? form$1 : form$2;
	var form = { pathData };

	return form;

});
