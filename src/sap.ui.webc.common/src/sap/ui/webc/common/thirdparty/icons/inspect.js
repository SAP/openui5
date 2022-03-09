sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/inspect', './v4/inspect'], function (Theme, inspect$2, inspect$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? inspect$1 : inspect$2;
	var inspect = { pathData };

	return inspect;

});
