sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text', './v4/text'], function (Theme, text$2, text$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? text$1 : text$2;
	var text = { pathData };

	return text;

});
