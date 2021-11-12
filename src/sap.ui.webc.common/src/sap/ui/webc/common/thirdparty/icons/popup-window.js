sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/popup-window', './v4/popup-window'], function (Theme, popupWindow$2, popupWindow$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? popupWindow$1 : popupWindow$2;
	var popupWindow = { pathData };

	return popupWindow;

});
