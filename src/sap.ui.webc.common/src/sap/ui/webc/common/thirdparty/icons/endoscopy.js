sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/endoscopy', './v4/endoscopy'], function (Theme, endoscopy$2, endoscopy$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? endoscopy$1 : endoscopy$2;
	var endoscopy = { pathData };

	return endoscopy;

});
