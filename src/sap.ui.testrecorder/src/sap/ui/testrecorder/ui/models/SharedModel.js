/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/testrecorder/Dialects"
], function (ResourceModel, JSONModel, Dialects) {
	"use strict";

	var oI18nModel = new ResourceModel({
		bundleName: "sap.ui.core.messagebundle"
	});

	var model = new JSONModel({
		iFrameTitle: oI18nModel.getProperty("TestRecorder.TitleBar.Title"),
		dialects: [{
			key: Dialects.RAW,
			label: oI18nModel.getProperty("TestRecorder.Inspect.Snippet.Dialect.Raw")
		}, {
			key: Dialects.OPA5,
			label: oI18nModel.getProperty("TestRecorder.Inspect.Snippet.Dialect.OPA5")
		}, {
			key: Dialects.UIVERI5,
			label: oI18nModel.getProperty("TestRecorder.Inspect.Snippet.Dialect.UIVeri5")
		}],
		selectedDialect: Dialects.UIVERI5,
		settings: {
			preferViewId: false,
			formatAsPOMethod: true
		}
	});

	return model;
});
