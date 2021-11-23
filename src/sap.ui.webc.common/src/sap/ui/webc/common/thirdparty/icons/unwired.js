sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/unwired', './v4/unwired'], function (Theme, unwired$2, unwired$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? unwired$1 : unwired$2;
	var unwired = { pathData };

	return unwired;

});
