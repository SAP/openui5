sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/documents', './v4/documents'], function (Theme, documents$2, documents$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? documents$1 : documents$2;
	var documents = { pathData };

	return documents;

});
