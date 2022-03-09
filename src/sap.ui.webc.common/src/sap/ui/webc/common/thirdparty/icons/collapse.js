sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collapse', './v4/collapse'], function (Theme, collapse$2, collapse$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? collapse$1 : collapse$2;
	var collapse = { pathData };

	return collapse;

});
