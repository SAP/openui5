sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/program-triangles-2', './v4/program-triangles-2'], function (Theme, programTriangles2$2, programTriangles2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? programTriangles2$1 : programTriangles2$2;
	var programTriangles2 = { pathData };

	return programTriangles2;

});
