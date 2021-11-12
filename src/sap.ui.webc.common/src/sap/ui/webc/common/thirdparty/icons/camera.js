sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/camera', './v4/camera'], function (Theme, camera$2, camera$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? camera$1 : camera$2;
	var camera = { pathData };

	return camera;

});
