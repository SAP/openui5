sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bold-text', './v4/bold-text'], function (Theme, boldText$2, boldText$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? boldText$1 : boldText$2;
	var boldText = { pathData };

	return boldText;

});
