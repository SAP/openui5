sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-photo', './v4/add-photo'], function (Theme, addPhoto$2, addPhoto$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addPhoto$1 : addPhoto$2;
	var addPhoto = { pathData };

	return addPhoto;

});
