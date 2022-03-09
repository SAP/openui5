sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/history', './v4/history'], function (Theme, history$2, history$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? history$1 : history$2;
	var history = { pathData };

	return history;

});
