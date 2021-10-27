sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Company', './tnt-Scene-Company', './tnt-Spot-Company'], function (exports, Illustrations, tntDialogCompany, tntSceneCompany, tntSpotCompany) { 'use strict';

	const name = "Company";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogCompany,
		sceneSvg: tntSceneCompany,
		spotSvg: tntSpotCompany,
		set,
	});

	exports.dialogSvg = tntDialogCompany;
	exports.sceneSvg = tntSceneCompany;
	exports.spotSvg = tntSpotCompany;

	Object.defineProperty(exports, '__esModule', { value: true });

});
