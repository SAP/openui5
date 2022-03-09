sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/screen-split-two', './v4/screen-split-two'], function (Theme, screenSplitTwo$2, screenSplitTwo$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? screenSplitTwo$1 : screenSplitTwo$2;
	var screenSplitTwo = { pathData };

	return screenSplitTwo;

});
