/*!
 * ${copyright}
 */
sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageBox',
		'sap/ui/core/Component',
		'sap/ui/core/ListItem',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/mvc/View',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/odata/AnnotationHelper',
		'sap/ui/model/odata/ODataUtils',
		'jquery.sap.encoder',
		'jquery.sap.script',
		'jquery.sap.xml'
	], function(jQuery, MessageBox, Component, ListItem, Controller, View, JSONModel,
		AnnotationHelper, ODataUtils/*, jQuerySapEncoder, jQuerySapScript, jQuerySapXML */) {
	"use strict";

	function alertError(oError) {
		jQuery.sap.log.error(oError, oError.stack,
			"sap.ui.core.sample.ViewTemplate.scenario.Main");
		MessageBox.alert(oError.message, {
			icon: sap.m.MessageBox.Icon.ERROR,
			title: "Error"});
	}

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
			var bIsRealOData,
				oMetaModel,
				oView = this.getView(),
				that = this;

			if (!oView.getModel("ui")) {
				bIsRealOData = jQuery.sap.getUriParameters().get("realOData") === "true";
				oMetaModel = oView.getModel().getMetaModel();
				oMetaModel.loaded().then(function () {
					var aEntitySets = oMetaModel.getODataEntityContainer().entitySet,
						oUiModel = new JSONModel({
							bindTexts : false,
							entitySet : aEntitySets,
							icon : bIsRealOData ? "sap-icon://building" : "sap-icon://record",
							iconTooltip
								: bIsRealOData ? "real OData service" : "mock OData service",
							selectedEntitySet : aEntitySets[0].name
						});

					oView.setModel(oUiModel, "ui");

					that._bindSelectInstance();
				})["catch"](alertError);
			}
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
			var oMetaModel = this.getView().getModel().getMetaModel(),
				that = this;

			oMetaModel.loaded().then(function () {
				var oDetailBox = that.getView().byId("detailBox"),
					oDetailView,
					sMetadataPath = oMetaModel.getODataEntitySet(that._getSelectedSet(), true),
					iStart;

				Component.getOwnerComponentFor(that.getView()).runAsOwner(function () {
					oDetailView = sap.ui.view({
						preprocessors: {
							xml: {
								bindingContexts: {
									meta: oMetaModel.createBindingContext(sMetadataPath)
								},
								models: {
									meta: oMetaModel
								},
								bindTexts: that.getView().getModel("ui").getProperty("/bindTexts")
							}
						},
						type: sap.ui.core.mvc.ViewType.XML,
						viewName: "sap.ui.core.sample.ViewTemplate.scenario.Detail"
					});
					oDetailView.bindElement(sPath);
				});

				oDetailBox.destroyContent();
				iStart = Date.now();
				oDetailBox.addContent(oDetailView);
				jQuery.sap.log.info("addContent took " + (Date.now() - iStart) + " ms", null,
					"sap.ui.core.sample.ViewTemplate.scenario.Main");

				that.onSourceCode();
			})["catch"](alertError);
		}
	});

	/**
	 * Custom formatter function for complex bindings to demonstrate access to ith part of binding.
	 * Delegates to {@link sap.ui.model.odata.AnnotationHelper#format} and wraps label texts in
	 * square brackets. Joins parts together, separated by a space.
	 *
	 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
	 *   the callback interface related to the current formatter call
	 * @param {...any} [vRawValue]
	 *   the raw value(s) from the meta model
	 * @returns {string}
	 *   the resulting string value to write into the processed XML
	 */
	sap.ui.core.sample.ViewTemplate.scenario.formatParts = function (oInterface, vRawValue) {
		var i, aResult;

		/*
		 * Delegates to {@link sap.ui.model.odata.AnnotationHelper#format} and wraps label texts
		 * in square brackets.
		 *
		 * @param {sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {any} [vRawValue0]
		 *   the raw value from the meta model
		 * @returns {string}
		 */
		function formatLabelValue(oInterface, vRawValue0) {
			var sResult = sap.ui.model.odata.AnnotationHelper.format(oInterface, vRawValue0);
			return jQuery.sap.endsWith(oInterface.getPath(), "/Label")
				? "[" + sResult + "]"
				: sResult;
		}

		try {
			if (oInterface.getModel()) {
				return formatLabelValue(oInterface, vRawValue);
			} else {
				// root formatter for a composite binding
				aResult = [];
				// "probe for the smallest non-negative integer"
				for (i = 0; oInterface.getModel(i); i += 1) {
					aResult.push(
						// Note: arguments[i + 1] is the raw value of the ith part!
						formatLabelValue(oInterface.getInterface(i), arguments[i + 1])
					);
				}
				return aResult.join(" ");
			}
		} catch (e) {
			return e.message;
		}
	};
	sap.ui.core.sample.ViewTemplate.scenario.formatParts.requiresIContext = true;

	return MainController;

});
