sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/umbrella', './v4/umbrella'], function (Theme, umbrella$2, umbrella$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? umbrella$1 : umbrella$2;
	var umbrella = { pathData };

	return umbrella;

});
