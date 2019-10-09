sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/BindingMode",
	"../model/ExploreNavigationModel",
	"../model/ExploreSettingsModel",
	"sap/m/MessageToast",
	"sap/f/GridContainerItemLayoutData",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function (
	BaseController,
	JSONModel,
	BindingMode,
	exploreNavigationModel,
	exploreSettingsModel,
	MessageToast,
	GridContainerItemLayoutData,
	Device,
	jQuery
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

			// model which is used when all files are shown in the editor (not only manifest.json)
			this.getView().setModel(new JSONModel({
				files: [],
				selectedFileKey: "index.html"
			}), "extendedFileEditor");

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
				this._reflectManifestChanges(sValue);
			}
		},

		onFileSwitch: function (oEvent) {
			var oExtendedFileEditorModel = this.getView().getModel("extendedFileEditor"),
				sSelectedFileKey = oEvent.getParameter("selectedKey"),
				iSelectedFileIndex = oExtendedFileEditorModel.getProperty("/files/").findIndex(function (oEl) { return oEl.key === sSelectedFileKey;}),
				sFileExtension = sSelectedFileKey.split('.').pop(),
				oEditor = this.byId("editor");

			exploreSettingsModel.setProperty("/editable", this._isFileEditable(sSelectedFileKey));
			exploreSettingsModel.setProperty("/codeEditorType", sFileExtension);
			oEditor.setValue(oExtendedFileEditorModel.getProperty("/files/" + iSelectedFileIndex + "/content"));
		},

		onRunPressed: function (oEvent) {
			var sValue = this.getView().byId("editor").getValue();
			this._reflectManifestChanges(sValue);
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
			if (sMessage) {
				this._errorMessageStrip.setVisible(true);
				this._errorMessageStrip.setText(sMessage);
			}
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

			if (aErrorAnnotations && aErrorAnnotations.length) {
				aErrorAnnotations.forEach(function (oError) {
					sMessage += "Line " + String(oError.row) + ": " + oError.text + '\n';
				});
				this.showError(sMessage);
			} else {
				this._errorMessageStrip.setVisible(false);
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

			if (oSample.files) {
				exploreSettingsModel.setProperty("/useExtendedFileEditor", false);
				this._showExtendedFileEditor(oSample);
				exploreSettingsModel.setProperty("/codeEditorType", "html");
			} else {
				exploreSettingsModel.setProperty("/useExtendedFileEditor", true);
				this._showSample(oSample, oSubSample);
				exploreSettingsModel.setProperty("/codeEditorType", "json");
				exploreSettingsModel.setProperty("/editable", true);
			}

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
				oCard = this.byId("cardSample");

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

			this._loadManifest(sManifestUrl);
			this._sSampleManifestUrl = sManifestUrl;
		},

		_showExtendedFileEditor: function (oSample) {

			var oExtendedFileEditorModel = this.getView().getModel("extendedFileEditor"),
				sSelectedFileKey = this.getView().getModel("extendedFileEditor").getProperty("/selectedFileKey"),
				oEditor = this.byId("editor");

			oExtendedFileEditorModel.setProperty("/files", oSample.files);

			// fetch the initial content of the sample files for "consumption in html" example
			var aPromises = oSample.files.map(function (oFile, iIndex) {
					return jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/cardExplorer" + oFile.url), { dataType: "text" })
						.done(function (oData) {
							oExtendedFileEditorModel.setProperty("/files/" + iIndex + "/content", oData);
						});
				});

			// when the data is fetched we can set the code editor value
			Promise.all(aPromises)
				.then(function (aData) {
					var iSelectedFileIndex = oExtendedFileEditorModel.getProperty("/files/").findIndex(function (oEl) { return oEl.key === sSelectedFileKey;}),
						sFileExtension = sSelectedFileKey.split('.').pop();

					exploreSettingsModel.setProperty("/editable", this._isFileEditable(sSelectedFileKey));
					exploreSettingsModel.setProperty("/codeEditorType", sFileExtension);
					oEditor.setValue(aData[iSelectedFileIndex]);
				}.bind(this));

			var oFrameWrapperEl = this.byId("iframeWrapper");
			var oDelegate = {
				onAfterRendering: function () {
					oFrameWrapperEl.removeEventDelegate(oDelegate);
					var oFrame = this.createFrame();
					oFrameWrapperEl.getDomRef().appendChild(oFrame);
				}
			};

			oFrameWrapperEl.addEventDelegate(oDelegate, this);
		},

		createFrame: function() {
			var oFrameEl = document.createElement("iframe");
			oFrameEl.src = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/samples/htmlConsumption/index.html");
			oFrameEl.width = "100%";
			oFrameEl.className = "sapUiTopicsIframe";
			oFrameEl.sandbox = "allow-forms allow-modals allow-pointer-lock allow-popups allow-scripts";
			return oFrameEl;
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
				var sBaseUrl = this._sSampleManifestUrl.substring(0, this._sSampleManifestUrl.length - "manifest.json".length);
				this.byId("cardSample").setBaseUrl(sBaseUrl);
				this.byId("cardSample").setManifest(aValue);
				this._errorMessageStrip.setVisible(false);
				this.byId("cardSample").refresh();
			} catch (oException) {
				this.byId("cardSample").setManifest(null);
			}

		},

		_isFileEditable: function (sFileName) {
			// allow editing only .json files
			return sFileName.endsWith("manifest.json");
		},

		_reflectManifestChanges: function (sValue) {
			if (!exploreSettingsModel.getProperty("/useExtendedFileEditor")) {
				var oFrameWrapperEl = this.byId('iframeWrapper');
				var oFrame = oFrameWrapperEl.$().find("iframe")[0];

				if (oFrame.contentWindow) {
					// send value of the edited manifest to the card inside the iframe
					oFrame.contentWindow.postMessage({ "manifest": sValue }, "*");
				}
			} else {
				this._updateSample(sValue);
			}
		}
	});
});