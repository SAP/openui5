sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/decision', './v4/decision'], function (Theme, decision$2, decision$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? decision$1 : decision$2;
	var decision = { pathData };

	return decision;

});
