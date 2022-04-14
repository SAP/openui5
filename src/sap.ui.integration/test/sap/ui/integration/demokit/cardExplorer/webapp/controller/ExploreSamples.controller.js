sap.ui.define([
	"./BaseController",
	"../Constants",
	"../model/ExploreNavigationModel",
	"../model/ExploreSettingsModel",
	"../model/formatter",
	"../util/FileUtils",
	"../localService/MockServerManager",
	"sap/m/MessageToast",
	"sap/f/GridContainerItemLayoutData",
	"sap/ui/core/Core",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/Device",
	"sap/ui/integration/util/loadCardEditor",
	"sap/base/util/restricted/_debounce",
	"sap/base/util/ObjectPath"
], function (
	BaseController,
	Constants,
	exploreNavigationModel,
	exploreSettingsModel,
	formatter,
	FileUtils,
	MockServerManager,
	MessageToast,
	GridContainerItemLayoutData,
	Core,
	Fragment,
	JSONModel,
	BindingMode,
	Device,
	loadCardEditor,
	_debounce,
	ObjectPath
) {
	"use strict";

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
			this._unregisterCachingServiceWorker();
			MockServerManager.destroyAll();
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
				this._oFileEditor.setCardManifestContent(sManifest);
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
			this._oFileEditor.getCardManifestContent().then(function (sManifest) {
				this._updateSample(sManifest, true);
			}.bind(this));
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
			var sPreviewPosition = oEvent.getSource().data("previewPosition");
			var sEditorTitle = {
				admin: "Administrator",
				content: "Page/Content Administrator",
				translation: "Translator"
			}[sMode];

			this._loadConfigurationEditor()
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
						previewPosition: sPreviewPosition,
						designtime: this._extractDesigntimeMetadata(aArgs[1]),
						language: Core.getConfiguration().getLanguage()
					}), "config");

					oDialog.setContentWidth("750px");

					oDialog.open();
				}))
				.catch(function (oErr) {
					if (oErr.message !== SAMPLE_CHANGED_ERROR) {
						this._oFileEditor.showError(oErr.name + ": " + oErr.message);
					}
				}.bind(this));
		},

		//In the translation mode, configuration card editor will be reloaded if user update the language
		onSwitchLanguage: function (oEvent) {
			var selectedLanguage = oEvent.getParameter("selectedItem").getKey();
			var oDialog = oEvent.getSource().getParent();
			var dialogModel = oDialog.getModel("config");
			dialogModel.setProperty("/language", selectedLanguage);
			var oContent = oDialog.getContent(),
				oEditor;

			for (var i = 0; i < oContent.length; i++) {
				if (oContent[i].isA("sap.ui.integration.designtime.editor.CardEditor")) {
					oEditor = oContent[i];
				}
			}

			if (oEditor) {
				oEditor.destroy();
			}

			this._loadConfigurationEditor()
				.then(function (CardEditor) {
					var newEditor = new CardEditor({
						id: "configurationCard11",
						card: dialogModel.getProperty("/cardId"),
						mode: dialogModel.getProperty("/mode"),
						designtime: dialogModel.getProperty("/designtime"),
						allowSettings: true,
						allowDynamicValues: true,
						language: dialogModel.getProperty("/language")
					});
					oDialog.addContent(newEditor);
				});
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
				this._oFileEditor.getCardManifestContent().then(function (sManifest) {
					var sJson = JSON.parse(sManifest);
					var templatePath = this._sanitizePath(ObjectPath.get(["sap.card", "designtime"], sJson) || "");
					if (templatePath === "sap/ui/integration/designtime/cardEditor/ConfigurationTemplate") {
						delete sJson["sap.card"].designtime;
						this._oFileEditor.setCardManifestContent(JSON.stringify(sJson, '\t', 4));
					}
				}.bind(this));
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
		 onDownloadCardManifestFile: function () {
			this._oFileEditor.getCardManifestContent().then(function (sJSON) {
				FileUtils.downloadFile(sJSON, "manifest", "json", "application/json");
			});
		},

		/**
		 * Downloads all files that the example consists of.
		 * @param {string} sManifest The card's or application's manifest.
		 * @param {string} sExtension The archive extension.
		 */
		_onDownloadCompressed: function (sManifest, sExtension) {
			this._oFileEditor.getFilesWithContent()
				.then(function (aFiles) {
					var sArchiveName = formatter.formatExampleName(JSON.parse(sManifest));

					FileUtils.downloadFilesCompressed(aFiles, sArchiveName, sExtension);
				});
		},

		onDownloadZip: function () {
			var sArchiveExtension = Constants.CARD_BUNDLE_EXTENSION,
				pGetManifestContent;

			if (exploreSettingsModel.getProperty("/isApplication")) {
				sArchiveExtension = "zip";
				pGetManifestContent = this._oFileEditor.getApplicationManifestContent();
			} else {
				pGetManifestContent = this._oFileEditor.getCardManifestContent();
			}

			pGetManifestContent.then(function (sManifest) {
				this._onDownloadCompressed(sManifest, sArchiveExtension);
			}.bind(this));
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
				sBaseUrl = this._oFileEditor.getCardManifestFile().url;
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
					return this._oFileEditor.getCardManifestContent();
				}.bind(this))
				.then(function (sManifestContent) {
					sJson = JSON.parse(sManifestContent);
					//handle designtime keyword removal
					var sDesigntimePath = this._sanitizePath(ObjectPath.get(["sap.card", "configuration", "editor"], sJson) || "");
					if (sDesigntimePath === "") {
						sDesigntimePath = this._sanitizePath(ObjectPath.get(["sap.card", "designtime"], sJson) || "");
					}
					if (!sDesigntimePath) {
						ObjectPath.set(["sap.card", "designtime"], "sap/ui/integration/designtime/cardEditor/ConfigurationTemplate", sJson);
					}
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

		_loadConfigurationEditor: function () {
			if (!this._pLoadConfigurationEditor) {
				this._pLoadConfigurationEditor = new Promise(function (resolve, reject) {
					sap.ui.require(["sap/ui/integration/designtime/editor/CardEditor"], resolve, reject);
				});
			}

			return this._pLoadConfigurationEditor;
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
			this.getOwnerComponent().getEventBus().publish("navEntryChanged", {
				navigationItemKey: oSample.key,
				routeName: "explore"
			});
			this._showSample(oSample, oSubSample);
		},

		_onCardAction: function (oEvent) {
			var sType = oEvent.getParameter("type"),
				mParameters = oEvent.getParameter("parameters"),
				sMessage;

			if (this._oCurrSample.interceptActions === false) {
				return;
			}

			sMessage = "Action '" + sType + "'";

			if (mParameters) {
				sMessage += " with parameters: \n'" + JSON.stringify(mParameters) + "'";
			}

			MessageToast.show(sMessage, {
				at: "center center",
				width: "25rem"
			});

			if (sType === "Navigation") {
				oEvent.preventDefault();
			}
		},

		_findSample: function (sSampleKey) {
			var aSections = exploreNavigationModel.getProperty("/navigation"),
				oFoundSample;

			// loops through all samples in the navigation and gets the current one
			aSections.some(function (oSection) {
				if (oSection.key === sSampleKey) {
					oFoundSample = oSection;
					return true;
				}

				if (oSection.items) {
					oSection.items.some(function (oSample) {
						if (oSample.key === sSampleKey) {
							oFoundSample = oSample;
							return true;
						}
						return false;
					});
				}

				return false;
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

		onhandleClosePopover: function(oEvent) {
			if (this.byId("configurationEditorPopover").isOpen()) {
				this.byId("configurationEditorPopover").close();
			}
			this.byId("openConfigurationEditorButton").setType("Transparent");
		},

		_showSample: function (oSample, oSubSample) {
			var oCurrentSample = oSubSample || oSample,
				oFrameWrapperEl = this.byId("iframeWrapper"),
				bUseIFrame = !!oCurrentSample.useIFrame;

			this._updateConfigurationEditorMenu(oCurrentSample);
			this.oModel.setProperty("/currentSampleKey", oCurrentSample.key);
			this._oCurrSample = oCurrentSample;

			Promise.all([
				this._initCardSample(oCurrentSample),
				MockServerManager.initAll(!!oCurrentSample.mockServer),
				this._initCaching(oCurrentSample)
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
					var sManifestUrl = this._oFileEditor.getCardManifestFile().url,
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

		_initCardSample: function (oSample) {
			if (!this._pInitCardSample) {
				this._pInitCardSample = Core.loadLibrary("sap.ui.integration", { async: true })
					.then(function () {
						return Promise.all([
							Fragment.load({
								name: "sap.ui.demo.cardExplorer.view.CardSample",
								controller: this
							}),
							new Promise(function (res, rej) {
								sap.ui.require(["sap/ui/demo/cardExplorer/util/CardGenericHost"], res, rej);
							})
						]);
					}.bind(this))
					.then(function (aArgs) {
						var oCard = aArgs[0],
							oHost = aArgs[1];

						if (oSample.cache) {
							oHost.useExperimentalCaching();
						} else {
							oHost.stopUsingExperimentalCaching();
						}

						this.byId("cardContainer").addItem(oCard);

						//This catches any error that was produced by the card
						oCard.attachEvent("_error", this._onCardError, this);
						oCard.setHost(oHost);
						this._oCardSample = oCard;
						this._oHost = oHost;
					}.bind(this));
			}

			return this._pInitCardSample;
		},

		_initCaching: function (oSample) {
			return this._pInitCardSample.then(function () {
				if (oSample.cache) {
					this._oHost.useExperimentalCaching();
					this._oCardSample.setHost(this._oHost);
					return this._registerCachingServiceWorker();
				} else {
					this._oHost.stopUsingExperimentalCaching();
					this._oCardSample.setHost(this._oHost);
					this._unregisterCachingServiceWorker();
					return Promise.resolve();
				}
			}.bind(this));
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

		_updateConfigurationEditorMenu: function (oCurrentSample) {
			//disable "Configuration Editor" if there is no designtime.js file
			if (oCurrentSample && oCurrentSample.files) {
				exploreSettingsModel.getData().designtimeEnabled = false;
				var i = 0;
				while (i < oCurrentSample.files.length) {
					if (oCurrentSample.files[i].key === "designtime.js") {
						exploreSettingsModel.getData().designtimeEnabled = true;
						break;
					}
					i++;
				}
			}
			//open a popover to highlight Configuration Editor button
			if (exploreSettingsModel.getData().designtimeEnabled) {
				var configEditorMenuBtn = this.byId("openConfigurationEditorButton");
				var oView = this.getView();
				if (!this._pPopover) {
					this._pPopover = Fragment.load({
						id: oView.getId(),
						name: "sap.ui.demo.cardExplorer.view.Popover",
						controller: this
					}).then(function(oPopover) {
						oView.addDependent(oPopover);
						return oPopover;
					});

					configEditorMenuBtn.setType("Ghost");
					this._pPopover.then(function(oPopover) {
						setTimeout(function() {
							oPopover.openBy(configEditorMenuBtn);
						}, 150);
					});
				}
			}
			//enable/disable menu items of "Configuration Editor" according to card mode, enable all menu items by default
			exploreSettingsModel.getData().configMode = "All";
			if (oCurrentSample.configMode) {
				exploreSettingsModel.getData().configMode = oCurrentSample.configMode;
				exploreSettingsModel.refresh();
			}
			exploreSettingsModel.getData().previewPosition = "right";
			if (oCurrentSample.previewPosition) {
				exploreSettingsModel.getData().previewPosition = oCurrentSample.previewPosition;
				exploreSettingsModel.refresh();
			}
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
		 * @param {boolean} bRefresh Force card refresh.
		 */
		_updateSample: function (sValue, bRefresh) {
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

					if (bRefresh) {
						this._oCardSample.refresh();
					}
				} catch (oException) {
					this._oCardSample.setManifest(null);
				}
			}
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
			var oRes = /Designtime\(([\s\S]*?)\)\;/.exec(sFileContent);

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

		_sanitizePath: function (sPath) {
			return sPath.trim().replace(/\/*$/, "");
		},

		onEditorDialogClose: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.destroy();
		},

		_registerCachingServiceWorker: function () {
			if (this._oCachingSWRegistration) {
				return;
			}

			return navigator.serviceWorker.register("./cachingServiceWorker.js")
				.then(function (oRegistration) {
					this._oCachingSWRegistration = oRegistration;
				}.bind(this));
		},

		_unregisterCachingServiceWorker: function () {
			if (this._oCachingSWRegistration) {
				this._oCachingSWRegistration.unregister();
				this._oCachingSWRegistration = null;
			}
		}
	});
});
