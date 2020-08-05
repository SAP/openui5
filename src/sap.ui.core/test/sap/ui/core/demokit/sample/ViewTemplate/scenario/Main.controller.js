/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/core/Component",
	"sap/ui/core/library",
	"sap/ui/core/ListItem",
	"sap/ui/core/mvc/View",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/util/XMLHelper"
], function (Log, MessageBox, Component, library, ListItem, View, Controller, XMLHelper) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	function alertError(oError) {
		Log.error(oError, oError.stack, "sap.ui.core.sample.ViewTemplate.scenario.Main");
		MessageBox.alert(oError.message, {
			icon : MessageBox.Icon.ERROR,
			title : "Error"});
	}

	var MainController = Controller.extend("sap.ui.core.sample.ViewTemplate.scenario.Main", {
		/**
		 * Function is called by <code>onSourceCode</code> before the source code is pretty printed.
		 * It returns the XML of the detail view.
		 *
		 * @param {string} sSourceCode The source code
		 * @returns {string} The XML of the detail view
		 */
		beforePrettyPrinting : function (sSourceCode) {
			return XMLHelper.serialize(this._getDetailView()._xContent);
		},

		// Turns an instance's id (full OData URL) into its path within the OData model
		id2Path : function (sInstanceId) {
			// Note: if "last /" is wrong, search for this.getView().getModel().sServiceUrl instead!
			return sInstanceId.slice(sInstanceId.lastIndexOf("/"));
		},

		onInit : function () {
			// Note: cannot access view model in onInit
		},

		onBeforeRendering : function () {
			var oMetaModel,
				oView = this.getView(),
				oUIModel = oView.getModel("ui"),
				that = this;

			if (!oUIModel.getProperty("/selectedEntitySet")) {
				oMetaModel = oView.getModel().getMetaModel();
				oMetaModel.loaded().then(function () {
					var aEntitySets = oMetaModel.getODataEntityContainer().entitySet;

					oUIModel.setProperty("/entitySet", aEntitySets);
					oUIModel.setProperty("/selectedEntitySet", aEntitySets[0].name);

					that._bindSelectInstance();
				}).catch(alertError);
			}
		},

		onChangeType : function (oEvent) {
			this._bindSelectInstance();
		},

		onChangeInstance : function (oEvent) {
			var sInstanceId = this.getView().getModel("ui").getProperty("/selectedInstance"),
				sPath = this.id2Path(sInstanceId);

			this._getDetailView().bindElement(sPath);
			//TODO keep table selection in sync!
		},

		_bindSelectInstance : function () {
			var oBinding,
				oControl = this.byId("selectInstance");

			oControl.bindAggregation("items", {
				path : "/" + this._getSelectedSet(),
				template : new ListItem({
					text : "{path:'__metadata/id', formatter: '.id2Path'}",
					key : "{__metadata/id}"
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

		_getDetailView : function () {
			return this.byId("detailBox").getContent()[0];
		},

		_getSelectedSet : function () {
			return this.getView().getModel("ui").getProperty("/selectedEntitySet");
		},

		_showDetails : function (sPath) {
			var oMetaModel = this.getView().getModel().getMetaModel(),
				that = this;

			oMetaModel.loaded().then(function () {
				var sMetadataPath = oMetaModel.getODataEntitySet(that._getSelectedSet(), true);

				Component.getOwnerComponentFor(that.getView()).runAsOwner(function () {
					View.create({
						preprocessors : {
							xml : {
								bindingContexts : {
									meta : oMetaModel.createBindingContext(sMetadataPath)
								},
								models : {
									meta : oMetaModel
								},
								bindTexts : that.getView().getModel("ui").getProperty("/bindTexts")
							}
						},
						type : ViewType.XML,
						viewName : "sap.ui.core.sample.ViewTemplate.scenario.Detail"
					}).then(function (oDetailView) {
						var oDetailBox = that.byId("detailBox"),
							iStart;

						oDetailView.bindElement(sPath);

						oDetailBox.destroyContent();
						iStart = Date.now();
						oDetailBox.addContent(oDetailView);
						Log.info("addContent took " + (Date.now() - iStart) + " ms", null,
							"sap.ui.core.sample.ViewTemplate.scenario.Main");

						that.onSourceCode();
					});
				});

			}).catch(alertError);
		}
	});

	return MainController;
});
