sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Components', './tnt-Scene-Components', './tnt-Spot-Components'], function (exports, Illustrations, tntDialogComponents, tntSceneComponents, tntSpotComponents) { 'use strict';

	const name = "Components";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogComponents,
		sceneSvg: tntSceneComponents,
		spotSvg: tntSpotComponents,
		set,
	});

	exports.dialogSvg = tntDialogComponents;
	exports.sceneSvg = tntSceneComponents;
	exports.spotSvg = tntSpotComponents;

	Object.defineProperty(exports, '__esModule', { value: true });

});
