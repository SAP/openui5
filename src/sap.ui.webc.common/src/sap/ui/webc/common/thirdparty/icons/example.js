sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/example', './v4/example'], function (Theme, example$2, example$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? example$1 : example$2;
	var example = { pathData };

	return example;

});
