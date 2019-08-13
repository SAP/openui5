sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/BindingMode",
	"../model/ExploreNavigationModel",
	"../model/ExploreSettingsModel",
	"sap/m/MessageToast",
	"sap/f/GridContainerItemLayoutData",
	"sap/ui/Device"
], function (
	BaseController,
	JSONModel,
	BindingMode,
	exploreNavigationModel,
	exploreSettingsModel,
	MessageToast,
	GridContainerItemLayoutData,
	Device
) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cardExplorer.controller.ExploreSamples", {

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("exploreSamples").attachMatched(this._onRouteMatched, this);

			this.oModel = new JSONModel();
			this.oModel.setDefaultBindingMode(BindingMode.OneWay);

			this.getView().setModel(this.oModel);
			this.getView().setModel(exploreSettingsModel, "settings");
			this._editor = this.byId("editor");
			//This will prevent all auto complete and suggestions of the editor
			this._editor._oEditor.completers = [];

			//This catches any "json" validation errors that ware made inside the editor
			this._editor._oEditor.session.on("changeAnnotation", this._onSyntaxError.bind(this));

			//This catches any error that was produced by the card
			this.byId("cardSample").attachEvent("_error", this._onCardError, this);

			this._errorMessageStrip = this.getView().byId("errorMessageStrip");
			this._registerResize();

			this.byId("cardSample").attachEvent("action", this._onCardAction, this);
		},

		onExit: function () {
			this._deregisterResize();
		},

		onManifestEdited: function (oEvent) {
			var sValue = oEvent.getParameter("value") || oEvent.getParameter("json");

			if (exploreSettingsModel.getProperty("/autoRun")) {
				this._updateSample(sValue);
			}
		},
		onRunPressed: function (oEvent) {
			var sValue = this.getView().byId("editor").getValue();
			this._updateSample(sValue);
		},

		onChangeEditorClick: function() {
			var sEditorType = exploreSettingsModel.getProperty("/editorType");
			if (sEditorType === "text") {
				exploreSettingsModel.setProperty("/editorType", "card");
			} else {
				exploreSettingsModel.setProperty("/editorType", "text");
			}
		},

		onChangeSplitterOrientation: function (oEvent) {
			//Toggles the value of splitter orientation
			exploreSettingsModel.setProperty("/splitViewVertically", !exploreSettingsModel.getProperty("/splitViewVertically"));
			var isOrientationVertical = exploreSettingsModel.getProperty("/splitViewVertically");
			this.getView().byId("splitView").getRootPaneContainer().setOrientation(isOrientationVertical ? "Vertical" : "Horizontal");
		},

		showError: function (sMessage) {
			this._errorMessageStrip.setVisible(true);
			this._errorMessageStrip.setText(sMessage);
		},

		onSubSampleChange: function (oEvent) {
			var item = oEvent.getParameter('selectedItem');

			this.getRouter().navTo(
				"exploreSamples",
				{
					key: this.oModel.getProperty("/sample").key,
					subSampleKey: item.getKey()
				}
			);
		},

		_onSyntaxError: function () {
			var aErrorAnnotations = this._editor._oEditor.session.$annotations,
				sMessage = "";
			if (aErrorAnnotations.length) {
				aErrorAnnotations.forEach(function (oError) {
					sMessage += "Line " + String(oError.row) + ": " + oError.text + '\n';
				});
				this.showError(sMessage);
			}
		},

		_onCardError: function (oEvent) {
			this.showError(oEvent.getParameters().message);
		},

		_deregisterResize: function () {
			Device.media.detachHandler(this._onResize, this);
		},

		_registerResize: function () {
			Device.media.attachHandler(this._onResize, this);
			this._onResize();
		},

		_onResize: function () {
			var isOrientationVertical = exploreSettingsModel.getProperty("/splitViewVertically"),
				sRangeName = Device.media.getCurrentRange("StdExt").name;

			if (sRangeName == "Tablet" || sRangeName == "Phone" && !isOrientationVertical) {
				exploreSettingsModel.setProperty("/splitViewVertically", true);
				this.getView().byId("splitView").getRootPaneContainer().setOrientation("Vertical");
			}
		},

		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments"),
				sSampleKey = oArgs["key"],
				oSample = this._findSample(sSampleKey),
				sSubSampleKey = oArgs["subSampleKey"],
				oSubSample;

			// reset the model
			this.oModel.setData({});

			if (!oSample) {
				//TODO sample not found
				return;
			}

			if (oSample.subSamples && !sSubSampleKey) {
				// select the first sub sample
				sSubSampleKey = oSample.subSamples[0].key;
			}

			oSubSample = this._findSubSample(oSample, sSubSampleKey);
			if (sSubSampleKey && !oSubSample) {
				//TODO sub sample not found
				return;
			}

			this._showSample(oSample, oSubSample);
		},

		_onCardAction: function (oEvent) {
			var sType = oEvent.getParameter("type"),
				mParameters = oEvent.getParameter("manifestParameters"),
				sMessage;

			sMessage = "Action '" + sType + "'";
			if (mParameters) {
				sMessage += " with parameters '" + JSON.stringify(mParameters) + "'";
			}

			MessageToast.show(sMessage, {
				at: "center center",
				width: "25rem"
			});
		},

		_findSample: function (sSampleKey) {
			var aSections = exploreNavigationModel.getProperty("/navigation"),
				oFoundSample;

			// loops through all samples in the navigation and gets the current one
			aSections.some(function (oSection) {
				oSection.items.some(function (oSample) {
					if (oSample.key === sSampleKey) {
						oFoundSample = oSample;
						return true;
					}
				});
			});

			return oFoundSample;
		},

		_findSubSample: function (oSample, sSubSampleKey) {
			var oFoundSubSample;

			if (!sSubSampleKey) {
				return null;
			}

			oSample.subSamples.some(function (oSubSample) {
				if (oSubSample.key === sSubSampleKey) {
					oFoundSubSample = oSubSample;
					return true;
				}
			});

			return oFoundSubSample;
		},

		_showSample: function (oSample, oSubSample) {
			var sManifestUrl,
				oLayoutSettings = {
					minRows: 1,
					columns: 4
				},
				oCard = this.byId("cardSample"),
				bEditable = true;

			this.oModel.setProperty("/sample", oSample);

			if (oSubSample) {
				this.oModel.setProperty("/subSample", oSubSample);
				oLayoutSettings = Object.assign(oLayoutSettings, oSubSample.settings);
				sManifestUrl = oSubSample.manifestUrl;
			} else {
				oLayoutSettings = Object.assign(oLayoutSettings, oSample.settings);
				sManifestUrl = oSample.manifestUrl;
			}

			if (oCard) {
				oCard.setLayoutData(new GridContainerItemLayoutData(oLayoutSettings));
				this.byId("cardContainer").invalidate();
			}

			if (!sManifestUrl) {
				// TODO no manifest for the given sample or sub sample
				return;
			}

			sManifestUrl = sap.ui.require.toUrl("sap/ui/demo/cardExplorer" + sManifestUrl);

			if (oSample.disableEditor) {
				oCard.setManifest(sManifestUrl);
				bEditable = false;
			}

			this.getModel("settings").setProperty("/editable", bEditable);

			this._loadManifest(sManifestUrl);
		},

		_loadManifest: function (sManifestUrl) {
			jQuery.ajax(sManifestUrl, {
				async: true,
				dataType: "text",
				success: function (sValue) {
					this.byId("editor").setValue(sValue);
					this.byId("cardEditor").setJson(sValue);
				}.bind(this)
			});
		},

		_updateSample: function (aValue) {
			if (!aValue) {
				// TODO hide the card or something like that. Currently it shows busy indicator which might be confusing
				this.byId("cardSample").setManifest(null);
				return;
			}

			try {
				if (typeof aValue === "string") {
					aValue = JSON.parse(aValue);
				}
				this.byId("cardSample").setManifest(aValue);
				this._errorMessageStrip.setVisible(false);
				this.byId("cardSample").refresh();
			} catch (oException) {
				this.byId("cardSample").setManifest(null);
			}

		}
	});
});