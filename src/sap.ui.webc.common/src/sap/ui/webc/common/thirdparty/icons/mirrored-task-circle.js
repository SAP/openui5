sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/mirrored-task-circle', './v4/mirrored-task-circle'], function (Theme, mirroredTaskCircle$2, mirroredTaskCircle$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? mirroredTaskCircle$1 : mirroredTaskCircle$2;
	var mirroredTaskCircle = { pathData };

	return mirroredTaskCircle;

});
