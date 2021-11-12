sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/incident', './v4/incident'], function (Theme, incident$2, incident$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? incident$1 : incident$2;
	var incident = { pathData };

	return incident;

});
