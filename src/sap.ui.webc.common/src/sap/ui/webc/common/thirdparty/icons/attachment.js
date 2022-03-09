sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment', './v4/attachment'], function (Theme, attachment$2, attachment$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachment$1 : attachment$2;
	var attachment = { pathData };

	return attachment;

});
