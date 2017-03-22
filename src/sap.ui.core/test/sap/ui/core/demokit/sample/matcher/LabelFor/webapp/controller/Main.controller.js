sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/resource/ResourceModel'
], function (Controller, ResourceModel) {
	"use strict";


	return Controller.extend("webapp.controller.Main", {

		onInit: function () {
			this._oI18NModel = new ResourceModel({ bundleName: "webapp.i18n.i18n"});
			// set I18N model
			this.getView().setModel(this._oI18NModel, "i18n");
		},

		onExit: function() {
			this._oI18NModel.destroy();
		}
	});
});
