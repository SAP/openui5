sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Secrets', './tnt-Scene-Secrets', './tnt-Spot-Secrets'], function (exports, Illustrations, tntDialogSecrets, tntSceneSecrets, tntSpotSecrets) { 'use strict';

	const name = "Secrets";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogSecrets,
		sceneSvg: tntSceneSecrets,
		spotSvg: tntSpotSecrets,
		set,
	});

	exports.dialogSvg = tntDialogSecrets;
	exports.sceneSvg = tntSceneSecrets;
	exports.spotSvg = tntSpotSecrets;

	Object.defineProperty(exports, '__esModule', { value: true });

});
