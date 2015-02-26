/*!
 * ${copyright}
 */
jQuery.sap.require("sap.ui.model.odata.ODataUtils");

sap.ui.controller("sap.ui.core.sample.ViewTemplate.scenario.Main", {
	// Turns an instance's id (full OData URL) into its path within the OData model
	id2Path: function (sInstanceId) {
		// Note: if "last /" is wrong, search for this.getView().getModel().sServiceUrl instead!
		return sInstanceId.slice(sInstanceId.lastIndexOf("/"));
	},

	onInit: function () {
		// Note: cannot access view model in onInit
	},

	onBeforeRendering: function () {
		var oUiModel = new sap.ui.model.json.JSONModel({
				bindTexts : false,
				icon: jQuery.sap.getUriParameters().get("realOData") === "true" ?
						"sap-icon://building" : "sap-icon://record"
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
			template: new sap.ui.core.ListItem({
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
		var oDetailView, sMetadataPath, oMetaModel;

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
		this.getView().byId("detailBox").destroyContent().addContent(oDetailView);
		this.onSourceCode();
	}
});
