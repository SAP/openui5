sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/shortcut', './v4/shortcut'], function (Theme, shortcut$2, shortcut$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? shortcut$1 : shortcut$2;
	var shortcut = { pathData };

	return shortcut;

});
