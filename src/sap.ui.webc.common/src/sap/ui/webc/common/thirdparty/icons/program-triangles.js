sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/program-triangles', './v4/program-triangles'], function (Theme, programTriangles$2, programTriangles$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? programTriangles$1 : programTriangles$2;
	var programTriangles = { pathData };

	return programTriangles;

});
