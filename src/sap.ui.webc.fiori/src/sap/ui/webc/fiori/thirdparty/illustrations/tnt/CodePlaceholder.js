sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-CodePlaceholder', './tnt-Scene-CodePlaceholder', './tnt-Spot-CodePlaceholder'], function (exports, Illustrations, tntDialogCodePlaceholder, tntSceneCodePlaceholder, tntSpotCodePlaceholder) { 'use strict';

	const name = "CodePlaceholder";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogCodePlaceholder,
		sceneSvg: tntSceneCodePlaceholder,
		spotSvg: tntSpotCodePlaceholder,
		set,
	});

	exports.dialogSvg = tntDialogCodePlaceholder;
	exports.sceneSvg = tntSceneCodePlaceholder;
	exports.spotSvg = tntSpotCodePlaceholder;

	Object.defineProperty(exports, '__esModule', { value: true });

});
