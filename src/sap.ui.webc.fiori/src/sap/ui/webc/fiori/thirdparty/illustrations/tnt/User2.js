sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-User2', './tnt-Scene-User2', './tnt-Spot-User2'], function (exports, Illustrations, tntDialogUser2, tntSceneUser2, tntSpotUser2) { 'use strict';

	const name = "User2";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogUser2,
		sceneSvg: tntSceneUser2,
		spotSvg: tntSpotUser2,
		set,
	});

	exports.dialogSvg = tntDialogUser2;
	exports.sceneSvg = tntSceneUser2;
	exports.spotSvg = tntSpotUser2;

	Object.defineProperty(exports, '__esModule', { value: true });

});
