sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/overlay', './v4/overlay'], function (Theme, overlay$2, overlay$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? overlay$1 : overlay$2;
	var overlay = { pathData };

	return overlay;

});
