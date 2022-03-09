sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/touch', './v4/touch'], function (Theme, touch$2, touch$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? touch$1 : touch$2;
	var touch = { pathData };

	return touch;

});
