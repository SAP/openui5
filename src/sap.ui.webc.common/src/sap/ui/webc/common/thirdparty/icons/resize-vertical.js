sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/resize-vertical', './v4/resize-vertical'], function (Theme, resizeVertical$2, resizeVertical$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? resizeVertical$1 : resizeVertical$2;
	var resizeVertical = { pathData };

	return resizeVertical;

});
