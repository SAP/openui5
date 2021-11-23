sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cursor-arrow', './v4/cursor-arrow'], function (Theme, cursorArrow$2, cursorArrow$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? cursorArrow$1 : cursorArrow$2;
	var cursorArrow = { pathData };

	return cursorArrow;

});
