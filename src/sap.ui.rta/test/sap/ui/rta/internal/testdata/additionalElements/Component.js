sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/rta/util/UrlParser"
], function(
	UIComponent,
	FakeLrepConnectorLocalStorage,
	UrlParser
) {

	"use strict";

	return UIComponent.extend("sap.ui.rta.test.additionalElements.Component", {

		metadata: {
			manifest: "json"
		},


		init : function() {
			this._bShowAdaptButton = this.getComponentData().showAdaptButton ? this.getComponentData().showAdaptButton : false;
			sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		},

		/**
		 * Initialize the application
		 *
		 * @returns {sap.ui.core.Control} the content
		 */
		createContent : function() {

			// app specific setup
			this._createFakeLrep();

			var oApp = new sap.m.App();

			var oModel = new sap.ui.model.json.JSONModel({
				showAdaptButton : this._bShowAdaptButton
			});

			var oPage = sap.ui.view(this.createId("idMain1"), {
				viewName : "sap.ui.rta.test.additionalElements.ComplexTest",
				type : sap.ui.core.mvc.ViewType.XML,
				async: true
			});

			oPage.setModel(oModel, "view");

			oApp.addPage(oPage);

			return oApp;

		},

		/**
		 * Create the FakeLrep with localStorage
		 * @private
		 */
		_createFakeLrep: function () {
			if (UrlParser.getParam('sap-rta-mock-lrep') !== false) {
				FakeLrepConnectorLocalStorage.enableFakeConnector();
			}
		}

	});
});
