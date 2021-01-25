sap.ui.define([
	"./BaseController",
	"../Constants",
	"../model/ExploreNavigationModel",
	"../model/ExploreSettingsModel",
	"../model/formatter",
	"../util/FileUtils",
	"../localService/SEPMRA_PROD_MAN/mockServer",
	"../localService/graphql/mockServer",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/FormattedText",
	"sap/f/GridContainerItemLayoutData",
	"sap/ui/core/Core",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/Device",
	"sap/ui/integration/util/loadCardEditor",
	"sap/base/util/restricted/_debounce"
], function (
	BaseController,
	Constants,
	exploreNavigationModel,
	exploreSettingsModel,
	formatter,
	FileUtils,
	SEPMRA_PROD_MAN_mockServer,
	graphql_mockServer,
	MessageToast,
	Dialog,
	Button,
	mLibrary,
	FormattedText,
	GridContainerItemLayoutData,
	Core,
	Fragment,
	JSONModel,
	BindingMode,
	Device,
	loadCardEditor,
	_debounce
) {
	"use strict";

	var ButtonType = mLibrary.ButtonType;

	var SAMPLE_CHANGED_ERROR = "Sample changed";

	return BaseController.extend("sap.ui.demo.cardExplorer.controller.ExploreSamples", {

		formatter: formatter,

		constructor: function () {
			this.onFileEditorManifestChangeDebounced = _debounce(this.onFileEditorManifestChangeDebounced, Constants.DEBOUNCE_TIME);
			this.onFileEditorDesigntimeChangeDebounced = _debounce(this.onFileEditorDesigntimeChangeDebounced, Constants.DEBOUNCE_TIME);
			this.onCardEditorConfigurationChangeDebounced = _debounce(this.onCardEditorConfigurationChangeDebounced, Constants.DEBOUNCE_TIME);
			this._sEditSource = null;

			BaseController.apply(this, arguments);
		},

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("exploreSamples").attachMatched(this._onRouteMatched, this);

			this.oModel = new JSONModel({});
			this.oModel.setDefaultBindingMode(BindingMode.OneWay);

			this.getView().setModel(this.oModel);
			this.getView().setModel(exploreSettingsModel, "settings");

			this._oFileEditor = this.byId("fileEditor");

			this._registerResize();
			this._initIFrameCreation();
		},

		onExit: function () {
			this._deregisterResize();
		},

		/**
		 * Syncs CodeEditor & CardEditor. Updates the manifest of the card, if autoRun is enabled. Validates the schema, if enabled.
		 * @param {string} sValue Current value of the CodeEditor
		 * @param {boolean} bRerender If in rerender model
		 */
		onFileEditorManifestChangeDebounced: function (sValue, bRerender) {
			if ((this._sEditSource !== "cardEditor" || bRerender === true) && this._oVisualEditor) {
				this._oVisualEditor.setJson({});
				this._oVisualEditor.setJson(sValue);
			}

			if (exploreSettingsModel.getProperty("/schemaValidation")) {
				this.validateManifest();
			}

			if (exploreSettingsModel.getProperty("/autoRun")) {
				this._updateSample(sValue);
			}
		},

		onFileEditorManifestChange: function (oEvent) {
			var bRerender = oEvent.getParameter("reRender");
			if (this._sEditSource !== "cardEditor" || bRerender === true) {
				var sValue = oEvent.getParameter("value");
				this.onFileEditorManifestChangeDebounced(sValue, bRerender);
			}
		},

		/**
		 * Syncs CodeEditor & CardEditor. Updates the designtime of the card.
		 * @param {string} sValue Current designtime value of the CodeEditor
		 * @param {boolean} bRerender If in rerender model
		 */
		onFileEditorDesigntimeChangeDebounced: function (sValue, bRerender) {
			if ((this._sEditSource !== "cardEditor" || bRerender === true) && this._oVisualEditor) {
				var oDesigntimeMetadata = this._extractDesigntimeMetadata(sValue);
				this._oVisualEditor.updateDesigntimeMetadata(oDesigntimeMetadata);
				var oJson = this._oVisualEditor.getJson();
				this._oVisualEditor.setJson({});
				this._oVisualEditor.setJson(oJson);
			}
		},

		onFileEditorDesigntimeChange: function (oEvent) {
			var bRerender = oEvent.getParameter("reRender");
			if (this._sEditSource !== "cardEditor" || bRerender === true) {
				var sValue = oEvent.getParameter("value");
				this.onFileEditorDesigntimeChangeDebounced(sValue, bRerender);
			}
		},

		onCardEditorConfigurationChange: function (oEvent) {
			if (this._sEditSource === "cardEditor") {
				this.onCardEditorConfigurationChangeDebounced(oEvent.mParameters);
			}
		},

		onCardEditorConfigurationChangeDebounced: function (oValues) {
			if (this._sEditSource === "cardEditor") {
				var sManifest = JSON.stringify(oValues.manifest, '\t', 4);
				this._oFileEditor.setManifestContent(sManifest);
				var sDesigntimeHeader = "sap.ui.define([\"sap/ui/integration/Designtime\"], function (\n	Designtime\n) {\n	\"use strict\";\n	return function () {\r		return new Designtime(";
				var sDesigntime = sDesigntimeHeader + oValues.configurationstring + ");\n	};\n});\n";
				this._oFileEditor.setDesigntimeContent(sDesigntime);
				this._updateSample(sManifest);
			}
		},

		onFileSwitch: function (oEvent) {
			exploreSettingsModel.setProperty("/editable", oEvent.getParameter("editable"));
		},

		onRunPressed: function (oEvent) {
			this._oFileEditor.getManifestContent().then(this._updateSample.bind(this));
		},

		/**
		 * Handy decorator that executes the callback only if the sample hasn't changed
		 * @param {function} fnCb The callback function
		 * @returns {function} The decorated callback
		 * @throws Will throw an error if the sample changed
		 */
		_cancelIfSampleChanged: function (fnCb) {
			var sCurrentSampleKey = this.getCurrentSampleKey();

			return function (vArgs) {
				// cancel if sample changed before this callback is called
				if (this.getCurrentSampleKey() !== sCurrentSampleKey) {
					throw new Error(SAMPLE_CHANGED_ERROR);
				}
				return fnCb.apply(this, arguments);
			}.bind(this);
		},

		onOpenConfigurationEditor: function (oEvent) {
			var sMode = oEvent.getSource().data("mode");
			var sEditorTitle = {
				admin: "Administrator",
				content: "Page/Content Administrator",
				translator: "Translator"
			}[sMode];

			this._loadCardEditorBundle()
				.then(this._cancelIfSampleChanged(function () {
					return Promise.all([
						Fragment.load({
							name: "sap.ui.demo.cardExplorer.view.CardEditorDialog",
							controller: this
						}),
						this._oFileEditor.getDesigntimeContent()
					]);
				}))
				.then(this._cancelIfSampleChanged(function (aArgs) {
					var oDialog = aArgs[0];

					oDialog.setModel(new JSONModel({
						title: "Configuration Editor for " + sEditorTitle,
						subTitle: "<p>Settings loaded from <em>" + this._oFileEditor.getDesigntimeFile().name + "</em>. "
								+ "You can edit it to adjust editor fields.<p>",
						cardId: this._oCardSample.getId(),
						mode: sMode,
						designtime: this._extractDesigntimeMetadata(aArgs[1])
					}), "config");

					oDialog.open();
				}))
				.catch(function (oErr) {
					if (oErr.message !== SAMPLE_CHANGED_ERROR) {
						this._oFileEditor.showError(oErr.name + ": " + oErr.message);
					}
				}.bind(this));
		},

		onChangeEditor: function (oEvent) {
			var sEditorType = exploreSettingsModel.getProperty("/editorType");

			if (sEditorType === Constants.EDITOR_TYPE.TEXT) {
				exploreSettingsModel.setProperty("/editorType", Constants.EDITOR_TYPE.VISUAL);
				this._sEditSource = "cardEditor";
				this._initVisualEditor();
			} else {
				exploreSettingsModel.setProperty("/editorType", Constants.EDITOR_TYPE.TEXT);
				this._sEditSource = "codeEditor";
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
			this._oFileEditor.getManifestContent().then(function (sJSON) {
				FileUtils.downloadFile(sJSON, "manifest", "json", "application/json");
			});
		},

		/**
		 * Downloads all files that the example consists of.
		 * @param {string} sExtension The archive extension.
		 */
		_onDownloadCompressed: function (sExtension) {
			Promise.all([
				this._oFileEditor.getManifestContent(),
				this._oFileEditor.getFilesWithContent()
			]).then(function (aArgs) {
				var MANIFEST = 0,
					FILES = 1;

				var sArchiveName = formatter.formatExampleName(JSON.parse(aArgs[MANIFEST]));

				FileUtils.downloadFilesCompressed(aArgs[FILES], sArchiveName, sExtension);
			});
		},

		onDownloadZip: function () {
			var sZipName = "card.zip";

			if (exploreSettingsModel.getProperty("/isApplication")) {
				sZipName = "zip";
			}

			this._onDownloadCompressed(sZipName);
		},

		onSubSampleChange: function (oEvent) {
			var item = oEvent.getParameter('selectedItem');

			this.getRouter().navTo(
				"exploreSamples",
				{
					sample: this.oModel.getProperty("/sample").key,
					subSample: item.getKey()
				}
			);
		},

		/**
		 * Initializes the Visual Editor for the manifest (BAS editor)
		 */
		_initVisualEditor: function () {
			var	sBaseUrl = this._oCardSample.getBaseUrl();
			if (!sBaseUrl || sBaseUrl === "") {
				sBaseUrl = this._oFileEditor.getManifestFile().url;
				var sManifestFileName = sBaseUrl.split("/").pop();
				sBaseUrl = "." + sBaseUrl.substring(0, sBaseUrl.length - sManifestFileName.length);
			}
			var sJson;

			this.byId("editPage").setBusy(true);
			this._loadCardEditorBundle()
				.then(function (BASEditor) {
					if (this._oVisualEditor) {
						// already initialized
						this._bCardEditorInitialized = true;
						return;
					}

					this._bCardEditorInitialized = false;
					this._oVisualEditor = new BASEditor({
						visible: "{= ${settings>/editorType} === 'VISUAL' }",
						configurationChange: this.onCardEditorConfigurationChange.bind(this),
						baseUrl: sBaseUrl
					});

					this._oVisualEditor.addStyleClass("sapUiSmallMargin");
					this.byId("editPage").addContent(this._oVisualEditor);
				}.bind(this))
				.then(function () {
					return this._oFileEditor.getManifestContent();
				}.bind(this))
				.then(function (sManifestContent) {
					sJson = sManifestContent;
					if (this._bCardEditorInitialized) {
						this._oVisualEditor._bDesigntimeInit = true;
						return this._oFileEditor.getDesigntimeContent();
					}
					return undefined;
				}.bind(this))
				.then(function (sDesigntimeContent) {
					if (sDesigntimeContent) {
						var oDesigntimeMetadata = this._extractDesigntimeMetadata(sDesigntimeContent);
						this._oVisualEditor.updateDesigntimeMetadata(oDesigntimeMetadata);
					}
					this._oVisualEditor.setJson(sJson);
				}.bind(this))
				.catch(function (oErr) {
					this._oFileEditor.showError(oErr.name + ": " + oErr.message);
				}.bind(this))
				.finally(function () {
					this.byId("editPage").setBusy(false);
				}.bind(this));
		},

		_loadCardEditorBundle: function () {
			if (!this._pLoadCardEditor) {
				this._pLoadCardEditor = loadCardEditor();
			}

			return this._pLoadCardEditor;
		},

		_onCardError: function (oEvent) {
			this._oFileEditor.showError(oEvent.getParameters().message);
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
				sSampleKey = oArgs.sample,
				oSample = this._findSample(sSampleKey),
				sSubSampleKey = oArgs.subSample,
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

			if (oSubSampleOrSample.isApplication) {
				exploreSettingsModel.setProperty("/editorType", Constants.EDITOR_TYPE.TEXT);
			}

			exploreSettingsModel.setProperty("/isApplication", !!oSubSampleOrSample.isApplication);
			this.byId("splitView").setBusy(true);
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

			if (sType === "Navigation") {
				oEvent.preventDefault();
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

		getCurrentSampleKey: function () {
			return this.oModel.getProperty("/currentSampleKey");
		},

		_showSample: function (oSample, oSubSample) {
			var oCurrentSample = oSubSample || oSample,
				oFrameWrapperEl = this.byId("iframeWrapper"),
				bUseIFrame = !!oCurrentSample.useIFrame;

			this.oModel.setProperty("/currentSampleKey", oCurrentSample.key);
			this._oCurrSample = oCurrentSample;

			Promise.all([
				this._initCardSample(),
				this._initMockServers(oCurrentSample)
			]).then(this._cancelIfSampleChanged(function () {
				this._oFileEditor
					.setFiles(oCurrentSample.files || [{
						url: oCurrentSample.manifestUrl,
						name: 'manifest.json',
						key: 'manifest.json',
						content: ''
					}]);

				exploreSettingsModel.setProperty("/useIFrame", bUseIFrame);
				this.oModel.setProperty("/sample", oSample);

				if (oSubSample) {
					this.oModel.setProperty("/subSample", oSubSample);
				}

				if (bUseIFrame) {
					oFrameWrapperEl._sSample = oSubSample ? oSample.key + "/" + oSubSample.key : oSample.key;
					oFrameWrapperEl.invalidate();
				} else {
					var sManifestUrl = this._oFileEditor.getManifestFile().url,
						oLayoutSettings = {
							minRows: 1,
							columns: 4
						};

					oFrameWrapperEl._sSample = '';

					oLayoutSettings = Object.assign(oLayoutSettings, oCurrentSample.settings);

					if (this._oCardSample) {
						this._oCardSample.setLayoutData(new GridContainerItemLayoutData(oLayoutSettings));
						this.byId("cardContainer").invalidate();
					}

					sManifestUrl = sap.ui.require.toUrl("sap/ui/demo/cardExplorer" + sManifestUrl);
					this._sSampleManifestUrl = sManifestUrl;
				}
				this.byId("splitView").setBusy(false);
			}))
			.catch(function (oErr) {
				if (oErr.message !== SAMPLE_CHANGED_ERROR) {
					throw oErr;
				}
			});
		},

		_initMockServers: function (oSample) {
			var pAwait = Promise.resolve(),
				bMockServer = !!oSample.mockServer;

			// init mock server only on demand
			if (bMockServer) {
				pAwait = Promise.all([
					SEPMRA_PROD_MAN_mockServer.init(),
					graphql_mockServer.init()
				]);
			}

			return pAwait;
		},

		_initCardSample: function () {
			if (!this._pInitCardSample) {
				this._pInitCardSample = Core.loadLibrary("sap.ui.integration", { async: true })
					.then(function () {
						return Fragment.load({
							name: "sap.ui.demo.cardExplorer.view.CardSample",
							controller: this
						});
					}.bind(this))
					.then(function (oCard) {
						this.byId("cardContainer").addItem(oCard);

						//This catches any error that was produced by the card
						oCard.attachEvent("_error", this._onCardError, this);

						this._oCardSample = oCard;
					}.bind(this));
			}

			return this._pInitCardSample;
		},

		_initIFrameCreation: function () {
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

		createFrame: function (sSample) {
			var oFrameEl = document.createElement("iframe");
			// index.html will load separate scripts to enable editing the manifest.
			// in the file editor indexTemplate.html will be shown
			oFrameEl.src = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/samples/" + sSample + "/index.html");
			oFrameEl.width = "100%";
			oFrameEl.className = "sapUiTopicsIframe";
			oFrameEl.sandbox = "allow-same-origin allow-forms allow-modals allow-pointer-lock allow-popups allow-scripts";
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
				this._oCardSample.setManifest(null);
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

					this._oCardSample
						.setBaseUrl(sBaseUrl)
						.setManifest(oValue)
						.setParameters(null);
				} catch (oException) {
					this._oCardSample.setManifest(null);
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
						mLibrary.URLHelper.redirect(mParameters.url, true);
						oDialog.destroy();
					}
				}),
				endButton: new Button({
					text: "Cancel",
					press: function () {
						oDialog.destroy();
					}
				})
			}).addStyleClass("sapUiSizeCompact sapUiResponsiveContentPadding");

			oDialog.open();
		},

		/**
		 * Validates the current [sap.card] manifest and shows errors, if any.
		 */
		validateManifest: function () {
			this._oFileEditor.validateManifest();
		},

		/**
		 * Handler for selection of "Schema Validation" checkbox.
		 * @param {sap.ui.base.Event} oEvent The given event.
		 */
		onSchemaValidationCheck: function (oEvent) {
			if (oEvent.getParameter("selected")) {
				this.validateManifest();
			} else {
				this._oFileEditor.hideSchemaErrors();
			}
		},

		/**
		 * @param {string} sFileContent The content of the dt/Configuration.js file
		 * @returns {object} The parsed settings
		 * @throws Will throw an error with message, explaining what has failed during parsing
		 */
		_extractDesigntimeMetadata: function (sFileContent) {
			var oRes = /Designtime\(([\s\S]*?)\)/.exec(sFileContent);

			if (!oRes) {
				throw new Error("Unable to construct 'new Designtime(...)'");
			}

			try {
				return JSON.parse(oRes[1]);
			} catch (e) {
				e.message = "Unable to parse the settings given to Designtime constructor. " + e.message;
				throw e;
			}
		},

		onEditorDialogClose: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.destroy();
		}
	});
});
