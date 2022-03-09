sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/generate-shortcut', './v4/generate-shortcut'], function (Theme, generateShortcut$2, generateShortcut$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? generateShortcut$1 : generateShortcut$2;
	var generateShortcut = { pathData };

	return generateShortcut;

});
