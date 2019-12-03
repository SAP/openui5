/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/testrecorder/Dialects"
], function (JSONModel, Dialects) {
	"use strict";

	var model = new JSONModel({
		iFrameTitle: "Test Recorder",
		dialects: [{
			key: Dialects.RAW,
			label: "raw selector"
		}, {
			key: Dialects.OPA5,
			label: "OPA5"
		}, {
			key: Dialects.UIVERI5,
			label: "UIVeri5"
		}],
		selectedDialect: Dialects.UIVERI5
	});

	return model;
});
