sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/palette', './v4/palette'], function (Theme, palette$2, palette$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? palette$1 : palette$2;
	var palette = { pathData };

	return palette;

});
