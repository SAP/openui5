sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/eraser', './v4/eraser'], function (Theme, eraser$2, eraser$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? eraser$1 : eraser$2;
	var eraser = { pathData };

	return eraser;

});
