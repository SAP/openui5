sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Services', './tnt-Scene-Services', './tnt-Spot-Services'], function (exports, Illustrations, tntDialogServices, tntSceneServices, tntSpotServices) { 'use strict';

	const name = "Services";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogServices,
		sceneSvg: tntSceneServices,
		spotSvg: tntSpotServices,
		set,
	});

	exports.dialogSvg = tntDialogServices;
	exports.sceneSvg = tntSceneServices;
	exports.spotSvg = tntSpotServices;

	Object.defineProperty(exports, '__esModule', { value: true });

});
