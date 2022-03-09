sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/dropdown', './v4/dropdown'], function (Theme, dropdown$2, dropdown$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? dropdown$1 : dropdown$2;
	var dropdown = { pathData };

	return dropdown;

});
