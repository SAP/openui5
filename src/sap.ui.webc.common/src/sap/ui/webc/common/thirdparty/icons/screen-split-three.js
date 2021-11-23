sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/screen-split-three', './v4/screen-split-three'], function (Theme, screenSplitThree$2, screenSplitThree$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? screenSplitThree$1 : screenSplitThree$2;
	var screenSplitThree = { pathData };

	return screenSplitThree;

});
