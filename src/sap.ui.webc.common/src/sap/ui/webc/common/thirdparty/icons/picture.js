sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/picture', './v4/picture'], function (Theme, picture$2, picture$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? picture$1 : picture$2;
	var picture = { pathData };

	return picture;

});
