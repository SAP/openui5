sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cancel', './v4/cancel'], function (Theme, cancel$2, cancel$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? cancel$1 : cancel$2;
	var cancel = { pathData };

	return cancel;

});
