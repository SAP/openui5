sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-FaceID', './tnt-Scene-FaceID', './tnt-Spot-FaceID'], function (exports, Illustrations, tntDialogFaceID, tntSceneFaceID, tntSpotFaceID) { 'use strict';

	const name = "FaceID";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogFaceID,
		sceneSvg: tntSceneFaceID,
		spotSvg: tntSpotFaceID,
		set,
	});

	exports.dialogSvg = tntDialogFaceID;
	exports.sceneSvg = tntSceneFaceID;
	exports.spotSvg = tntSpotFaceID;

	Object.defineProperty(exports, '__esModule', { value: true });

});
