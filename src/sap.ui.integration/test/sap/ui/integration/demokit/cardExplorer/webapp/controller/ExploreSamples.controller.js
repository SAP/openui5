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
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/core/Item",
	"sap/ui/core/Lib",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/Device",
	"sap/ui/integration/util/loadCardEditor",
	"sap/base/util/restricted/_debounce",
	"sap/base/util/ObjectPath",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ToolbarSpacer",
	"sap/m/TextArea",
	"sap/m/Label",
	"sap/m/MessageStrip",
	"sap/m/OverflowToolbar",
	"sap/m/Panel",
	"sap/m/Popover",
	"sap/m/Select",
	"sap/m/HBox",
	"sap/ui/core/routing/History"
], function(
	BaseController,
	Constants,
	exploreNavigationModel,
	exploreSettingsModel,
	formatter,
	FileUtils,
	MockServerManager,
	MessageToast,
	GridContainerItemLayoutData,
	Element,
	Fragment,
	Item,
	Library,
	JSONModel,
	BindingMode,
	Device,
	loadCardEditor,
	_debounce,
	ObjectPath,
	Dialog,
	Button,
	ToolbarSpacer,
	TextArea,
	Label,
	MessageStrip,
	OverflowToolbar,
	Panel,
	Popover,
	Select,
	HBox,
	History
) {
	"use strict";

	// Lazy dependencies from sap.ui.integration lib
	var CardEditor, Card;

	var SAMPLE_CHANGED_ERROR = "Sample changed",
	oConfigurationCardMFChangesforAdmin = {},
	oConfigurationCardMFChangesforContent = {},
	selectedFileTabKey = null;

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
			// Simulate library location for the shared extension
			sap.ui.loader.config({
				paths: {
					"sap/ui/demo/cardExplorer/testLib": sap.ui.require.toUrl("sap/ui/demo/cardExplorer/testLib")
				}
			});
			var oRouter = this.getRouter();
			oRouter.getRoute("exploreSamples").attachMatched(this._onRouteMatched, this);

			this.oModel = new JSONModel({});
			this.oModel.setDefaultBindingMode(BindingMode.OneWay);

			this.getView().setModel(this.oModel);
			this.getView().setModel(exploreSettingsModel, "settings");

			this._oFileEditor = this.byId("fileEditor");

			this._registerResize();
			this._initIFrameCreation();

			// Simulate library location for the shared extension
			sap.ui.loader.config({
				paths: {
					"shared/lib": sap.ui.require.toUrl("sap/ui/demo/cardExplorer/samples/extension/shared/lib")
				}
			});
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

			if ((this._sEditSource !== "cardEditor" || bRerender === true) && this._oCardEditor) {
				this._oCardEditor.setJson({});
				this._oCardEditor.setJson(sValue);
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
			if ((this._sEditSource !== "cardEditor" || bRerender === true) && this._oCardEditor) {
				var oDesigntimeMetadata = this._extractDesigntimeMetadata(sValue);
				this._oCardEditor.updateDesigntimeMetadata(oDesigntimeMetadata);
				var oJson = this._oCardEditor.getJson();
				this._oCardEditor.setJson({});
				this._oCardEditor.setJson(oJson);
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
			selectedFileTabKey = this._oFileEditor._getHeader().getSelectedKey();
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

		//User can select card editor mode to reload the related card editor
		onSwitchEditorMode: function (oEvent) {
			var selectedMode = oEvent.getParameter("selectedItem").getKey(),
			sPreviewPosition = exploreSettingsModel.getProperty("/previewPosition");
			var oPanel = Element.getElementById("conf_card_panel");

			var oEditor = this._getCardEditorControl();
			if (oEditor) {
				oEditor.destroy();
			}
			var mTextArea = Element.getElementById("show_manifest_changes_textarea");
			if (mTextArea) {
				mTextArea.destroy();
				exploreSettingsModel.getData().manifestChangesShowed = false;
				exploreSettingsModel.refresh();
			}

			var baseUrl = this._oCardSample.getBaseUrl(),
			sJson;
			this._loadConfigurationEditor().then(this._cancelIfSampleChanged(function () {
				return this._oFileEditor.getCardManifestContent();
			})).then(this._cancelIfSampleChanged(function (oManifestContent) {
				var oManifestSettings = [];
				if (selectedMode === "admin") {
					oManifestSettings.push(oConfigurationCardMFChangesforAdmin);
				} else if (selectedMode === "content") {
					oManifestSettings.push(oConfigurationCardMFChangesforAdmin, oConfigurationCardMFChangesforContent);
				}

				sJson = JSON.parse(oManifestContent);
				var editorPage = this.byId("editPage");
				var oCardEditor = new CardEditor();
				var oCard = new Card({baseUrl: baseUrl, manifest: sJson, manifestChanges: oManifestSettings});
				oCardEditor.setCard(oCard);
				oCardEditor.setMode(selectedMode);
				oCardEditor.setPreviewPosition(sPreviewPosition);
				oCardEditor.setHeight("100%");
				oCardEditor.setHost(this._oHost.getId());
				oCardEditor.attachReady(function() {
					oPanel.addContent(oCardEditor);
					editorPage.addContent(oPanel);
				});
			})).catch(function (oErr) {
				if (oErr.message !== SAMPLE_CHANGED_ERROR) {
					this._oFileEditor.showError(oErr.name + ": " + oErr.message);
				}
			}.bind(this));
		},

		//In the translation mode, configuration card editor will be reloaded if user update the language
		onSwitchLanguage: function (oEvent) {
			var selectedLanguage = oEvent.getParameter("selectedItem").getKey();
			var oPanel = Element.getElementById("conf_card_panel");
			var oEditor = this._getCardEditorControl();
			if (oEditor) {
				oEditor.destroy();
			}

			var baseUrl = this._oCardSample.getBaseUrl(),
			sJson,
			sMode = "translation";
			this._loadConfigurationEditor().then(this._cancelIfSampleChanged(function () {
				return this._oFileEditor.getCardManifestContent();
			})).then(this._cancelIfSampleChanged(function (oManifestContent) {
				sJson = JSON.parse(oManifestContent);
				var editorPage = this.byId("editPage");
				var oCardEditor = new CardEditor();
				var oCard = new Card({baseUrl: baseUrl, manifest: sJson});
				oCardEditor.setCard(oCard);
				oCardEditor.setLanguage(selectedLanguage);
				oCardEditor.setMode(sMode);
				oCardEditor.setHeight("100%");
				oCardEditor.setHost(this._oHost.getId());
				oCardEditor.attachReady(function() {
					oPanel.addContent(oCardEditor);
					editorPage.addContent(oPanel);
				});
			})).catch(function (oErr) {
				if (oErr.message !== SAMPLE_CHANGED_ERROR) {
					this._oFileEditor.showError(oErr.name + ": " + oErr.message);
				}
			}.bind(this));
		},

		onLoadTextEditor: function() {
			exploreSettingsModel.setProperty("/editorType", Constants.EDITOR_TYPE.TEXT);
			exploreSettingsModel.refresh();
			this._sEditSource = "codeEditor";
			this._oFileEditor.getCardManifestContent().then(function (sManifest) {
				var sJson = JSON.parse(sManifest);
				var templatePath = this._sanitizePath(ObjectPath.get(["sap.card", "designtime"], sJson) || "");
				if (templatePath === "sap/ui/integration/designtime/cardEditor/ConfigurationTemplate") {
					delete sJson["sap.card"].designtime;
					this._oFileEditor.setCardManifestContent(JSON.stringify(sJson, '\t', 4));
				} else {
					this._oFileEditor.setCardManifestContent(JSON.stringify(sJson, '\t', 4));
				}
			}.bind(this));
			var oHeader = this._oFileEditor._getHeader();
			if (selectedFileTabKey !== null) {
				oHeader.setSelectedKey(selectedFileTabKey);
			}
		},

		onChangeBASEditor: function (oEvent) {
			var sEditorType = exploreSettingsModel.getProperty("/editorType");
			if (Element.getElementById("conf_card_panel")) {
				Element.getElementById("conf_card_panel").destroy();
			}
			var mTextArea = Element.getElementById("show_manifest_changes_textarea");
			if (mTextArea) {
				mTextArea.destroy();
				exploreSettingsModel.getData().manifestChangesShowed = false;
				exploreSettingsModel.refresh();
			}

			if (sEditorType === Constants.EDITOR_TYPE.TEXT) {
				exploreSettingsModel.setProperty("/editorType", Constants.EDITOR_TYPE.VISUAL);
				exploreSettingsModel.refresh();
				this._sEditSource = "cardEditor";
				this._initVisualEditor();
			} else {
				this.onLoadTextEditor();
			}
		},

		onChangeCardEditor: function(oEvent) {
			var sEditorType = exploreSettingsModel.getProperty("/editorType");
			if (Element.getElementById("conf_card_panel")) {
				Element.getElementById("conf_card_panel").destroy();
			}
			var mTextArea = Element.getElementById("show_manifest_changes_textarea");
			if (mTextArea) {
				mTextArea.destroy();
				exploreSettingsModel.getData().manifestChangesShowed = false;
				exploreSettingsModel.refresh();
			}

			if (sEditorType === Constants.EDITOR_TYPE.TEXT) {
				exploreSettingsModel.setProperty("/editorType", Constants.EDITOR_TYPE.CARDEDITOR);
				exploreSettingsModel.refresh();
				this._sEditSource = "cardEditor";
				this._initCardEditor();
			} else {
				this.onLoadTextEditor();
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
					var tFiles = aFiles;
					for (var j = 0; j < tFiles.length; j++) {
						if (tFiles[j].key === "manifestChanges.json") {
							tFiles.splice(j, 1);
						}
					}
					var sArchiveName = formatter.formatExampleName(JSON.parse(sManifest));

					FileUtils.downloadFilesCompressed(tFiles, sArchiveName, sExtension);
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

			//initial editor display mode to text
			var sEditorType = exploreSettingsModel.getProperty("/editorType");
			if (sEditorType && sEditorType !== Constants.EDITOR_TYPE.TEXT) {
				this.showTextEditor();
			}
		},

		showTextEditor: function() {
			if (Element.getElementById("conf_card_panel")) {
				Element.getElementById("conf_card_panel").destroy();
			}

			exploreSettingsModel.setProperty("/editorType", Constants.EDITOR_TYPE.TEXT);
			exploreSettingsModel.refresh();
			this._sEditSource = "codeEditor";
			this._oFileEditor.getCardManifestContent().then(function (sManifest) {
				var sJson = JSON.parse(sManifest);
				var templatePath = this._sanitizePath(ObjectPath.get(["sap.card", "designtime"], sJson) || "");
				if (templatePath === "sap/ui/integration/designtime/cardEditor/ConfigurationTemplate") {
					delete sJson["sap.card"].designtime;
					this._oFileEditor.setCardManifestContent(JSON.stringify(sJson, '\t', 4));
				} else {
					this._oFileEditor.setCardManifestContent(JSON.stringify(sJson, '\t', 4));
				}
			}.bind(this));
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

		_initCardEditor: function() {
			var that = this,
			baseUrl = this._oCardSample.getBaseUrl(),
			sJson,
			sMode = exploreSettingsModel.getProperty("/editorMode"),
			sPreviewPosition = exploreSettingsModel.getProperty("/previewPosition"),
			cardTitle = "Card Editor with Company Administration Mode";
			if (sMode === "Translation") {
				cardTitle = "Card Editor with Translation Mode";
			} else if (sMode === "AdminContent") {
				cardTitle = "Card Editor with Administration Mode";
			}

			var oPanel = new Panel({
				id: "conf_card_panel",
				expandable: false,
				expanded: true,
				height: "100%",
				headerToolbar: new OverflowToolbar({
					content: [
						new Label({
							text: cardTitle
						}),
						new ToolbarSpacer({
							visible: sPreviewPosition === "separate"
						}),
						new Button({
							text: "Show Preview (Popup)",
							type: "Emphasized",
							visible: sPreviewPosition === "separate",
							press: this._showSeparatePreviewInPopup.bind(this)
						}),
						new Button({
							text: "Show Preview (Dialog)",
							type: "Emphasized",
							visible: sPreviewPosition === "separate",
							press: this._showSeparatePreviewInDialog.bind(this)
						})
					]
				}),
				content: [
					new HBox({
						visible: sMode === "Translation",
						items: [
							new Label({
								text: "Select Translation Language"
							}).addStyleClass("styleCardEditorLanguageLabel"),
							new Select({
								autoAdjustWidth: true,
								change: function(oEvent) {
									that.onSwitchLanguage(oEvent);
								},
								items: [
									new Item({
										key: "en",
										text: "English"
									}),
									new Item({
										key: "fr",
										text: "Français"
									}),
									new Item({
										key: "de",
										text: "Deutsch"
									}),
									new Item({
										key: "zh-CN",
										text: "简体中文"
									})
								]
							}).addStyleClass("styleCardEditorLanguageSelect")
						]
					}),
					new HBox({
						visible: sMode === "AdminContent",
						items: [
							new Label({
								text: "Select Card Editor Mode"
							}).addStyleClass("styleCardEditorLanguageLabel"),
							new Select({
								autoAdjustWidth: true,
								change: function(oEvent) {
									that.onSwitchEditorMode(oEvent);
								},
								items: [
									new Item({
										key: "admin",
										text: "Company Administrator"
									}),
									new Item({
										key: "content",
										text: "Page/Content Administrator"
									})
								]
							}).addStyleClass("styleCardEditorLanguageSelect")
						]
					})
				]
			}).addStyleClass("sapUiBody").addStyleClass("sapUiSizeCompact");

			if (sMode === "AdminContent") {
				sMode = "admin";
			} else if (sMode === "Translation") {
				sMode = "translation";
			}
			this._loadConfigurationEditor().then(this._cancelIfSampleChanged(function () {
				return Promise.all([
					this._oFileEditor.getCardManifestContent(),
					this._oFileEditor.getDesigntimeContent()
				]);
			})).then(this._cancelIfSampleChanged(function (aArgs) {
				var adminChanges,
				contentChanges,
				oManifestSettings = [];
				if (sMode === "admin") {
					adminChanges = oConfigurationCardMFChangesforAdmin || {};
				} else if (sMode === "content") {
					contentChanges = oConfigurationCardMFChangesforContent || {};
				}
				if (sMode === "admin") {
					oManifestSettings.push(adminChanges);
				} else if (sMode === "content") {
					oManifestSettings.push(adminChanges, contentChanges);
				}

				sJson = JSON.parse(aArgs[0]);
				var editorPage = this.byId("editPage");
				var oCardEditor = new CardEditor({
					designtime: this._extractDesigntimeMetadata(aArgs[1])
				});

				var oCard = new Card({baseUrl: baseUrl, manifest: sJson, manifestChanges: oManifestSettings});
				oCardEditor.setCard(oCard);
				oCardEditor.setMode(sMode);
				oCardEditor.setPreviewPosition(sPreviewPosition);
				oCardEditor.setHeight("100%");
				oCardEditor.setHost(this._oHost.getId());
				oPanel.addContent(oCardEditor);
				editorPage.addContent(oPanel);
				oCardEditor.attachReady(function() {
					var isManifestChanged = false;
					if (oManifestSettings.length > 0) {
						if (typeof (oManifestSettings[0]) === "object" && JSON.stringify(oManifestSettings[0]) !== '{}') {
							isManifestChanged = true;
						} else if (typeof (oManifestSettings[0]) === "string" && oManifestSettings[0] !== '{}') {
							isManifestChanged = true;
						}
					}
					if (isManifestChanged) {
						var oMessageStrip = new MessageStrip({
							id: "msgstrip_manifest_change",
							showIcon: true,
							type: "Information",
							text: "Modifications of values in this editor are not saved, neither included in the card bundle zip."
						});
						oPanel.insertContent(oMessageStrip, -1);
					}
				});
			})).catch(function (oErr) {
				if (oErr.message !== SAMPLE_CHANGED_ERROR) {
					this._oFileEditor.showError(oErr.name + ": " + oErr.message);
				}
			}.bind(this));
		},

		_showSeparatePreviewInPopup: function(oEvent) {
			var oButton = oEvent.getSource();
			var oEditor = this._getCardEditorControl();
			var oSeparatePreview = oEditor.getSeparatePreview();
			if (oSeparatePreview) {
				var oSeparatePreviewPopover = new Popover({
					placement: "Left",
					contentWidth: "300px",
					contentHeight: "400px",
					content: oSeparatePreview,
					resizable: true,
					showHeader: false,
					afterClose: function(oEvent) {
						oSeparatePreview.destroy();
					}
				}).addStyleClass("styleSeparatePreviewContainer");
				oSeparatePreviewPopover.openBy(oButton);
			}
		},

		_showSeparatePreviewInDialog: function(oEvent) {
			var oEditor = this._getCardEditorControl();
			var oSeparatePreview = oEditor.getSeparatePreview();
			if (oSeparatePreview) {
				var oSeparatePreviewDialog = new Dialog({
					title: "Card Preview In Dialog",
					contentWidth: "550px",
					contentHeight: "300px",
					resizable: true,
					content: oSeparatePreview,
					endButton: new Button({
						text: "Close",
						press: function () {
							oSeparatePreviewDialog.destroyContent();
							oSeparatePreviewDialog.close();
						}
					})
				});
				oSeparatePreviewDialog.open();
			}
		},

		_getCardEditorControl: function() {
			var oPanel = Element.getElementById("conf_card_panel"),
			oPanelContent = oPanel.getContent(),
			oCardEditor;
			for (var i = 0; i < oPanelContent.length; i++) {
				if (oPanelContent[i].getId().indexOf("__editor") >= 0) {
					oCardEditor = oPanelContent[i];
				}
			}
			return oCardEditor;
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
					sap.ui.require(["sap/ui/integration/designtime/editor/CardEditor"], function (_CardEditor) {
						CardEditor = _CardEditor;
						resolve();
					}, reject);
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

			if (!oSample || oSample.hidden) {
				this._notFound();
				return;
			}

			if (oSample.subSamples && !sSubSampleKey) {
				// select the first sub sample
				sSubSampleKey = oSample.subSamples[0].key;
			}

			oSubSample = this._findSubSample(oSample, sSubSampleKey);
			if (sSubSampleKey && (!oSubSample || oSubSample.hidden)) {
				this._notFound();
				return;
			}

			var oSubSampleOrSample = oSubSample || oSample;

			if (oSubSampleOrSample.isApplication) {
				exploreSettingsModel.setProperty("/editorType", Constants.EDITOR_TYPE.TEXT);
			}

			exploreSettingsModel.setProperty("/isApplication", !!oSubSampleOrSample.isApplication);
			exploreSettingsModel.setProperty("/isPreloadProject", !!oSubSampleOrSample.isPreloadProject);
			this.byId("splitView").setBusy(true);
			this.getOwnerComponent().getEventBus().publish("navEntryChanged", {
				navigationItemKey: oSample.key,
				routeName: "explore"
			});
			this._showSample(oSample, oSubSample);
		},

		_notFound: function () {
			History.getInstance().aHistory.pop(); // do not return back to the sample which was not found
			this.getRouter().navTo("notFound");
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

			// renew the value
			oConfigurationCardMFChangesforAdmin = {};
	        oConfigurationCardMFChangesforContent = {};
			exploreSettingsModel.getData().manifestChanged = false;
			if (this._oCardSample) {
				this._initalChanges = this._initalChanges || [];
				this._oCardSample.setManifestChanges(this._initalChanges);
			}

			// set value for preview position of card editor
			exploreSettingsModel.getData().previewPosition = "right";
			if (oCurrentSample.previewPosition) {
				exploreSettingsModel.getData().previewPosition = oCurrentSample.previewPosition;
				exploreSettingsModel.refresh();
			}

			// this._updateConfigurationEditorMenu(oCurrentSample);
			this.oModel.setProperty("/currentSampleKey", oCurrentSample.key);
			this._oCurrSample = oCurrentSample;

			exploreSettingsModel.getData().manifestChangesShowed = false;
			exploreSettingsModel.getData().editorMode = "admin";
			if (oCurrentSample.editorMode) {
				exploreSettingsModel.getData().editorMode = oCurrentSample.editorMode;
				exploreSettingsModel.refresh();
			}

			Promise.all([
				this._initCardSample(oCurrentSample),
				MockServerManager.initAll(!!oCurrentSample.mockServer),
				this._initCaching(oCurrentSample)
			]).then(this._cancelIfSampleChanged(function () {
				// TODO
				if (oCurrentSample.key === "mockData") {
					this._oCardSample.setPreviewMode("MockData");
				} else {
					this._oCardSample.setPreviewMode("Off");
				}

				//invisble "Show Card Configuration Editor" menu item if there is no designtime.js file
				//load an additional file for manifestchanges
				if (oCurrentSample && oCurrentSample.files) {
					exploreSettingsModel.getData().designtimeEnabled = false;
					for (var j = 0; j < oCurrentSample.files.length; j++) {
						if (oCurrentSample.files[j].key === "manifestChanges.json") {
							oCurrentSample.files.splice(j, 1);
						}
					}
					var i = 0;
					while (i < oCurrentSample.files.length) {
						if (oCurrentSample.files[i].key === "designtime.js") {
							oCurrentSample.files.push({
								key: "manifestChanges.json",
								name: "manifestChanges",
								url: "/samples/manifestChanges.json"
							});
							exploreSettingsModel.getData().designtimeEnabled = true;
							break;
						}
						i++;
					}
				}

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

			//switch to text editor
			var sEditorType = exploreSettingsModel.getProperty("/editorType");
			if (sEditorType && sEditorType !== Constants.EDITOR_TYPE.TEXT) {
				this.showTextEditor();
			}
		},

		_initCardSample: function (oSample) {
			if (!this._pInitCardSample) {
				this._pInitCardSample = Library.load("sap.ui.integration")
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

						Card = oCard.getMetadata().getClass();

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
			exploreSettingsModel.getData().editorMode = "admin";
			if (oCurrentSample.editorMode) {
				exploreSettingsModel.getData().editorMode = oCurrentSample.editorMode;
				exploreSettingsModel.refresh();
			}
			//visible/invisible menu item "Show Manifest Changes" in "Configuration Editor"
			exploreSettingsModel.getData().manifestChanges = "none";
			if (oConfigurationCardMFChangesforAdmin && oConfigurationCardMFChangesforContent) {
				exploreSettingsModel.getData().manifestChanges = "both";
				exploreSettingsModel.refresh();
			} else if (oConfigurationCardMFChangesforAdmin) {
				exploreSettingsModel.getData().manifestChanges = "admin";
				exploreSettingsModel.refresh();
			} else if (oConfigurationCardMFChangesforContent) {
				exploreSettingsModel.getData().manifestChanges = "content";
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
			oFrameEl.classList.add("sapUiCardExplorerSampleFrame");
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

		onApplyCardEditorChanges: function () {
			var oCardEditor = this._getCardEditorControl();
			if (oCardEditor) {
				this._initalChanges = this._initalChanges || this._oCardSample.getManifestChanges() || [];
				var aChanges,
				sMode = oCardEditor.getMode();
				if (sMode === "admin") {
					oConfigurationCardMFChangesforAdmin = oCardEditor.getCurrentSettings();
					aChanges = this._initalChanges.concat([oConfigurationCardMFChangesforAdmin]);
				} else if (sMode === "content") {
					oConfigurationCardMFChangesforContent = oCardEditor.getCurrentSettings();
					aChanges = this._initalChanges.concat([oConfigurationCardMFChangesforAdmin, oConfigurationCardMFChangesforContent]);
				}
				this._oCardSample.setManifestChanges(aChanges);
				this._oFileEditor.setCardManifestChangesContent(JSON.stringify(aChanges, '\t', 4));
			}
			//enable/disable "Show Manifest Changes" button
			exploreSettingsModel.getData().manifestChanged = false;
			if (oConfigurationCardMFChangesforAdmin || oConfigurationCardMFChangesforContent) {
				exploreSettingsModel.getData().manifestChanged = true;
				exploreSettingsModel.refresh();
			}
			//display a message strip
			if (oConfigurationCardMFChangesforAdmin || oConfigurationCardMFChangesforContent) {
				var oMessageStrip = Element.getElementById("msgstrip_manifest_change");
				if (!oMessageStrip) {
					var oPanel = Element.getElementById("conf_card_panel");
					oMessageStrip = new MessageStrip({
						id: "msgstrip_manifest_change",
						showIcon: true,
						type: "Information",
						text: "Modifications of values in this editor are not saved, neither included in the card bundle zip."
					});
					// var oLink = new Link({
					// 	text: "Check it.",
					// 	press: function(oEvent) {
					// 		this.onShowManifestChanges(oEvent);
					// 	}
					// });
					// oMessageStrip.addAggregation(oLink);
					oPanel.insertContent(oMessageStrip, -1);
				}
			}
		},

		onShowManifestChanges: function(oEvent) {
			var manifestChangeShowed = exploreSettingsModel.getData().manifestChangesShowed,
			oPage = Element.getElementById("container-cardExplorer---exploreSamples--editPage"),
			oPanel = Element.getElementById("conf_card_panel");
			if (!manifestChangeShowed) {
				// var oPanel = Core.byId("conf_card_panel"),
				var aChanges,
				oCardEditor = this._getCardEditorControl();
				if (oCardEditor) {
					this._initalChanges = this._initalChanges || this._oCardSample.getManifestChanges() || [];
					var sMode = oCardEditor.getMode();
					if (sMode === "admin") {
						oConfigurationCardMFChangesforAdmin = oCardEditor.getCurrentSettings();
						aChanges = this._initalChanges.concat([oConfigurationCardMFChangesforAdmin]);
					} else if (sMode === "content") {
						oConfigurationCardMFChangesforContent = oCardEditor.getCurrentSettings();
						aChanges = this._initalChanges.concat([oConfigurationCardMFChangesforAdmin, oConfigurationCardMFChangesforContent]);
					}
				}
				var oTextArea = new TextArea({
					id: 'show_manifest_changes_textarea',
					width: '100%',
					height: '30%',
					editable: false
				}).addStyleClass("styleManifestChangesTextArea").addStyleClass("manifestChangesTextArea");
				oTextArea.setValue(JSON.stringify(aChanges, '\t', 4));
				oPanel.setHeight("70%");
				oPage.addContent(oTextArea);

				exploreSettingsModel.getData().manifestChangesShowed = true;
				exploreSettingsModel.refresh();
			} else {
				var mTextArea = Element.getElementById("show_manifest_changes_textarea");
				oPanel.setHeight("100%");
				oPage.removeContent(mTextArea);
				mTextArea.destroy();
				exploreSettingsModel.getData().manifestChangesShowed = false;
				exploreSettingsModel.refresh();
			}
		},

		onResetCardEditor: function () {
			var oPanel = Element.getElementById("conf_card_panel"),
			oMSGStrip = Element.getElementById("msgstrip_manifest_change"),
			oEditor = this._getCardEditorControl(),
			sMode = oEditor.getMode(),
			sPreviewPosition = exploreSettingsModel.getProperty("/previewPosition"),
			oFileEditor = this._oFileEditor;
			oConfigurationCardMFChangesforAdmin = {};
			oPanel.removeContent(oMSGStrip);
			oMSGStrip.destroy();
			oEditor.destroy();
			oFileEditor.getCardManifestChangesContent().then(function (sManifest) {
				oFileEditor.setCardManifestChangesContent();
			});
			exploreSettingsModel.getData().manifestChanged = false;
			exploreSettingsModel.refresh();

			//reset card editor
			var baseUrl = this._oCardSample.getBaseUrl(),
			sJson,
			// sMode = "admin",
			oCardEditor;
			this._loadConfigurationEditor().then(this._cancelIfSampleChanged(function () {
				return this._oFileEditor.getCardManifestContent();
			})).then(this._cancelIfSampleChanged(function (oManifestContent) {
				sJson = JSON.parse(oManifestContent);
				var editorPage = this.byId("editPage");
				oCardEditor = new CardEditor();
				var oCard = new Card({baseUrl: baseUrl, manifest: sJson});
				oCardEditor.setCard(oCard);
				oCardEditor.setMode(sMode);
				oCardEditor.setPreviewPosition(sPreviewPosition);
				oCardEditor.setHeight("100%");
				oCardEditor.setHost(this._oHost.getId());
				oCardEditor.attachReady(function() {
					oPanel.addContent(oCardEditor);
					editorPage.addContent(oPanel);
				});
			})).catch(function (oErr) {
				if (oErr.message !== SAMPLE_CHANGED_ERROR) {
					this._oFileEditor.showError(oErr.name + ": " + oErr.message);
				}
			}.bind(this));

			//destroy manifest changes textArea if exists
			var mTextArea = Element.getElementById("show_manifest_changes_textarea"),
			oPage = Element.getElementById("container-cardExplorer---exploreSamples--editPage");
			if (mTextArea) {
				oPanel.setHeight("100%");
				oPage.removeContent(mTextArea);
				mTextArea.destroy();
				exploreSettingsModel.getData().manifestChangesShowed = false;
				exploreSettingsModel.refresh();
			}
			//reset runtime card
			this._initalChanges = this._initalChanges || this._oCardSample.getManifestChanges() || [];
			this._oCardSample.setManifestChanges(this._initalChanges);
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
