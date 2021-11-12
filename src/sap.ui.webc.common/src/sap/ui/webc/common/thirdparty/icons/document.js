sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/document', './v4/document'], function (Theme, document$2, document$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? document$1 : document$2;
	var document = { pathData };

	return document;

});
