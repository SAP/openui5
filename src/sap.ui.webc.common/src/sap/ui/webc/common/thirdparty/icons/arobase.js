sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arobase', './v4/arobase'], function (Theme, arobase$2, arobase$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? arobase$1 : arobase$2;
	var arobase = { pathData };

	return arobase;

});
