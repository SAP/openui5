sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/shelf', './v4/shelf'], function (Theme, shelf$2, shelf$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? shelf$1 : shelf$2;
	var shelf = { pathData };

	return shelf;

});
