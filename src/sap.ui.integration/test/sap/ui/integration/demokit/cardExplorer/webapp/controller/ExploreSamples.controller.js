sap.ui.define([
	"sap/ui/demo/cardExplorer/controller/BaseController",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/BindingMode",
	"../model/ExploreNavigationModel",
	"../model/ExploreSettingsModel",
	"../model/formatter",
	"../util/FileUtils",
	"../localService/SEPMRA_PROD_MAN/mockServer",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/FormattedText",
	"sap/f/GridContainerItemLayoutData",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/restricted/_debounce"
], function (
	BaseController,
	JSONModel,
	BindingMode,
	exploreNavigationModel,
	exploreSettingsModel,
	formatter,
	FileUtils,
	mockServer,
	MessageToast,
	Dialog,
	Button,
	library,
	FormattedText,
	GridContainerItemLayoutData,
	Device,
	jQuery,
	_debounce
) {
	"use strict";

	var ButtonType = library.ButtonType;

	return BaseController.extend("sap.ui.demo.cardExplorer.controller.ExploreSamples", {

		constructor: function () {
			this.onCodeEditorChangeDebounced = _debounce(this.onCodeEditorChangeDebounced, 100);
			this.onCardEditorChangeDebounced = _debounce(this.onCardEditorChangeDebounced, 100);
			this._sEditSource = null;

			BaseController.apply(this, arguments);
		},

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
		},

		onExit: function () {
			this._deregisterResize();
		},

		onCodeEditorChangeDebounced: function (sValue) {
			if (!this._sEditSource) {
				this._sEditSource = "codeEditor";
			}
			var oCardEditor = this.byId("cardEditor");
			oCardEditor.setJson(sValue);
			this._updateSample(sValue);
			this._sEditSource = null;

		},
		onCodeEditorChange: function (oEvent) {

			if (this._bPreventLiveChange) {
				return;
			}

			if (this._sEditSource !== "cardEditor" && exploreSettingsModel.getProperty("/autoRun")) {
				var sValue = oEvent.getParameter("value");
				this.onCodeEditorChangeDebounced(sValue);
			}
		},

		onCardEditorChangeDebounced: function (mValue) {
			if (!this._sEditSource) {
				this._sEditSource = "cardEditor";
			}
			this._editor.setValue(JSON.stringify(mValue, '\t', 4));
			this._updateSample(mValue);
			this._sEditSource = null;
		},

		onCardEditorChange: function (oEvent) {
			if (this._sEditSource !== "codeEditor") {
				var mValue = oEvent.getParameter("json");
				this.onCardEditorChangeDebounced(mValue);
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
			this._bPreventLiveChange = true;
			// setValue would trigger 2 live change events - 1 delete and 1 insert. This will refresh the card several times, so prevent it
			oEditor.setValue(oExtendedFileEditorModel.getProperty("/files/" + iSelectedFileIndex + "/content"));
			this._bPreventLiveChange = false;

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

		/**
		 * Downloads only the manifest.json file.
		 */
		onDownloadManifestFile: function () {
			var oManifestFile = this._getManifestFileAsJson(),
				sJSON = JSON.stringify(oManifestFile, null, "\t");

			FileUtils.downloadFile(sJSON, "manifest", "json", "application/json");
		},

		/**
		 * Downloads all files that the example consists of.
		 * @param {string} sExtension The archive extension.
		 */
		_onDownloadCompressed: function (sExtension) {
			var oCardEditor = this.byId("cardEditor"),
				aFiles,
				oJSON,
				sArchiveName = formatter._formatExampleName(this._getManifestFileAsJson());

			if (exploreSettingsModel.getProperty("/useExtendedFileEditor")) {
				aFiles = this.getModel("extendedFileEditor").getProperty("/files");
			} else {
				oJSON = oCardEditor.getJson();

				aFiles = [
					{
						name: "manifest.json",
						content: JSON.stringify(oJSON, null, "\t")
					}
				];
			}

			FileUtils.downloadFilesCompressed(aFiles, sArchiveName, sExtension);
		},

		onDownloadZip: function () {
			this._onDownloadCompressed(".card.zip");
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
				oSubSample,
				bUseExtendedEditor;

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

			bUseExtendedEditor = !!oSample.files || !!(oSubSample && oSubSample.files);
			exploreSettingsModel.setProperty("/useExtendedFileEditor", bUseExtendedEditor);

			if (bUseExtendedEditor) {
				this._showExtendedFileEditor(oSubSample || oSample);
			} else {
				exploreSettingsModel.setProperty("/codeEditorType", "json");
				exploreSettingsModel.setProperty("/editable", true);
			}

			this._showSample(oSample, oSubSample);
		},

		_onCardAction: function (oEvent) {
			var sType = oEvent.getParameter("type"),
				mParameters = oEvent.getParameter("manifestParameters"),
				sKey = exploreNavigationModel.getProperty("/selectedKey"),
				sMessage;

			if (sKey === "dataSources") {
				this._openConfirmNavigationDialog(mParameters);
			} else {
				sMessage = "Action '" + sType + "'";

				if (mParameters) {
					sMessage += " with parameters '" + JSON.stringify(mParameters) + "'";
				}

				MessageToast.show(sMessage, {
					at: "center center",
					width: "25rem"
				});
			}
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

			var oCurrentSample = oSubSample || oSample,
				bUseIFrame = oCurrentSample.key === "htmlConsumption";

			// init mock server only on demand
			if (oCurrentSample.key === "topProducts" || oCurrentSample.key === "product") {
				mockServer.init();
			}

			exploreSettingsModel.setProperty("/useIFrame", bUseIFrame);

			if (bUseIFrame) {
				var oFrameWrapperEl = this.byId("iframeWrapper"),
					oDelegate = {
						onAfterRendering: function () {
							oFrameWrapperEl.removeEventDelegate(oDelegate);
							var oFrame = this.createFrame();
							oFrameWrapperEl.getDomRef().appendChild(oFrame);
						}
					};

				oFrameWrapperEl.addEventDelegate(oDelegate, this);
			} else {
				var sManifestUrl = oCurrentSample.manifestUrl,
					oLayoutSettings = {
						minRows: 1,
						columns: 4
					},
					oCard = this.byId("cardSample"),
					aFiles,
					oManifestFile;

				this.oModel.setProperty("/sample", oSample);

				if (oSubSample) {
					this.oModel.setProperty("/subSample", oSubSample);
				}

				oLayoutSettings = Object.assign(oLayoutSettings, oCurrentSample.settings);

				if (oCard) {
					oCard.setLayoutData(new GridContainerItemLayoutData(oLayoutSettings));
					this.byId("cardContainer").invalidate();
				}

				if (oCurrentSample.files) {
					aFiles = oCurrentSample.files;
					oManifestFile = aFiles.find(function (oFile) {
						return oFile.name === "manifest.json";
					});
					sManifestUrl = oManifestFile.url;
				}

				if (!sManifestUrl) {
					// TODO no manifest for the given sample or sub sample
					return;
				}

				sManifestUrl = sap.ui.require.toUrl("sap/ui/demo/cardExplorer" + sManifestUrl);

				this._loadManifest(sManifestUrl);
				this._sSampleManifestUrl = sManifestUrl;
			}
		},

		_showExtendedFileEditor: function (oSample) {
			var oExtendedFileEditorModel = this.getView().getModel("extendedFileEditor"),
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
					var aFiles = oExtendedFileEditorModel.getProperty("/files/"),
						sFileExtension = aFiles[0].name.split('.').pop();

					oExtendedFileEditorModel.setProperty("/selectedFileKey", aFiles[0].key);
					exploreSettingsModel.setProperty("/editable", this._isFileEditable(aFiles[0].key));
					exploreSettingsModel.setProperty("/codeEditorType", sFileExtension);
					oEditor.setValue(aData[0]);
				}.bind(this));
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

					// code editor's change event would trigger updateSample, so avoid calling it twice
					if (!exploreSettingsModel.getProperty("/autoRun")) {
						this._updateSample(sValue);
					}
				}.bind(this)
			});
		},

		/**
		 * Reflects changes in the code editor to the card.
		 * @param {string|object} vValue The value of the manifest.json file.
		 */
		_updateSample: function (vValue) {
			var oValue,
				sValue;

			if (typeof vValue === "string") {
				sValue = vValue;
				oValue = JSON.parse(vValue);
			} else {
				sValue = JSON.stringify(vValue, null, "\t");
				oValue = vValue;
			}

			if (!vValue) {
				// TODO hide the card or something like that. Currently it shows busy indicator which might be confusing
				this.byId("cardSample").setManifest(null);
				return;
			}

			if (exploreSettingsModel.getProperty("/useIFrame")) {
				var oFrameWrapperEl = this.byId('iframeWrapper');
				var oFrame = oFrameWrapperEl.$().find("iframe")[0];

				if (oFrame.contentWindow) {
					// send value of the edited manifest to the card inside the iframe
					oFrame.contentWindow.postMessage({ "manifest": sValue }, "*");
				}
			} else {
				try {
					var sManifestFileName = this._sSampleManifestUrl.split("/").pop(),
						sBaseUrl = this._sSampleManifestUrl.substring(0, this._sSampleManifestUrl.length - sManifestFileName.length);

					this.byId("cardSample")
						.setBaseUrl(sBaseUrl)
						.setManifest(oValue)
						.refresh();
					this._errorMessageStrip.setVisible(false);
				} catch (oException) {
					this.byId("cardSample").setManifest(null);
				}
			}

			if (exploreSettingsModel.getProperty("/useExtendedFileEditor")) {
				var oExtendedFileEditorModel = this.getView().getModel("extendedFileEditor"),
					iManifestFileIndex = oExtendedFileEditorModel.getProperty("/files/").findIndex(function (oEl) { return oEl.key === "manifest.json";});

				oExtendedFileEditorModel.setProperty("/files/" + iManifestFileIndex + "/content", sValue);
			}
		},

		/**
		 * @param {string} sFileName The name of the file.
		 * @returns {boolean} Whether the file is editable.
		 */
		_isFileEditable: function (sFileName) {
			return sFileName.endsWith("manifest.json");
		},

		/**
		 * Returns the manifest.json file of the current example in JSON format.
		 * @return {object} The manifest.json.
		 */
		_getManifestFileAsJson: function () {
			var aFiles,
				oManifestFile,
				oCardEditor = this.byId("cardEditor");

			if (exploreSettingsModel.getProperty("/useExtendedFileEditor")) {
				aFiles = this.getModel("extendedFileEditor").getProperty("/files");
				oManifestFile = aFiles.find(function (oFile) {
					return oFile.name === "manifest.json";
				});

				return JSON.parse(oManifestFile.content);
			} else {
				return oCardEditor.getJson();
			}
		},

		/**
		 * Shows confirmation dialog before doing navigation to another app.
		 * @param {object} mParameters Parameters from manifest action.
		 */
		_openConfirmNavigationDialog: function (mParameters) {

			var oDialog = new Dialog({
				title: "Confirm Navigation to App",
				content: [
					new FormattedText({
						htmlText: "<p class='sapUiNoMargin'><span class='sapMText'>You are about to open </span></p>"
									+ "<cite class='sapMText'>" + mParameters.url + "</cite>"
									+ "<p class='sapUiNoMargin'>"
									+ "<span class='sapMText'>This is the Manage Products Fiori Reference App. If you don't have registration for it, follow the instructions "
									+ "<a target='_blank' href='https://developers.sap.com/tutorials/gateway-demo-signup.html'>here</a>. "
									+ "Do you want to continue?" + "</span></p>",
						width: "100%"
					})
				],
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: "Navigate",
					press: function () {
						window.open(mParameters.url, "_blank");
						oDialog.close();
					}
				}),
				endButton: new Button({
					text: "Cancel",
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			}).addStyleClass("sapUiSizeCompact sapUiResponsiveContentPadding");

			oDialog.open();
		}
	});
});
