sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/program-triangles-2', './v4/program-triangles-2'], function (exports, Theme, programTriangles2$1, programTriangles2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? programTriangles2$1.pathData : programTriangles2$2.pathData;
	var programTriangles2 = "program-triangles-2";

	exports.accData = programTriangles2$1.accData;
	exports.ltr = programTriangles2$1.ltr;
	exports.default = programTriangles2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
