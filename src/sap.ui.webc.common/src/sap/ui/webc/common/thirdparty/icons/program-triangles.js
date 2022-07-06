sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/program-triangles', './v4/program-triangles'], function (exports, Theme, programTriangles$1, programTriangles$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? programTriangles$1.pathData : programTriangles$2.pathData;
	var programTriangles = "program-triangles";

	exports.accData = programTriangles$1.accData;
	exports.ltr = programTriangles$1.ltr;
	exports.default = programTriangles;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
