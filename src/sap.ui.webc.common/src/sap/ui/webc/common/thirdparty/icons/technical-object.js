sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/technical-object', './v4/technical-object'], function (Theme, technicalObject$2, technicalObject$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? technicalObject$1 : technicalObject$2;
	var technicalObject = { pathData };

	return technicalObject;

});
