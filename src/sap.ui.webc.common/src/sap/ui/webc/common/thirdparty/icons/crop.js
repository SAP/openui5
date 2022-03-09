sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/crop', './v4/crop'], function (Theme, crop$2, crop$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? crop$1 : crop$2;
	var crop = { pathData };

	return crop;

});
