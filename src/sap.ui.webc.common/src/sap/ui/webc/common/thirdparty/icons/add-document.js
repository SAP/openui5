sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-document', './v4/add-document'], function (Theme, addDocument$2, addDocument$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? addDocument$1 : addDocument$2;
	var addDocument = { pathData };

	return addDocument;

});
