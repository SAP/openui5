sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/screen-split-one', './v4/screen-split-one'], function (Theme, screenSplitOne$2, screenSplitOne$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? screenSplitOne$1 : screenSplitOne$2;
	var screenSplitOne = { pathData };

	return screenSplitOne;

});
