sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/forward', './v4/forward'], function (Theme, forward$2, forward$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? forward$1 : forward$2;
	var forward = { pathData };

	return forward;

});
