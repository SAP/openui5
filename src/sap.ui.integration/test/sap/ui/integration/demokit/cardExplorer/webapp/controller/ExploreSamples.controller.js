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

		formatter: formatter,

		constructor: function () {
			this.onFileEditorManifestChangeDebounced = _debounce(this.onFileEditorManifestChangeDebounced, 100);
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

			this.oModel = new JSONModel({
				schemaErrors: ""
			});
			this.oModel.setDefaultBindingMode(BindingMode.OneWay);

			this.getView().setModel(this.oModel);
			this.getView().setModel(exploreSettingsModel, "settings");

			this._fileEditor = this.byId("fileEditor");

			//This catches any error that was produced by the card
			this.byId("cardSample").attachEvent("_error", this._onCardError, this);
			this._registerResize();
			this._initIFrameCreation();
		},

		onExit: function () {
			this._deregisterResize();
		},

		/**
		 * Syncs CodeEditor & CardEditor. Updates the manifest of the card, if autoRun is enabled. Validates the schema, if enabled.
		 * @param {string} sValue Current value of the CodeEditor
		 */
		onFileEditorManifestChangeDebounced: function (sValue) {
			if (!this._sEditSource) {
				this._sEditSource = "codeEditor";
			}
			var oCardEditor = this.byId("cardEditor");
				oCardEditor.setJson(sValue);

			this._sEditSource = null;

			if (exploreSettingsModel.getProperty("/schemaValidation")) {
				this.validateManifest();
			}

			if (exploreSettingsModel.getProperty("/autoRun")) {
				this._updateSample(sValue);
			}
		},

		onFileEditorManifestChange: function (oEvent) {
			if (this._sEditSource !== "cardEditor") {
				var sValue = oEvent.getParameter("value");
				this.onFileEditorManifestChangeDebounced(sValue);
			}
		},

		onCardEditorChangeDebounced: function (mValue) {
			if (!this._sEditSource) {
				this._sEditSource = "cardEditor";
			}

			var sValue = JSON.stringify(mValue, '\t', 4);
			this._fileEditor.setManifestContent(sValue);
			this._updateSample(sValue);
			this._sEditSource = null;
		},

		onCardEditorChange: function (oEvent) {
			if (this._sEditSource !== "codeEditor") {
				var mValue = oEvent.getParameter("json");
				this.onCardEditorChangeDebounced(mValue);
			}
		},

		onFileSwitch: function (oEvent) {
			exploreSettingsModel.setProperty("/editable", oEvent.getParameter("editable"));
		},

		onRunPressed: function (oEvent) {
			this._fileEditor.getManifestContent().then(this._updateSample.bind(this));
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
			this._fileEditor.getManifestContent().then(function (sJSON) {
				FileUtils.downloadFile(sJSON, "manifest", "json", "application/json");
			});
		},

		/**
		 * Downloads all files that the example consists of.
		 * @param {string} sExtension The archive extension.
		 */
		_onDownloadCompressed: function (sExtension) {
			Promise.all([
				this._fileEditor.getManifestContent(),
				this._fileEditor.getFilesWithContent()
			]).then(function (aArgs) {
				var MANIFEST = 0,
					FILES = 1;

				var sArchiveName = formatter.formatExampleName(JSON.parse(aArgs[MANIFEST]));

				FileUtils.downloadFilesCompressed(aArgs[FILES], sArchiveName, sExtension);
			});
		},

		onDownloadZip: function () {
			this._onDownloadCompressed("card.zip");
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

		_onCardError: function (oEvent) {
			this._fileEditor.showError(oEvent.getParameters().message);
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

			var oSubSampleOrSample = oSubSample || oSample;

			this._fileEditor.setFiles(oSubSampleOrSample.files || [{
				url: oSubSampleOrSample.manifestUrl,
				name: 'manifest.json',
				key: 'manifest.json',
				content: ''
			}]);

			this._showSample(oSample, oSubSample);
		},

		_onCardAction: function (oEvent) {
			var sType = oEvent.getParameter("type"),
				mParameters = oEvent.getParameter("parameters"),
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
				oFrameWrapperEl = this.byId("iframeWrapper"),
				bUseIFrame = !!oCurrentSample.useIFrame;

			// init mock server only on demand
			if (oCurrentSample.key === "topProducts" || oCurrentSample.key === "product") {
				mockServer.init();
			}

			exploreSettingsModel.setProperty("/useIFrame", bUseIFrame);

			this.oModel.setProperty("/sample", oSample);

			if (oSubSample) {
				this.oModel.setProperty("/subSample", oSubSample);
			}

			if (bUseIFrame) {
				oFrameWrapperEl._sSample = oSubSample ? oSample.key + "/" + oSubSample.key : oSample.key;
				oFrameWrapperEl.invalidate();
			} else {
				var sManifestUrl = this._fileEditor.getManifestFile().url,
					oLayoutSettings = {
						minRows: 1,
						columns: 4
					},
					oCard = this.byId("cardSample");

				oFrameWrapperEl._sSample = '';

				oLayoutSettings = Object.assign(oLayoutSettings, oCurrentSample.settings);

				if (oCard) {
					oCard.setLayoutData(new GridContainerItemLayoutData(oLayoutSettings));
					this.byId("cardContainer").invalidate();
				}

				sManifestUrl = sap.ui.require.toUrl("sap/ui/demo/cardExplorer" + sManifestUrl);
				this._sSampleManifestUrl = sManifestUrl;
			}
		},

		_initIFrameCreation : function () {
			var oFrameWrapperEl = this.byId("iframeWrapper"),
				oDelegate = {
						onAfterRendering: function () {
						var oFrameWrapperElDomRef = oFrameWrapperEl.getDomRef(),
							oFrame;

						if (oFrameWrapperElDomRef.firstChild) {
							oFrameWrapperElDomRef.removeChild(oFrameWrapperElDomRef.firstChild);
						}

						if (oFrameWrapperEl._sSample) {
							oFrame = this.createFrame(oFrameWrapperEl._sSample);
							oFrameWrapperElDomRef.appendChild(oFrame);
						}
					}
				};

			oFrameWrapperEl.addEventDelegate(oDelegate, this);
		},

		createFrame: function(sSample) {
			var oFrameEl = document.createElement("iframe");
			oFrameEl.src = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/samples/" + sSample + "/index.html");
			oFrameEl.width = "100%";
			oFrameEl.className = "sapUiTopicsIframe";
			oFrameEl.sandbox = "allow-forms allow-modals allow-pointer-lock allow-popups allow-scripts";
			return oFrameEl;
		},

		/**
		 * Reflects changes in the code editor to the card.
		 * @param {string} sValue The value of the manifest.json file.
		 */
		_updateSample: function (sValue) {
			var oValue = JSON.parse(sValue);

			if (!sValue) {
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
				} catch (oException) {
					this.byId("cardSample").setManifest(null);
				}
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
		},

		/**
		 * Validates the current [sap.card] manifest and shows errors, if any.
		 */
		validateManifest: function () {
			this._fileEditor.validateManifest();
		},

		/**
		 * Handler for selection of "Schema Validation" checkbox.
		 * @param {jQuery.Event} oEvent The given event.
		 */
		onSchemaValidationCheck: function (oEvent) {
			if (oEvent.getParameter("selected")) {
				this.validateManifest();
			}
		}
	});
});
