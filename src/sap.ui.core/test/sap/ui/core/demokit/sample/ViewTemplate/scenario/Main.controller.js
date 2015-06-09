/*!
 * ${copyright}
 */
sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/ListItem',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/mvc/View',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/odata/ODataUtils',
		'jquery.sap.encoder',
		'jquery.sap.script',
		'jquery.sap.xml'
	], function(jQuery, ListItem, Controller, View, JSONModel, ODataUtils/*, jQuerySapEncoder, jQuerySapScript, jQuerySapXML */) {
	"use strict";

	var MainController = Controller.extend("sap.ui.core.sample.ViewTemplate.scenario.Main", {
		// Turns an instance's id (full OData URL) into its path within the OData model
		id2Path: function (sInstanceId) {
			// Note: if "last /" is wrong, search for this.getView().getModel().sServiceUrl instead!
			return sInstanceId.slice(sInstanceId.lastIndexOf("/"));
		},

		onInit: function () {
			// Note: cannot access view model in onInit
		},

		onBeforeRendering: function () {
			var bIsRealOData = jQuery.sap.getUriParameters().get("realOData") === "true",
				oUiModel = new JSONModel({
					bindTexts : false,
					icon :  bIsRealOData ? "sap-icon://building" : "sap-icon://record",
					iconTooltip : bIsRealOData ? "real OData service" : "mock OData service"
				}),
				oMetaModel = this.getView().getModel().getMetaModel(),
				aEntitySets = oMetaModel.getODataEntityContainer().entitySet;

			oUiModel.setProperty("/entitySet", aEntitySets);
			oUiModel.setProperty("/selectedEntitySet", aEntitySets[0].name);
			this.getView().setModel(oUiModel, "ui");

			this._bindSelectInstance();
		},

		onChangeType: function (oEvent) {
			this._bindSelectInstance();
		},

		onChangeInstance: function (oEvent) {
			var sInstanceId = this.getView().getModel("ui").getProperty("/selectedInstance"),
				sPath = this.id2Path(sInstanceId);

			this._getDetailView().bindElement(sPath);
			//TODO keep table selection in sync!
		},

		onSourceCode: function (oEvent) {
			var oView = this.getView(),
				sSource,
				bVisible = oView.byId("toggleSourceCode").getPressed();

			oView.getModel("ui").setProperty("/codeVisible", bVisible);
			if (bVisible) {
				sSource = jQuery.sap.serializeXML(this._getDetailView()._xContent)
					.replace(/<!--.*-->/g, "") // remove comments
					.replace(/\t/g, "  ") // indent by just 2 spaces
					.replace(/\n\s*\n/g, "\n"); // remove empty lines
				oView.getModel("ui").setProperty("/code",
					"<pre><code>" + jQuery.sap.encodeHTML(sSource) + "</code></pre>");
			}
		},

		_bindSelectInstance: function() {
			var oBinding,
				oControl = this.getView().byId("selectInstance");

			oControl.bindAggregation("items", {
				path: "/" + this._getSelectedSet(),
				template: new ListItem({
					text: "{path:'__metadata/id', formatter: '.id2Path'}",
					key: "{__metadata/id}"
				}, this)
			});

			oBinding = oControl.getBinding("items");
			oBinding.attachDataReceived(
				function onDataReceived() { //select first instance
					this._showDetails(oBinding.getContexts()[0].getPath());
					oBinding.detachDataReceived(onDataReceived, this);
				},
				this);
		},

		_getDetailView: function () {
			return this.getView().byId("detailBox").getContent()[0];
		},

		_getSelectedSet: function () {
			return this.getView().getModel("ui").getProperty("/selectedEntitySet");
		},

		_showDetails: function (sPath) {
			var oDetailBox, oDetailView, sMetadataPath, oMetaModel, iStart;

			oMetaModel = this.getView().getModel().getMetaModel();
			sMetadataPath = oMetaModel.getODataEntitySet(this._getSelectedSet(), true);
			oDetailView = sap.ui.view({
				preprocessors: {
					xml: {
						bindingContexts: {
							meta: oMetaModel.createBindingContext(sMetadataPath)
						},
						models: {
							meta: oMetaModel
						},
						bindTexts: this.getView().getModel("ui").getProperty("/bindTexts")
					}
				},
				type: sap.ui.core.mvc.ViewType.XML,
				viewName: "sap.ui.core.sample.ViewTemplate.scenario.Detail"
			});

			oDetailView.bindElement(sPath);
			oDetailBox = this.getView().byId("detailBox");
			oDetailBox.destroyContent();
			iStart = Date.now();
			oDetailBox.addContent(oDetailView);
			jQuery.sap.log.info("addContent took " + (Date.now() - iStart) + " ms", null,
				"sap.ui.core.sample.ViewTemplate.scenario.Main");
			this.onSourceCode();
		}
	});


	return MainController;

});
