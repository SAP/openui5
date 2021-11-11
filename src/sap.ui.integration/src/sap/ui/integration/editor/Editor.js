/*!
 * ${copyright}
 */

sap.ui.define([
	"ui5loader",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/Manifest",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/base/util/merge",
	"sap/ui/base/Interface",
	"sap/ui/integration/Designtime",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/Utils",
	"sap/ui/integration/util/Destinations",
	"sap/ui/integration/util/DataProviderFactory",
	"sap/m/Label",
	"sap/m/Title",
	"sap/m/Panel",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/Icon",
	"sap/m/ResponsivePopover",
	"sap/m/Popover",
	"sap/m/Text",
	"sap/base/Log",
	"sap/ui/core/Popup",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/thirdparty/URI",
	"sap/ui/dom/includeStylesheet",
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/theming/Parameters",
	"sap/base/util/ObjectPath",
	"sap/m/FormattedText",
	"sap/m/MessageStrip",
	"sap/m/ToolbarSpacer",
	"sap/base/util/includes",
	"sap/ui/model/resource/ResourceModel",
	"./Manifest",
	"./Merger",
	"./Settings",
	"sap/m/FlexItemData",
	"sap/m/FlexBox",
	"sap/m/Button"
], function (
	ui5loader,
	Control,
	Core,
	Manifest,
	deepClone,
	deepEqual,
	merge,
	Interface,
	Designtime,
	JSONModel,
	Utils,
	Destinations,
	DataProviderFactory,
	Label,
	Title,
	Panel,
	HBox,
	VBox,
	Icon,
	RPopover,
	Popover,
	Text,
	Log,
	Popup,
	ResourceBundle,
	URI,
	includeStylesheet,
	LoaderExtensions,
	Parameters,
	ObjectPath,
	FormattedText,
	MessageStrip,
	Separator,
	includes,
	ResourceModel,
	EditorManifest,
	Merger,
	Settings,
	FlexItemData,
	FlexBox,
	Button
) {
	"use strict";

	//workaround issue of orientation change fired that reapplies position and closes the popup
	//issue is not predictable and depends on host environment. Solution - apply all, simply do not close for position changes.
	var popoverInit = Popover.prototype.init;
	Popover.prototype.init = function () {
		popoverInit.apply(this, arguments);
		var fn = this.oPopup._applyPosition,
			that = this;
		this.oPopup._applyPosition = function () {
			var fnClose = that.close;
			that.close = function () { };
			fn.apply(this, arguments);
			that.close = fnClose;
		};
	};

	function getHigherZIndex(source) {
		if (source && source.nodeType !== 1) {
			return 0;
		}
		var z = parseInt(window.getComputedStyle(source).getPropertyValue('z-index'));
		if (isNaN(z)) {
			return getHigherZIndex(source.parentNode);
		}
		return z + 1;
	}
	var REGEXP_TRANSLATABLE = /\{\{(?!parameters.)(?!destinations.)([^\}\}]+)\}\}/g,
		REGEXP_PARAMETERS = /\{\{parameters\.([^\}\}]+)/g,
		CONTEXT_TIMEOUT = 5000,
		oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration"),
		MessageStripId = "__strip0";

	/**
	 * Constructor for a new <code>Editor</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control allows to edit manifest settings from a designtime module.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.94
	 * @private
	 * @experimental since 1.94.0
	 * @alias sap.ui.integration.editor.Editor
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Editor = Control.extend("sap.ui.integration.editor.Editor", /** @lends sap.ui.integration.editor.Editor.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * admin, content, translation
				 * Used to control the editors capabilities
				 */
				mode: {
					type: "string",
					defaultValue: "admin"
				},
				language: {
					type: "string",
					defaultValue: ""
				},
				allowDynamicValues: {
					type: "boolean",
					defaultValue: false
				},
				allowSettings: {
					type: "boolean",
					defaultValue: false
				},
				designtime: {
					type: "object"
				},
				section: {
					type: "string",
					defaultValue: "sap.card"
				},
				host: {
					type: "string",
					defaultValue: ""
				},
				baseUrl: {
					type: "sap.ui.core.URI",
					defaultValue: null
				},
				json: {
					type: "object"
				},
				previewPosition:{
					type: "string",
					defaultValue: "right" // value can be "top", "bottom", "left", "right"
				}
			},
			aggregations: {
				/**
				 * Defines the header of the Editor.
				 */
				_formContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					visibility: "hidden"
				},
				_preview: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				_messageStrip: {
					type: "sap.m.MessageStrip",
					multiple: false,
					visibility: "hidden"
				},
				_extension: {
					type: "sap.ui.integration.editor.Extension",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				ready: {},
				manifestReady: {}
			}
		},
		renderer: function (oRm, oControl) {
			var oPreview = oControl.getAggregation("_preview");
			var bShowPreview = oControl.getMode() !== "translation" && oControl.hasPreview();
			var sPreviewPosition = oControl.getPreviewPosition();
			if (bShowPreview
				&& (sPreviewPosition === "top" || sPreviewPosition === "bottom")) {
				oRm.openStart("div");
				oRm.writeElementData(oControl);
				oRm.openEnd();
				//render the additional content if alignment of it is "top"
				if (oControl.isReady() && sPreviewPosition === "top") {
					oRm.renderControl(oPreview);
					oRm.close("div");
				}
			}
			oRm.openStart("div");
			oRm.addClass("sapUiIntegrationEditor");
			if (bShowPreview && sPreviewPosition === "left") {
				oRm.writeElementData(oControl);
				oRm.openEnd();
				if (oControl.isReady()){
					oRm.renderControl(oPreview);
					oRm.close("div");
				}
			} else if (bShowPreview
				&& (sPreviewPosition === "bottom" || sPreviewPosition === "top")) {
				oRm.openEnd();
			} else {
				oRm.writeElementData(oControl);
				oRm.openEnd();
			}
			if (oControl.isReady()) {
				//surrounding div tag for form <div class="sapUiIntegrationEditorForm"
				oRm.openStart("div");
				oRm.addClass("sapUiIntegrationEditorForm");
				if (oControl.getMode() !== "translation") {
					oRm.addClass("settingsButtonSpace");
				}

				oRm.writeClasses();
				oRm.openEnd();
				if (oControl.getMode() !== "translation") {
					oRm.renderControl(oControl.getAggregation("_messageStrip"));
				}
				var aItems = oControl.getAggregation("_formContent");
				//render items
				if (aItems) {
					var oPanel;
					var oLanguagePanel;
					var oLabelItemForNotWrapping;
					var oColFields = [];
					var oOriginalField;
					var addColFields = function () {
						if (oColFields.length > 0) {
							var iLess = 2 - oColFields.length;
							for (var n = 0; n < iLess; n++) {
								oColFields.push(new VBox());
							}
							oPanel.addContent(new FlexBox({
								alignItems: "Start",
								justifyContent: "SpaceBetween",
								items: oColFields
							}));
							oColFields = [];
						}
					};
					for (var i = 0; i < aItems.length; i++) {
						var oItem = aItems[i];
						if (oControl.getMode() !== "translation") {
							if (oItem.isA("sap.m.Panel")) {
								if (oPanel) {
									//add current col fields to previous panel, then empty the col fields list
									addColFields();
									//render previous panel
									if (oPanel.getContent().length > 0) {
										oRm.renderControl(oPanel);
									}
								}
								oPanel = oItem;
								oPanel.addStyleClass("sapUiIntegrationEditorItem");
								if (i === aItems.length - 1) {
									//add current col fields to panel, then empty the col fields list
									addColFields();
									if (oPanel.getContent().length > 0) {
										oRm.renderControl(oPanel);
									}
								}
								continue;
							}
							// add style class for the hint under group and checkbox/toggle
							if (oItem.isA("sap.m.FormattedText")) {
								oPanel.addContent(oItem.addStyleClass("sapUiIntegrationEditorHint"));
								if (i === aItems.length - 1) {
									//add current col fields to panel, then empty the col fields list
									addColFields();
									if (oPanel.getContent().length > 0) {
										oRm.renderControl(oPanel);
									}
								}
								continue;
							}

							var oLayout = oItem._layout;
							if (oItem.isA("sap.m.Label")) {
								oItem.addStyleClass("sapUiIntegrationEditorItemLabel");
								if (oLayout && !deepEqual(oLayout, {})) {
									if (oLayout.alignment && oLayout.alignment.label === "end") {
										oItem.setTextAlign("End");
									}
									oLabelItemForNotWrapping = oItem;
								} else {
									//if cols === 1 and reach the col size, add the col fields to panel, then empty the col fields list
									//if cols === 2, add the col fields to panel, then empty the col fields list
									if (oItem._cols === 2 || (oItem._cols === 1 && oColFields.length === 2)) {
										addColFields();
									}
									oPanel.addContent(oItem);
								}
							} else if (oItem.isA("sap.m.ToolbarSpacer")) {
								addColFields();
								if (oItem._hasLine) {
									oItem.addStyleClass("sapUiIntegrationEditorSpacerWithLine");
								} else {
									oItem.addStyleClass("sapUiIntegrationEditorSpacerWithoutLine");
								}
								oPanel.addContent(oItem);
							} else {
								var oConfig = oItem.getConfiguration(),
									aInfoHBox = new HBox(),
									iInfoHBoxWidth = 0.1,
									iSettingsHBoxWidth = 0,
									oLabelHBox;
								if (oItem._descriptionIcon) {
									aInfoHBox.addItem(oItem._descriptionIcon);
									iInfoHBoxWidth += 0.9;
								}
								var oMessageIcon = Core.byId(oItem.getAssociation("_messageIcon"));
								if (oItem.getAssociation("_messageIcon") && oMessageIcon) {
									aInfoHBox.addItem(oMessageIcon);
									iInfoHBoxWidth += 1.2;
								}
								if (oItem._settingsButton) {
									oItem._settingsButton.addStyleClass("sapUiIntegrationEditorSettingsButton");
									iSettingsHBoxWidth = 2;
								}
								var oFlexItemDataForSettings = new FlexItemData({
									growFactor: 10,
									maxWidth: "calc(100% - " + iSettingsHBoxWidth + "rem)"
								});
								var oFlexItemDataForInfo = new FlexItemData({
									maxWidth: "calc(100% - " + iInfoHBoxWidth + "rem)"
								});
								if (oLabelItemForNotWrapping) {
									var oHBox,
										oFlexBox,
										sLabelWidth = "50%";
									if (oLayout && oLayout["label-width"]) {
										sLabelWidth = oLayout["label-width"];
									}
									var iLabelWidth = parseInt(sLabelWidth);
									var iFieldWidth = 100 - iLabelWidth;
									if (oItem._cols === 2) {
										iLabelWidth = iLabelWidth - 0.5;
										iFieldWidth = iFieldWidth - 0.5;
									}

									if (oLayout.alignment && oLayout.alignment.field === "end") {
										oItem.addStyleClass("sapUiIntegrationEditorFieldAlignEnd");
									}
									if (oLayout.alignment && oLayout.alignment.label === "end") {
										oLabelItemForNotWrapping.setLayoutData(new FlexItemData({
											maxWidth: "calc(100% - " + iInfoHBoxWidth + "rem)",
											minWidth: "calc(100% - " + iInfoHBoxWidth + "rem)"
										}));
									} else {
										oLabelItemForNotWrapping.setLayoutData(oFlexItemDataForInfo);
									}
									if (aInfoHBox.getItems().length > 0) {
										oLabelItemForNotWrapping.addStyleClass("sapUiIntegrationEditorItemLabelWithInfo");
										oLabelHBox = new HBox({
											items: [
												oLabelItemForNotWrapping,
												aInfoHBox
											]
										});
									} else {
										oLabelHBox = oLabelItemForNotWrapping;
									}
									if (oLayout && oLayout.position && oLayout.position === "field-label") {
										oLabelHBox.setLayoutData(oFlexItemDataForSettings);
										oFlexBox = new HBox({
											alignItems: "Start",
											justifyContent: "SpaceBetween",
											items: [
												oLabelHBox,
												oItem._settingsButton
											]
										});
										oFlexBox.setLayoutData(new FlexItemData({
											growFactor: iLabelWidth,
											maxWidth: iLabelWidth + "%"
										}));
										oItem.setLayoutData(new FlexItemData({
											growFactor: iFieldWidth,
											maxWidth: iFieldWidth + "%"
										}));
										oHBox = new HBox({
											alignItems: "Start",
											justifyContent: "SpaceBetween",
											items: [
												oItem,
												oFlexBox
											]
										});
									} else {
										oItem.setLayoutData(oFlexItemDataForSettings);
										oFlexBox = new HBox({
											alignItems: "Start",
											justifyContent: "SpaceBetween",
											items: [
												oItem,
												oItem._settingsButton
											]
										});
										oLabelHBox.setLayoutData(new FlexItemData({
											growFactor: iLabelWidth,
											maxWidth: iLabelWidth + "%"
										}));
										oFlexBox.setLayoutData(new FlexItemData({
											growFactor: iFieldWidth,
											maxWidth: iFieldWidth + "%"
										}));
										oHBox = new HBox({
											alignItems: "Start",
											justifyContent: "SpaceBetween",
											items: [
												oLabelHBox,
												oFlexBox
											]
										});
									}
									//render lable and field for NotWrapping parameter
									if (oItem._cols === 1) {
										if (oColFields.length === 2) {
											addColFields();
										}
										if (oConfig.hint) {
											var oHint = oControl._createHint(oConfig.hint);
											var oColVBox = new VBox({
												items: [
													oHBox,
													oHint.addStyleClass("sapUiIntegrationEditorHint")
												]
											});
											oColVBox.addStyleClass("col1");
											oColFields.push(oColVBox);
										} else {
											oHBox.addStyleClass("col1");
											oColFields.push(oHBox);
										}
									} else {
										addColFields();
										oPanel.addContent(oHBox);
									}
									oLabelItemForNotWrapping = null;
								} else {
									var oLabel = oPanel.getContent().pop();
									oLabel.setLayoutData(oFlexItemDataForInfo);
									if (aInfoHBox.getItems().length > 0) {
										oLabel.addStyleClass("sapUiIntegrationEditorItemLabelWithInfo");
										oLabelHBox = new HBox({
											items: [
												oLabel,
												aInfoHBox
											]
										});
									} else {
										oLabelHBox = oLabel;
									}
									oLabelHBox.setLayoutData(oFlexItemDataForSettings);
									var oLabelFlexBox = new FlexBox({
										alignItems: "Start",
										justifyContent: "SpaceBetween",
										items: [
											oLabelHBox,
											oItem._settingsButton
										]
									});
									if (oItem._cols === 1) {
										var oColVBox = new VBox({
											items: [
												oLabelFlexBox,
												oItem
											]
										});
										if (oConfig.hint) {
											var oHint = oControl._createHint(oConfig.hint);
											oColVBox.addItem(oHint.addStyleClass("sapUiIntegrationEditorHint"));
										}
										oColVBox.addStyleClass("col1");
										oColFields.push(oColVBox);
									} else {
										oPanel.addContent(oLabelFlexBox);
										oPanel.addContent(oItem);
									}
								}
							}
							if (i === aItems.length - 1) {
								//add current col fields to panel, then empty the col fields list
								addColFields();
								if (oPanel.getContent().length > 0) {
									oRm.renderControl(oPanel);
								}
							}
						} else {
							if (i === 0) {
								//render the top panel of translation
								oLanguagePanel = oItem;
								oRm.renderControl(oLanguagePanel);
								oLanguagePanel.addStyleClass("sapUiIntegrationEditorTranslationPanel");
								continue;
							}
							if (oItem.isA("sap.m.Panel")) {
								//add sub panel if it has content into top panel
								if (oPanel && oPanel.getContent().length > 0) {
									oLanguagePanel.addContent(oPanel);
								}
								oPanel = oItem;
								oPanel.addStyleClass("sapUiIntegrationEditorTranslationSubPanel");
								continue;
							}
							if (oItem.isA("sap.m.ToolbarSpacer")) {
								continue;
							}
							if (oItem.isA("sap.m.FormattedText")) {
								continue;
							}
							if (oItem.isA("sap.m.Label")) {
								oPanel.addContent(oItem);
								continue;
							}
							//oItem.addStyleClass("language");
							if (oItem.isOrigLangField) {
								oOriginalField = oItem;
								continue;
							}
							oOriginalField.addStyleClass("sapUiIntegrationFieldTranslationText");
							//bind originalField and translation field together
							var oHBox = new HBox({
								items: [
									oOriginalField,
									oItem
								]
							}).addStyleClass("notWrappingRow");
							oPanel.addContent(oHBox);
							if (i === aItems.length - 1) {
								oLanguagePanel.addContent(oPanel);
							}
						}
					}
				}
				oRm.close("div");
				//render the additional content if alignment of it is "right"
				if (bShowPreview && sPreviewPosition === "right") {
					oRm.renderControl(oPreview);
				}
			}
			oRm.close("div");
			//render the additional content if alignment of it is "right"
			if (oControl.isReady() && bShowPreview && sPreviewPosition === "bottom") {
				oRm.renderControl(oPreview);
				oRm.close("div");
			}
		}
	});
	/**
		 * Init of the editor
		 */
	Editor.prototype.init = function () {
		this._ready = false;
		this._aFieldReadyPromise = [];
		this._oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");
		this._appliedLayerManifestChanges = [];
		this._currentLayerManifestChanges = {};
		this._mDestinationDataProviders = {};
		this.setAggregation("_messageStrip", new MessageStrip({
			showIcon: false
		}));
		/**
		 * Facade of the {@link sap.ui.integration.editor.Editor} control.
		 * @interface
		 * @name sap.ui.integration.editor.EditorFacade
		 * @experimental since 1.94
		 * @public
		 * @author SAP SE
		 * @version ${version}
		 * @borrows sap.ui.integration.editor.Editor#getParameters as getParameters
		 * @borrows sap.ui.integration.editor.Editor#resolveDestination as resolveDestination
		 * @borrows sap.ui.integration.editor.Editor#request as request
		 * @borrows sap.ui.integration.editor.Editor#getModel as getModel
		 */
		 this._oLimitedInterface = new Interface(this, [
			"getParameters",
			"resolveDestination",
			"request",
			"getModel"
		]);
	};

	Editor.prototype.getParameters = function () {
		if (!this._isManifestReady) {
			Log.error("The manifest is not ready. Consider using the 'manifestReady' event.", "sap.ui.integration.editor.Editor");
			return null;
		}

		var oParams = this._oEditorManifest.getProcessedParameters(),
			oResultParams = {},
			sKey;

		for (sKey in oParams) {
			oResultParams[sKey] = oParams[sKey].value;
		}

		return oResultParams;
	};

	Editor.prototype.resolveDestination = function (sKey) {
		return this._oDestinations.getUrl(sKey);
	};

	/**
	 * Returns whether the editor is ready to be used
	 */
	Editor.prototype.isReady = function () {
		return this._ready;
	};

	Editor.prototype.hasPreview = function() {
		var oPreview = this.getAggregation("_preview");
		if (oPreview && oPreview.visible !== false) {
			return true;
		}
		return false;
	};

	Editor.prototype.flattenData = function(oData, s, a, path) {
		path = path || "";
		a = a || [];
		if (typeof oData === "object") {
			if (!oData[s]) {
				for (var n in oData) {
					this.flattenData(oData[n], s, a, path + "/" + n);
				}
			} else {
				//found leave
				if (oData.type) {
					a.push({
						path: oData.pathvalue || path.substring(1),
						value: oData.pathvalue || "{context>" + path.substring(1) + "/value}",
						object: oData
					});
				} else {
					a.push({
						path: path.substring(1),
						object: oData
					});
					for (var n in oData) {
						this.flattenData(oData[n], s, a, path + "/" + n);
					}
				}
			}
		}
		return a;
	};

	Editor.prototype.setJson = function (vIdOrSettings, bSuppress) {
		this._ready = false;
		if (deepEqual(vIdOrSettings, this._preIdOrSettings)) {
			return this;
		}
		this._preIdOrSettings = deepClone(vIdOrSettings, 500);
		if (typeof vIdOrSettings === "string") {
			try {
				vIdOrSettings = JSON.parse(vIdOrSettings);
			} catch (ex) {
				//not json
			}
		}
		if (typeof vIdOrSettings === "object") {
			if (vIdOrSettings.manifestChanges) {
				//remove the changes from the current layer
				this._filterManifestChangesByLayer(vIdOrSettings);
			}
			if (this._manifestModel) {
				//already created
				return;
			}
			if (this._oDesigntimeInstance) {
				this._oDesigntimeInstance.destroy();
			}
			if (vIdOrSettings.host) {
				this.setProperty("host", vIdOrSettings.host);
			}
			if (vIdOrSettings.baseUrl) {
				this.setProperty("baseUrl", vIdOrSettings.baseUrl);
			}
			this._appliedLayerManifestChanges = vIdOrSettings.manifestChanges;

			this.createManifest(vIdOrSettings, bSuppress);
		}
	};

	Editor.prototype.createManifest = function (vIdOrSettings, bSuppress) {
		var sBaseUrl = this.getBaseUrl();
		var mOptions = {},
			vManifest = vIdOrSettings.manifest;
		this._isManifestReady = false;

		if (typeof vManifest === "string") {
			mOptions.manifestUrl = vManifest;
			vManifest = null;
		}

		if (this._oEditorManifest) {
			this._oEditorManifest.destroy();
		}
		this.destroyAggregation("_extension");
		var iCurrentModeIndex = Merger.layers[this.getMode()];

		this._oEditorManifest = new EditorManifest(this.getSection(), vManifest, sBaseUrl, vIdOrSettings.manifestChanges);
		this._oEditorManifest
			.load(mOptions)
			.then(function () {
				this._registerManifestModulePath();
				this._oInitialManifestModel = new JSONModel(this._oEditorManifest._oInitialJson);
				this.setProperty("json", this._oEditorManifest._oInitialJson, bSuppress);
				var oManifestJson = this._oEditorManifest._oManifest.getRawJson();
				var _beforeCurrentLayer = merge({}, oManifestJson);
				this._beforeManifestModel = new JSONModel(_beforeCurrentLayer);
				if (iCurrentModeIndex < Merger.layers["translation"] && this._currentLayerManifestChanges) {
					//merge if not translation
					oManifestJson = Merger.mergeDelta(oManifestJson, [this._currentLayerManifestChanges]);
				}
				//create a manifest model after the changes are merged
				this._manifestModel = new JSONModel(oManifestJson);
				this._isManifestReady = true;
				this.fireManifestReady();
				//use the translations
				this._loadDefaultTranslations();
				//add a context model
				this._createContextModel();
				if (this._oEditorManifest.getResourceBundle()) {
					this._enhanceI18nModel(this._oEditorManifest.getResourceBundle());
				}

				return this._loadExtension().then(function() {
					this._initInternal();
				}.bind(this));
			}.bind(this));
	};

	/**
	 * Registers the manifest ID as a module path.
	 */
	Editor.prototype._registerManifestModulePath = function () {
		if (!this._oEditorManifest) {
			return;
		}
		this._sAppId = this._oEditorManifest.get("/sap.app/id");
		if (this._sAppId) {
			LoaderExtensions.registerResourcePath(this._sAppId.replace(/\./g, "/"), this._oEditorManifest.getUrl() || "/");
		} else {
			Log.error("sap.app/id entry in the manifest is mandatory");
		}
	};

	Editor.prototype._loadDefaultTranslations = function () {
		if (this._defaultTranslationsLoaded) {
			return;
		}

		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");
		this._enhanceI18nModel(oResourceBundle);
		this._defaultTranslationsLoaded = true;
	};

	Editor.prototype._enhanceI18nModel = function (oResourceBundle) {
		var oResourceModel = this.getModel("i18n");

		if (oResourceModel) {
			if (oResourceModel.getResourceBundle().oUrlInfo.url !== oResourceBundle.oUrlInfo.url) {
				oResourceModel.enhance(oResourceBundle);
				this._oResourceBundle = oResourceModel.getResourceBundle();
			}
			return;
		}

		oResourceModel = new ResourceModel({
			bundle: oResourceBundle
		});

		this.setModel(oResourceModel, "i18n");
		this._oResourceBundle = oResourceBundle;
	};

	Editor.prototype._loadExtension = function () {
		var sExtensionPath = this._oEditorManifest.get(this.getConfigurationPath() + "/extension") || this._oEditorManifest.get("/" + this.getSection() + "/extension");
		if (!sExtensionPath) {
			Log.info("Extension is not defined in manifest, do not load it.");
			return new Promise(function (resolve, reject) {
				resolve();
			});
		}

		var sFullExtensionPath = this._sAppId.replace(/\./g, "/") + "/" + sExtensionPath;

		return new Promise(function (resolve, reject) {
			sap.ui.require([sFullExtensionPath], function (ExtensionSubclass) {
				var oExtension = new ExtensionSubclass();
				oExtension._setEditor(this, this._oLimitedInterface);
				this.setAggregation("_extension", oExtension); // the framework validates that the subclass extends "sap.ui.integration.Extension"
				resolve();
			}.bind(this), function (vErr) {
				Log.error("Failed to load " + sExtensionPath + ". Check if the path is correct. Reason: " + vErr);
				reject(vErr);
			});
		}.bind(this));
	};

	/**
	 * Performs an HTTP request using the given configuration.
	 *
	 * @public
	 * @experimental since 1.94
	 * @param {object} oConfiguration The configuration of the request.
	 * @param {string} oConfiguration.URL The URL of the resource.
	 * @param {string} [oConfiguration.mode="cors"] The mode of the request. Possible values are "cors", "no-cors", "same-origin".
	 * @param {string} [oConfiguration.method="GET"] The HTTP method. Possible values are "GET", "POST".
	 * @param {Object} [oConfiguration.parameters] The request parameters. If the method is "POST" the parameters will be put as key/value pairs into the body of the request.
	 * @param {Object} [oConfiguration.dataType="json"] The expected Content-Type of the response. Possible values are "xml", "json", "text", "script", "html", "jsonp". Note: Complex Binding is not supported when a dataType is provided. Serialization of the response to an object is up to the developer.
	 * @param {Object} [oConfiguration.headers] The HTTP headers of the request.
	 * @param {boolean} [oConfiguration.withCredentials=false] Indicates whether cross-site requests should be made using credentials.
	 * @returns {Promise} Resolves when the request is successful, rejects otherwise.
	 */
	 Editor.prototype.request = function (oConfiguration) {
		return this._oDataProviderFactory
			.create({ request: oConfiguration })
			.setAllowCustomDataType(true)
			.getData();
	};

	Editor.prototype.initDestinations = function (vHost) {
		var oHostInstance = this.getHostInstance();

		if (vHost && !oHostInstance) {
			Log.error(
				"Host with id '" + vHost + "' is not available during editor initialization. It must be available for host specific features to work.",
				"Make sure that the host already exists, before assigning it to the editor.",
				"sap.ui.integration.editor.Editor"
			);
		}

		if (this._oDestinations) {
			this._oDestinations.setHost(oHostInstance);
		} else {
			var sConfigurationPath = this.getConfigurationPath();
			this._oDestinations = new Destinations(oHostInstance, this._manifestModel.getProperty(sConfigurationPath + "/destinations"));
		}
	};

	Editor.prototype.initDataProviderFactory = function () {
		if (this._oDataProviderFactory) {
			this._oDataProviderFactory.destroy();
		}
		var oExtension = this.getAggregation("_extension");
		this._oDataProviderFactory = new DataProviderFactory(this._oDestinations, oExtension, undefined, this);
	};

	/**
	 * Resolves the given URL relatively to the manifest base path.
	 * Absolute paths are not changed.
	 *
	 * @example
	 * oEditor.getRuntimeUrl("images/Avatar.png") === "sample/card/images/Avatar.png"
	 * oEditor.getRuntimeUrl("http://www.someurl.com/Avatar.png") === "http://www.someurl.com/Avatar.png"
	 * oEditor.getRuntimeUrl("https://www.someurl.com/Avatar.png") === "https://www.someurl.com/Avatar.png"
	 *
	 * @ui5-restricted
	 * @param {string} sUrl The URL to resolve.
	 * @returns {string} The resolved URL.
	 */
	 Editor.prototype.getRuntimeUrl = function (sUrl) {
		var sAppId = this._sAppId,
			sAppName,
			sSanitizedUrl = sUrl && sUrl.trim().replace(/^\//, "");

		if (sAppId === null) {
			Log.error("The manifest is not ready so the URL can not be resolved. Consider using the 'manifestReady' event.", "sap.ui.integration.editor.Editor");
			return null;
		}

		if (!sAppId ||
			sUrl.startsWith("http://") ||
			sUrl.startsWith("https://") ||
			sUrl.startsWith("//")) {
			return sUrl;
		}

		sAppName = sAppId.replace(/\./g, "/");

		// do not use sap.ui.require.toUrl(sAppName + "/" + sSanitizedUrl)
		// because it doesn't work when the sSanitizedUrl starts with ".."
		return sap.ui.require.toUrl(sAppName) + "/" + sSanitizedUrl;
	};

	/**
	 * @private
	 * @ui5-restricted
	 * @returns {object} Local binding functions for this Editor
	 */
	 Editor.prototype.getBindingNamespaces = function () {
		var mNamespaces = {},
			oExtension = this.getAggregation("_extension");

		if (oExtension) {
			mNamespaces.extension = {
				formatters: oExtension.getFormatters()
			};
		}

		return mNamespaces;
	};

	/**
	 * Gets the instance of the <code>host</code> association.
	 *
	 * @public
	 * @experimental Since 1.77
	 * @returns {sap.ui.integration.Host} The host object associated with this editor.
	 */
	Editor.prototype.getHostInstance = function () {
		var sHost = this.getHost();
		if (!sHost) {
			return null;
		}
		return Core.byId(sHost);
	};

	/**
	 * Sets the language of the editor
	 *
	 * @param {string} sValue the language in the format language_region or language-region
	 * @param {*} bSuppress suppress rerendering of the editor
	 */
	Editor.prototype.setLanguage = function (sValue, bSuppress) {
		//unify the language-region to language_region
		if (!sValue || typeof sValue !== "string") {
			return this;
		}
		this._language = sValue.replaceAll('_', '-');
		if (this.getLanguage() != sValue) {
			//reload resource bundler if language changed
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");
			this._enhanceI18nModel(oResourceBundle);
		}
		this.setProperty("language", sValue, bSuppress);
		if (!Editor._languages[this._language]) {
			this._language = this._language.split("-")[0];
		}
		if (!Editor._languages[this._language]) {
			Log.warning("The language: " + sValue + " is currently unknown, some UI controls might show " + sValue + " instead of the language name.");
		}
		return this;
	};
	/**
	 * Increases the zIndex to a higher value for all popups
	 */
	Editor.prototype.onAfterRendering = function () {
		if (this.getDomRef()) {
			this._iZIndex = getHigherZIndex(this.getDomRef());
			Popup.setInitialZIndex(this._iZIndex);
		}
	};
	/**
		 * Filters the manifestChanges array in the oManifestSettings
		 * All changes that are done for layers > than current layer are removed (see also layers)
		 * The current layers changes are stored in this._currentLayerManifestChanges to be applied later in the editor code.
		 * All changes that are done for layers < that the current layer are kept in oManifestSettings.manifestChanges
		 *
		 * @param {*} oManifestSettings
		 */
	 Editor.prototype._filterManifestChangesByLayer = function (oManifestSettings) {
		var aChanges = [],
			oCurrentLayerChanges = { ":layer": Merger.layers[this.getMode()] },
			iCurrentModeIndex = Merger.layers[this.getMode()];
		/* hide multi language function since there has a translation issue in Portal
		var sEditorLanguage = this._language || this.getLanguage() || Core.getConfiguration().getLanguage().replaceAll('_', '-');
		*/
		oManifestSettings.manifestChanges.forEach(function (oChange) {
			//filter manifest changes. only the changes before the current layer are needed
			//editor will merge the last layer locally to allow "reset" or properties
			//also for translation layer, the "original" value is needed
			var iLayer = oChange.hasOwnProperty(":layer") ? oChange[":layer"] : 1000;
			/* hide multi language function since there has a translation issue in Portal
			//backward compatibility for old changes which not have property "multipleLanguage"
			//replace the value property by valueTranslation property
			if (!oChange.hasOwnProperty(":multipleLanguage")) {
				var oChangeTransfered = {};
				var aKeys = Object.keys(oChange);
				for (var j = 0; j < aKeys.length; j++) {
					if (aKeys[j].endsWith("/value") && typeof oChange[aKeys[j]] === "string") {
						var sValueTranslationsPath = aKeys[j].substring(0, aKeys[j].lastIndexOf("/")) + "/valueTranslations";
						if (!includes(aKeys, sValueTranslationsPath)) {
							var oValueTranslation = {};
							if (iLayer === Merger.layers["translation"]) {
								oValueTranslation[sEditorLanguage] = oChange[aKeys[j]];
							} else {
								for (var p in Editor._languages) {
									oValueTranslation[p] = oChange[aKeys[j]];
								}
							}
							oChangeTransfered[sValueTranslationsPath] = oValueTranslation;
							continue;
						}
					}
					oChangeTransfered[aKeys[j]] = oChange[aKeys[j]];
				}
				oChange = oChangeTransfered;
			}*/
			if (iLayer < iCurrentModeIndex) {
				aChanges.push(oChange);
			} else if (iLayer === iCurrentModeIndex) {
				//store the current layer changes locally for later processing
				oCurrentLayerChanges = oChange;
			}
		});
		oManifestSettings.manifestChanges = aChanges;
		this._currentLayerManifestChanges = oCurrentLayerChanges;
	};
	/**
	 * Initializes the editor after the json is set
	 */
	Editor.prototype._initInternal = function () {
		var that = this;
		//handle keyword designtime removal
		var sConfigurationPath = that.getConfigurationPath();
		var sDesigntime = that._oEditorManifest.get(sConfigurationPath + "/editor");
		if (!sDesigntime) {
			sDesigntime = that._oEditorManifest.get("/" + that.getSection() + "/designtime");
		}
		//load the designtime control and bundles lazy
		var	oConfiguration = that._manifestModel.getProperty(sConfigurationPath),
			oPromise,
			oDesigntimeConfig = that.getDesigntime();
		if (oDesigntimeConfig) {
			if (typeof oDesigntimeConfig === "function") {
				oPromise = new Promise(function (resolve, reject) {
					var oDesigntimeInstance = new oDesigntimeConfig();
					that._applyDesigntimeDefaults(oDesigntimeInstance.getSettings());
					resolve(oDesigntimeInstance);
				});
			} else if (typeof oDesigntimeConfig === "object") {
				oPromise = new Promise(function (resolve, reject) {
					sap.ui.require(["sap/ui/integration/Designtime"], function (Designtime) {
						var AdvancedDesigntime = Designtime.extend("test.Designtime");
						AdvancedDesigntime.prototype.create = function () {
							return oDesigntimeConfig;
						};
						var oDesigntime = new AdvancedDesigntime();
						that._applyDesigntimeDefaults(oDesigntime.getSettings());
						resolve(oDesigntime);
					});
				});
			}
		} else if (sDesigntime) {
			//load designtime from module
			oPromise = that.loadDesigntime().then(function (oDesigntime) {
				that._applyDesigntimeDefaults(oDesigntime.getSettings());
				return oDesigntime;
			});
		} else {
			//stay compatible and create designtime configuration based on parameters/destinations
			oPromise = Promise.resolve(that._createParameterDesigntime(oConfiguration));
		}
		oPromise.then(function (oDesigntime) {
			that._oDesigntimeInstance = oDesigntime;
			that.initDestinations();
			that.initDataProviderFactory();
			if (that.getMode() === "admin" || that.getMode() === "all") {
				//always add destination settings
				that._addDestinationSettings(oConfiguration, that._oDesigntimeInstance);
			}
			//create a settings model
			that._settingsModel = new JSONModel(that._oDesigntimeInstance.getSettings());
			that.setModel(that._settingsModel, "currentSettings");
			that.setModel(that._settingsModel, "items");
			return that._loadValueContextInDesigntime();
		}).then(function () {
			that._applyDesigntimeLayers(); //changes done from admin to content on the dt values
			return that._requestExtensionData();
		}).then(function () {
			that._requireFields().then(function () {
				that._startEditor();
			});
		});
	};

	Editor.prototype.loadDesigntime = function () {
		if (this._oDesigntime) {
			return Promise.resolve(this._oDesigntime);
		}

		if (!this._oEditorManifest) {
			return new Promise(function (resolve, reject) {
				this.attachManifestReady(function () {
					this.loadDesigntime().then(resolve, reject);
				}.bind(this));
			}.bind(this));
		}

		if (!this._sAppId) {
			return Promise.reject("App id not maintained");
		}

		return new Promise(function (resolve, reject) {
			//build the module path to load as part of the widgets module path
			//handle keyword designtime removal
			var sDesigntimePath = this._oEditorManifest.get(this.getConfigurationPath() + "/editor");
			if (!sDesigntimePath) {
				sDesigntimePath = this._oEditorManifest.get("/" + this.getSection() + "/designtime");
			}
			var	sFullDesigntimePath = this._sAppId.replace(/\./g, "/") + "/" + sDesigntimePath;
			if (sFullDesigntimePath) {
				sap.ui.require([sFullDesigntimePath], function (oDesigntime) {
					//successfully loaded
					oDesigntime = new oDesigntime();
					oDesigntime._readyPromise(this._oLimitedInterface, this).then(function () {
						this._oDesigntime = oDesigntime;
						resolve(oDesigntime);
					}.bind(this));
				}.bind(this), function () {
					//error
					reject({
						error: sFullDesigntimePath + " not found"
					});
				});
			} else {
				reject();
			}
		}.bind(this));
	};

	Editor.prototype.getConfigurationPath = function() {
		return "/" + this.getSection() + "/configuration";
	};

	/**
	 * Returns the current settings as a json with a manifest path and the current value
	 * additionally there is a layer number added as ":layer"
	 */
	Editor.prototype.getCurrentSettings = function () {
		var oSettings = this._settingsModel.getProperty("/"),
			mResult = {},
			mNext;
		if (oSettings && oSettings.form && oSettings.form.items) {
			for (var n in oSettings.form.items) {
				var oItem = oSettings.form.items[n];
				if (oItem.editable && oItem.visible) {
					/* hide multi language function since there has a translation issue in Portal
					var oValueTranslations;
					var sLanguage = this.getMode() !== "translation" ? Core.getConfiguration().getLanguage().replaceAll('_', '-') : this._language || this.getLanguage();
					*/
					var sValueTranslationsPath = "";
					if (oItem.manifestpath) {
						sValueTranslationsPath = oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueTranslations";
					}
					if (this.getMode() !== "translation") {
						if (oItem.translatable && !oItem._changed && oItem._translatedPlaceholder && !this._currentLayerManifestChanges[oItem.manifestpath] && !this._currentLayerManifestChanges[sValueTranslationsPath]) {
							//do not save a value that was not changed and comes from a translated default value
							//mResult[oItem.manifestpath] = oItem._translatedPlaceholder;
							//if we would save it
							continue;
						} else {
							/* hide multi language function since there has a translation issue in Portal
							* need to remove below line later if we want release multi language function again
							*/
							mResult[oItem.manifestpath] = oItem.value;
							if (oItem.valueItems) {
								mResult[oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueItems"] = oItem.valueItems;
							}
							// save the value tokens for backend filter with MultiInput
							if (oItem.valueTokens) {
								mResult[oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueTokens"] = oItem.valueTokens;
							}
							/* hide multi language function since there has a translation issue in Portal
							//if current parameter is string and translatable, create or merge valueTranslations property of it.
							//set the current change to current language in valueTranslations.
							if (oItem.type === "string" && oItem.translatable) {
								if (!oItem.valueTranslations) {
									oValueTranslations = {};
								} else {
									oValueTranslations = deepClone(oItem.valueTranslations, 500);
								}
								oValueTranslations[sLanguage] = oItem.value;
								oItem.valueTranslations = oValueTranslations;
								mResult[sValueTranslationsPath] = oItem.valueTranslations;
							} else {
								mResult[oItem.manifestpath] = oItem.value;
							}*/
						}
					} else if (oItem.translatable && oItem.value) {
						//in translation mode create an entry if there is a value
						mResult[oItem.manifestpath] = oItem.value;
					}
					if (oItem._next && (this.getAllowSettings())) {
						var bVisibleDefault = typeof (oItem.visibleToUser) === "undefined" ? true : oItem.visibleToUser;
						var bEditableDefault = typeof (oItem.editableToUser) === "undefined" ? true : oItem.editableToUser;
						if (oItem._next.visible === !bVisibleDefault) {
							mNext = mNext || {};
							mNext[oItem._settingspath + "/visible"] = oItem._next.visible;
						}
						if (oItem._next.editable === !bEditableDefault) {
							mNext = mNext || {};
							mNext[oItem._settingspath + "/editable"] = oItem._next.editable;
						}
						if (oItem._next.pageAdminValues) {
							mNext = mNext || {};
							mNext[oItem._settingspath + "/pageAdminValues"] = oItem._next.pageAdminValues;
						}
						if (typeof oItem._next.allowDynamicValues === "boolean" && this.getAllowDynamicValues()) {
							mNext = mNext || {};
							mNext[oItem._settingspath + "/allowDynamicValues"] = oItem._next.allowDynamicValues;
						}
					}
				}
			}
		}
		//add a property ":multipleLanguage" for backward compatibility of multiple language feature
		if (this.getMode() !== "translation") {
			mResult[":multipleLanguage"] = true;
		}
		mResult[":layer"] = Merger.layers[this.getMode()];
		mResult[":errors"] = this.checkCurrentSettings()[":errors"];
		if (mNext) {
			mResult[":designtime"] = mNext;
		}
		return mResult;
	};
	/**
	 * Checks for invalid values in the current settings and reports the errors
	 * TODO: highlight issues and add states...
	 */
	Editor.prototype.checkCurrentSettings = function () {
		var oSettings = this._settingsModel.getProperty("/"),
			mChecks = {};
		if (oSettings && oSettings.form && oSettings.form.items) {
			for (var n in oSettings.form.items) {
				var oItem = oSettings.form.items[n];
				if (oItem.editable) {
					if ((oItem.isValid || oItem.required) && !(this.getMode() === "translation" && oItem.translatable)) {
						if (oItem.isValid) {
							mChecks[oItem.manifestpath] = oItem.isValid(oItem);
						}
						mChecks[oItem.manifestpath] = true;
						var value = oItem.value;
						var sType = oItem.type;
						if (sType === "string" && value === "") {
							mChecks[oItem.manifestpath] = value;
							//inform user of this error
						}
						if ((sType === "date" || sType === "datetime") && isNaN(Date.parse(value))) {
							mChecks[oItem.manifestpath] = value;
							//inform user of this error
						}
						if (sType === "integer") {
							if (isNaN(parseInt(value))) {
								mChecks[oItem.manifestpath] = value;
								//inform user of this error
							} else if (value < oItem.min || value > oItem.max) {
								mChecks[oItem.manifestpath] = value;
								//inform user of this error
							}
						} if (sType === "number") {
							if (isNaN(parseFloat(value))) {
								mChecks[oItem.manifestpath] = value;
							} else if (value < oItem.min || value > oItem.max) {
								mChecks[oItem.manifestpath] = value;
							}
						}
					}
				}
			}
			mChecks[":layer"] = Merger.layers[this.getMode()];
		}
		mChecks[":errors"] = Object.values(mChecks).indexOf(false) > -1;
		return mChecks;
	};

	/**
	 * Creates a model for the context object of the host environment
	 */
	Editor.prototype._createContextModel = function () {
		var oHost = this.getHostInstance(),
			oContextModel = new JSONModel({}),
			oFlatContextModel = new JSONModel([]);

			//add the models in any case
		this.setModel(oContextModel, "context");
		this.setModel(oFlatContextModel, "contextflat");
		oContextModel._aPendingPromises = [];
		oFlatContextModel._getPathObject = function (sPath) {
			var a = this.getData().filter(function (o) {
				if (o.path === sPath) {
					return true;
				}
			});
			return a.length ? a[0] : null;
		};
		oFlatContextModel._getValueObject = function (sValue) {
			var a = this.getData() || [];
			a = a.filter(function (o) {
				if (o.value === sValue || o.object.value === sValue) {
					return true;
				}
			});
			return a.length ? a[0] : null;
		};
		var oContextDataPromise = new Promise(function (resolve, reject) {
			if (oHost && oHost.getContext) {
				var bResolved = false;
				setTimeout(function () {
					if (bResolved) {
						return;
					}
					Log.error("Editor context could not be determined with " + CONTEXT_TIMEOUT + ".");
					bResolved = true;
					resolve({});
				}, CONTEXT_TIMEOUT);
				oHost.getContext().then(function (oContextData) {
					if (bResolved) {
						Log.error("Editor context returned after more than " + CONTEXT_TIMEOUT + ". Context is ignored.");
					}
					bResolved = true;
					resolve(oContextData || {});
				});
			} else {
				resolve({});
			}
		});

		//get the context from the host
		oContextDataPromise.then(function (oContextData) {
			var oData = this._mergeContextData(oContextData);
			oContextModel.setData(oData);
			oFlatContextModel.setData(this.flattenData(oData, "label"));
		}.bind(this));

		//async update of the value via host call
		oContextModel.getProperty = function (sPath, oContext) {
			if (sPath && !sPath.startsWith("/") && !oContext) {
				sPath = "/" + sPath;
			}
			var sAbsolutePath = this.resolve(sPath, oContext),
				pGetProperty;
			if (sAbsolutePath.endsWith("/value")) {
				this._mValues = this._mValues || {};
				if (this._mValues.hasOwnProperty(sAbsolutePath)) {
					return this._mValues[sAbsolutePath];
					//when should this be invalidated?
				}
				this._mValues[sAbsolutePath] = undefined;
				// ask the host and timeout if it does not respond
				pGetProperty = Utils.timeoutPromise(oHost.getContextValue(sAbsolutePath.substring(1)));
				pGetProperty = pGetProperty.then(function (vValue) {
						this._mValues[sAbsolutePath] = vValue;
						this.checkUpdate();
					}.bind(this))
					.catch(function (sReason) {
						this._mValues[sAbsolutePath] = null;
						this.checkUpdate();
						Log.error("Path " + sAbsolutePath + " could not be resolved. Reason: " + sReason);
					}.bind(this));

				this._aPendingPromises.push(pGetProperty);
				return undefined;
			} else {
				//resolve dt data locally
				return JSONModel.prototype.getProperty.apply(this, arguments);
			}
		};
	};

	Editor.prototype._mergeContextData = function (oContextData) {
		var oData = {};
		//empty entry
		oData["empty"] = Editor._contextEntries.empty;
		//custom entries
		for (var n in oContextData) {
			oData[n] = oContextData[n];
		}
		//editor internal
		oData["editor.internal"] = Editor._contextEntries["editor.internal"];
		return oData;
	};

	Editor.prototype._loadValueContextInDesigntime = function () {
		var oContextModel = this.getModel("context");
		var oSettings = this._oDesigntimeInstance.getSettings();
		var sItemsString;
		if (oSettings && oSettings.form && oSettings.form.items) {
			sItemsString = JSON.stringify(oSettings.form.items);
		}
		if (sItemsString) {
			var contextParamRegExp = /\{context\>[\/?\w+.]+\}/g;
			var aResult = sItemsString.match(contextParamRegExp);
			var aContextEntries;
			if (aResult && aResult.length > 0) {
				// only value context need to load
				aResult = aResult.filter(function (sResult) {
					return sResult.endsWith("value}");
				});
				aContextEntries = aResult.map(function (sResult) {
					return sResult.substring("{context>".length, sResult.length - 1);
				});
				aContextEntries.forEach(function (sContextEntry) {
					oContextModel.getProperty(sContextEntry);
				});
				return Promise.all(oContextModel._aPendingPromises).then(function () {
					oContextModel._aPendingPromises = [];
				});
			}
		}
		return Promise.resolve();
	};

	//map editors for a specific type
	Editor.fieldMap = {
		"string": "sap/ui/integration/editor/fields/StringField",
		"integer": "sap/ui/integration/editor/fields/IntegerField",
		"number": "sap/ui/integration/editor/fields/NumberField",
		"boolean": "sap/ui/integration/editor/fields/BooleanField",
		"date": "sap/ui/integration/editor/fields/DateField",
		"datetime": "sap/ui/integration/editor/fields/DateTimeField",
		"string[]": "sap/ui/integration/editor/fields/ListField",
		"destination": "sap/ui/integration/editor/fields/DestinationField"
	};
	Editor.Fields = null;
	/**
	 * Loads all field modules registered in Editor.fieldMap and stores the classes in Editor.Fields
	 */
	Editor.prototype._requireFields = function () {
		if (Editor.Fields) {
			return Promise.resolve();
		}
		return new Promise(function (resolve) {
			sap.ui.require(Object.values(Editor.fieldMap), function () {
				Editor.Fields = {};
				for (var n in Editor.fieldMap) {
					Editor.Fields[n] = arguments[Object.keys(Editor.fieldMap).indexOf(n)];
				}
				resolve();
			});
		});
	};

	Editor.prototype._createDescription = function (oConfig) {
		var oDescIcon = new Icon({
			src: "sap-icon://message-information",
			color: "Marker",
			size: "12px",
			useIconTooltip: false,
			visible: oConfig.visible,
			objectBindings: {
				currentSettings: {
					path: "currentSettings>" + oConfig._settingspath
				},
				items: {
					path: "items>/form/items"
				},
				context: {
					path: "context>/"
				}
			}
		});
		oDescIcon.addStyleClass("sapUiIntegrationEditorDescriptionIcon");
		oDescIcon.onmouseover = function (oDescIcon) {
			this._getPopover().getContent()[0].applySettings({ text: oConfig.description });
			this._getPopover().openBy(oDescIcon);
			oDescIcon.addDependent(this._getPopover());
		}.bind(this, oDescIcon);
		oDescIcon.onmouseout = function (oDescIcon) {
			this._getPopover().close();
			oDescIcon.removeDependent(this._getPopover());
		}.bind(this, oDescIcon);
		return oDescIcon;
	};

	Editor.prototype._createMessageIcon = function (oField) {
		var oConfig = oField.getConfiguration();
		var oMsgIcon = new Icon({
			src: "sap-icon://message-information",
			size: "12px",
			visible: oConfig.visible,
			useIconTooltip: false,
			objectBindings: {
				currentSettings: {
					path: "currentSettings>" + oConfig._settingspath
				},
				items: {
					path: "items>/form/items"
				},
				context: {
					path: "context>/"
				}
			}
		});
		oMsgIcon.onmouseover = function (oField) {
			oField._showMessage();
		}.bind(this, oField);
		oMsgIcon.onmouseout = function (oField) {
			oField._hideMessage();
		}.bind(this, oField);
		oMsgIcon.addStyleClass("sapUiIntegrationEditorMessageIcon");
		return oMsgIcon;
	};

	/**
	 * Creates a label based on the configuration settings
	 * @param {} oConfig
	 */
	Editor.prototype._createLabel = function (oConfig) {
		var oLabel = new Label({
			text: oConfig.label,
			tooltip: oConfig.tooltip || oConfig.label,
			//mark only fields that are required and editable,
			//otherwise this is confusing because user will not be able to correct it
			required: oConfig.required && oConfig.editable || false,
			visible: oConfig.visible,
			objectBindings: {
				currentSettings: {
					path: "currentSettings>" + oConfig._settingspath
				},
				items: {
					path: "items>/form/items"
				},
				context: {
					path: "context>/"
				}
			}
		});
		oLabel._cols = oConfig.cols || 2; //by default 2 cols
		if (oConfig.layout) {
			oLabel._layout = oConfig.layout;
		}
		oLabel._sOriginalType = oConfig.type;
		return oLabel;
	};

	/**
	 * Create the settings button
	 */
	 Editor.prototype._createSettingsButton = function (oField) {
		var oConfig = oField.getConfiguration();
		var oSettingsButton = new Button({
			icon: "{= ${currentSettings>_hasDynamicValue} ? 'sap-icon://display-more' : 'sap-icon://enter-more'}",
			type: "Transparent",
			tooltip: this._oResourceBundle.getText("EDITOR_FIELD_MORE_SETTINGS"),
			press: function (oEvent) {
				this._openSettingsDialog(200, oEvent.oSource, oField);
			}.bind(this),
			visible: oConfig.visible,
			objectBindings: {
				currentSettings: {
					path: "currentSettings>" + oConfig._settingspath
				},
				items: {
					path: "items>/form/items"
				},
				context: {
					path: "context>/"
				}
			}
		});
		return oSettingsButton;
	};

	Editor.prototype._getSettingsPanel = function (oField) {
		if (!oField._oSettingsPanel) {
			oField._oSettingsPanel = new Settings();
		}
		return oField._oSettingsPanel;
	};

	Editor.prototype._openSettingsDialog = function (iDelay, oSettingsButton, oField) {
		var oSettingsPanel = this._getSettingsPanel(oField);
		window.setTimeout(function () {
			oSettingsPanel.setConfiguration(oField.getConfiguration());
			var oPreview = this.getAggregation("_preview");
			oSettingsPanel.open(
				oSettingsButton,
				oSettingsButton,
				oPreview,
				oField.getHost(),
				oField,
				oField._applySettings.bind(oField),
				oField._cancelSettings.bind(oField));
		}.bind(this), iDelay || 600);
	};

	Editor.prototype._getPopover = function () {
		if (this._oPopover) {
			return this._oPopover;
		}
		var oText = new Text({
			text: ""
		});
		oText.addStyleClass("sapUiTinyMargin sapUiIntegrationEditorDescriptionText");
		this._oPopover = new RPopover({
			showHeader: false,
			content: [oText]
		});
		this._oPopover.addStyleClass("sapUiIntegrationEditorPopover");
		return this._oPopover;
	};

	/**
	 * Creates a Field based on the configuration settings
	 * @param {*} oConfig
	 */
	Editor.prototype._createField = function (oConfig) {
		var oField = new Editor.Fields[oConfig.type]({
			configuration: oConfig,
			mode: this.getMode(),
			host: this.getHostInstance(),
			objectBindings: {
				currentSettings: {
					path: "currentSettings>" + oConfig._settingspath
				},
				items: {
					path: "items>/form/items"
				},
				context: {
					path: "context>/"
				}
			},
			visible: oConfig.visible
		});

		this._aFieldReadyPromise.push(oField._readyPromise.then(function() {
			if (oConfig.require
				|| oConfig.validation
				|| (oConfig.validations && oConfig.validations.length > 0)
				|| (oConfig.values && oConfig.values.data && !oConfig.values.data.json)) {
				var oMsgIcon = this._createMessageIcon(oField);
				oField.setAssociation("_messageIcon", oMsgIcon);
			}
			if (oConfig.description && this.getMode() !== "translation") {
				oField._descriptionIcon = this._createDescription(oConfig);
			}
			if (oConfig._changeDynamicValues) {
				oField._settingsButton = this._createSettingsButton(oField);
				oField._applyButtonStyles();
			}
		}.bind(this)));
		//listen to value changes on the settings
		var oValueBinding = this._settingsModel.bindProperty(oConfig._settingspath + "/value");
		oValueBinding.attachChange(function () {
			if (!this._bIgnoreUpdates) {
				oConfig._changed = true;
				if (oConfig._dependentFields && oConfig._dependentFields.length > 0) {
					this._updateEditor(oConfig._dependentFields);
				}
				this._updatePreview();
			}
		}.bind(this));
		if (oField.isFilterBackend()) {
			//listen to suggest value changes on the settings if current field support filter backend feature
			var oSuggestValueBinding = this._settingsModel.bindProperty(oConfig._settingspath + "/suggestValue");
			oSuggestValueBinding.attachChange(function () {
				var oConfigTemp = merge({}, oConfig);
				oConfigTemp._cancel = false;
				this._addValueListModel(oConfigTemp, oField);
			}.bind(this));
		}
		if (oConfig.values) {
			// for MultiInput used in string[] field with filter backend, do not request data when creating it
			if (oConfig.type === "string[]" && oField.isFilterBackend() && oConfig.visualization && oConfig.visualization.type === "MultiInput") {
				oField.setModel(new JSONModel({}), undefined);
			} else {
				this._addValueListModel(oConfig, oField);
			}
		}
		this._createDependentFields(oConfig, oField);
		oField._cols = oConfig.cols || 2; //by default 2 cols
		if (oConfig.layout) {
			oField._layout = oConfig.layout;
		}
		oField._oDataProviderFactory = this._oDataProviderFactory;
		oField.setAssociation("_messageStrip", this.getAggregation("_messageStrip"));
		return oField;
	};

	Editor.prototype._updateEditor = function (aDependentFields) {
		if (this._ready) {
			if (aDependentFields.length === 0) {
				return;
			}
			for (var i = 0; i < aDependentFields.length; i++) {
				var o = aDependentFields[i];
				o.config._cancel = true;
			}
			if (!this._oDataProviderFactory) {
				return;
			}
			this._bIgnoreUpdates = true;
			for (var i = 0; i < aDependentFields.length; i++) {
				var o = aDependentFields[i];
				o.config._cancel = false;
				this._addValueListModel(o.config, o.field, 500 * i);
			}
			this._bIgnoreUpdates = false;
		}
	};

	/**
	 * updates the additional content
	 * TODO: Track changes and call update of the additional content
	 */
	Editor.prototype._updatePreview = function () {
		var oPreview = this.getAggregation("_preview");
		if (oPreview && oPreview.update) {
			oPreview.update();
		}
	};

	/**
	 * request data via data provider in RT
	 * @param {object} oConfig
	 * @param {BaseField} oField
	 */
	Editor.prototype._requestData = function (oConfig, oField) {
		var oDataProvider = this._oDataProviderFactory.create(oConfig.values.data);
		oDataProvider.bindObject({
			path: "items>/form/items"
		});
		oDataProvider.bindObject({
			path: "currentSettings>" + oConfig._settingspath
		});
		oDataProvider.bindObject({
			path: "context>/"
		});
		var oPromise = oDataProvider.getData();
		oPromise.then(function (oData) {
			if (oConfig._cancel) {
				oConfig._values = [];
				this._settingsModel.setProperty(oConfig._settingspath + "/_loading", false);
				return;
			}
			// filter data for page admin
			var oPath = oConfig.values.data.path,
			    aPath,
			    tResult = [];
			if (oPath && oPath !== "/") {
				if (oPath.startsWith("/")) {
					oPath = oPath.substring(1);
				}
				if (oPath.endsWith("/")) {
					oPath = oPath.substring(0, oPath.length - 1);
				}
				aPath = oPath.split("/");
				tResult = ObjectPath.get(aPath, oData);
			} else {
				tResult = oData;
			}
			if (this.getMode() === "content" && oConfig.pageAdminValues && oConfig.pageAdminValues.length > 0) {
				var paValues = oConfig.pageAdminValues,
				    selValues = oConfig.value,
					selValueItems = oConfig.valueItems,
				    results = [],
					selResults = [],
					selItemsResults = [];
				this.prepareFieldsInKey(oConfig);
				if (paValues.length > 0) {
					for (var i = 0; i < paValues.length; i++) {
						for (var j = 0; j < tResult.length; j++) {
							var keyValue = this.getKeyFromItem(tResult[j]);
							if (paValues[i] === keyValue) {
								results.push(tResult[j]);
							}
						}
						if (Array.isArray(selValues)) {
							for (var k = 0; k < selValues.length; k++) {
								if (paValues[i] === selValues[k]) {
									selResults.push(selValues[k]);
								}
							}
							for (var l = 0; l < selValueItems.length; l++) {
								var kValue = this.getKeyFromItem(selValueItems[l]);
								if (paValues[i] === kValue) {
									selItemsResults.push(selValueItems[l]);
								}
							}
						}
					}
					if (selResults.length > 0) {
						oConfig.value = [];
						oConfig.value = selResults;
					}
					if (selItemsResults.length > 0) {
						oConfig.valueItems = [];
						oConfig.valueItems = selItemsResults;
					}
				}
				if (oConfig.values.data.path && oConfig.values.data.path !== "/") {
					delete oData[aPath];
					ObjectPath.set(aPath, results, oData);
				} else {
					oData = [];
					oData = results;
				}
			}
			//add group property "Selected" to each record for MultiComboBox in ListField
			//user configration of the field since its value maybe changed
			var oFieldConfig = oField.getConfiguration();
			if (oConfig.type === "string[]") {
				var sPath = oConfig.values.data.path;
				if (sPath && sPath !== "/") {
					if (sPath.startsWith("/")) {
						sPath = sPath.substring(1);
					}
					if (sPath.endsWith("/")) {
						sPath = sPath.substring(0, sPath.length - 1);
					}
					var aPath = sPath.split("/");
					var oResult = ObjectPath.get(aPath, oData);
					if (Array.isArray(oResult)) {
						for (var n in oResult) {
							var sKey = oField.getKeyFromItem(oResult[n]);
							if (Array.isArray(oFieldConfig.value) && oFieldConfig.value.length > 0 && includes(oFieldConfig.value, sKey)) {
								oResult[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_SELECTED");
							} else {
								oResult[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_UNSELECTED");
							}
						}
						ObjectPath.set(aPath, oResult, oData);
					}
				} else if (Array.isArray(oData)) {
					for (var n in oData) {
						var sKey = oField.getKeyFromItem(oData[n]);
						if (Array.isArray(oFieldConfig.value) && oFieldConfig.value.length > 0 && includes(oFieldConfig.value, sKey)) {
							oData[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_SELECTED");
						} else {
							oData[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_UNSELECTED");
						}
					}
				}
			}
			oConfig._values = oData;
			var oValueModel = oField.getModel();
			oValueModel.setData(oData);
			oValueModel.checkUpdate(true);
			oValueModel.firePropertyChange();
			this._settingsModel.setProperty(oConfig._settingspath + "/_loading", false);
			oField._hideValueState(true, true);
		}.bind(this)).catch(function (oError) {
			this._settingsModel.setProperty(oConfig._settingspath + "/_loading", false);
			var sError = this._oResourceBundle.getText("EDITOR_BAD_REQUEST");
			if (Array.isArray(oError) && oError.length > 0) {
				sError = oError[0];
				var jqXHR = oError[1];
				if (jqXHR) {
					var oErrorInResponse;
					if (jqXHR.responseJSON) {
						oErrorInResponse = jqXHR.responseJSON.error;
					} else if (jqXHR.responseText) {
						if (Utils.isJson(jqXHR.responseText)) {
							oErrorInResponse = JSON.parse(jqXHR.responseText).error;
						} else {
							sError = jqXHR.responseText;
						}
					}
					if (oErrorInResponse) {
						sError = (oErrorInResponse.code || oErrorInResponse.errorCode || jqXHR.status) + ": " + oErrorInResponse.message;
					}
				}
			} else if (typeof (oError) === "string") {
				sError = oError;
			}
			var oValueModel = oField.getModel();
			oValueModel.firePropertyChange();
			oField._showValueState("error", sError, true);
		}.bind(this));
	};

	Editor.prototype._requestExtensionData = function () {
		var oExtension = this.getAggregation("_extension");
		if (!oExtension) {
			Log.info("Extension is not defined or created, do not load data of it.");
			return new Promise(function (resolve, reject) {
				resolve();
			});
		}
		var bHasExtensionData = false;
		var oExtensionConfig = {};
		var oExtensionProperty = this._oEditorManifest.get(this.getConfigurationPath() + "/data/extension");
		var sPath;
		if (oExtensionProperty) {
			bHasExtensionData = true;
			sPath = this._oEditorManifest.get(this.getConfigurationPath() + "/data/path");
			oExtensionConfig = {
				"extension": oExtensionProperty
			};
			if (sPath) {
				oExtensionConfig.path = sPath;
			}
		} else {
			oExtensionProperty = this._oEditorManifest.get("/" + this.getSection() + "/data/extension");
			if (oExtensionProperty) {
				bHasExtensionData = true;
				sPath = this._oEditorManifest.get("/" + this.getSection() + "/data/path");
				oExtensionConfig = {
					"extension": oExtensionProperty
				};
				if (sPath) {
					oExtensionConfig.path = sPath;
				}
			}
		}
		if (!bHasExtensionData) {
			Log.info("Extension data is not defined in manifest, do not load data of it.");
			return new Promise(function (resolve, reject) {
				resolve();
			});
		}
		var oDataProvider = this._oDataProviderFactory.create(oExtensionConfig);
		var oPromise = oDataProvider.getData();
		return oPromise.then(function (oData) {
			var oValueModel = oExtension.getModel();
			if (!oValueModel) {
				oValueModel = new JSONModel(oData || {});
				oExtension.setModel(oValueModel, undefined);
			} else {
				oValueModel.setData(oData);
			}
			oValueModel.checkUpdate(true);
		}).catch(function (oError) {
			var sError = this._oResourceBundle.getText("EDITOR_BAD_REQUEST");
			if (Array.isArray(oError) && oError.length > 0) {
				sError = oError[0];
				var jqXHR = oError[1];
				if (jqXHR) {
					var oErrorInResponse;
					if (jqXHR.responseJSON) {
						oErrorInResponse = jqXHR.responseJSON.error;
					} else if (jqXHR.responseText) {
						if (Utils.isJson(jqXHR.responseText)) {
							oErrorInResponse = JSON.parse(jqXHR.responseText).error;
						} else {
							sError = jqXHR.responseText;
						}
					}
					if (oErrorInResponse) {
						sError = (oErrorInResponse.code || oErrorInResponse.errorCode || jqXHR.status) + ": " + oErrorInResponse.message;
					}
				}
			} else if (typeof (oError) === "string") {
				sError = oError;
			}
			Log.error("Request extension data failed, " + sError);
		}.bind(this));
	};

	/**
	 * Creates a unnamed model if a values.data section exists in the configuration
	 * @param {object} oConfig
	 * @param {BaseField} oField
	 */
	Editor.prototype._addValueListModel = function (oConfig, oField, nTimeout) {
		if (oConfig.values) {
			var oValueModel;
			if (oConfig.values.data) {
				if (this._oDataProviderFactory) {
					oValueModel = oField.getModel();
					if (!oValueModel) {
						oValueModel = new JSONModel({});
						oField.setModel(oValueModel, undefined);
					}
					this._settingsModel.setProperty(oConfig._settingspath + "/_loading", true);
					if (!nTimeout) {
						this._requestData(oConfig, oField);
					} else {
						setTimeout(function() {
							this._requestData(oConfig, oField);
						}.bind(this), nTimeout);
					}
				}
				//we use the binding context to connect the given path from oConfig.values.data.path
				//with that the result of the data request can be have also other structures.
				oField.bindObject({
					path: oConfig.values.data.path || "/"
				});
			} else if (this.getAggregation("_extension")) {
				oValueModel = this.getAggregation("_extension").getModel();
				//filter data for page admin
				if (oValueModel && this.getMode() === "content" && oConfig.pageAdminValues && oConfig.pageAdminValues.length > 0) {
					this.prepareFieldsInKey(oConfig);
					var ePath = oConfig.values.path;
					if (ePath.length > 1) {
						ePath = ePath.substring(1);
					}
					var oValueData = ObjectPath.get([ePath], oValueModel.getData()),
					    paValues = oConfig.pageAdminValues,
						results = [];
					for (var m = 0; m < paValues.length; m++) {
						for (var j = 0; j < oValueData.length; j++) {
							var keyValue = this.getKeyFromItem(oValueData[j]);
							if (paValues[m] === keyValue) {
								results.push(oValueData[j]);
							}
						}
					}
					delete oValueData[ePath];
					ObjectPath.set(ePath, results, oValueData);
					oValueModel.setData(oValueData);
				}
				//we use the binding context to connect the given path from oConfig.values.path
				//with that the result of the data request can be have also other structures.
				oField.bindObject({
					path: oConfig.values.path || "/"
				});
				//in the designtime the item bindings will not use a named model, therefore we add a unnamed model for the field
				//to carry the values.
				oField.setModel(oValueModel, undefined);
			}
		}
	};

	Editor.prototype._createDependentFields = function (oConfig, oField) {
		if (oConfig.values) {
			var sData = JSON.stringify(oConfig.values.data);
			if (sData) {
				var destParamRegExp = /parameters\.([^\}\}]+)|destinations\.([^\}\}]+)|\{items\>[\/?\w+]+\}/g,
					aResult = sData.match(destParamRegExp);
				if (aResult) {
					//add the field to dependency to either the parameter or destination
					for (var i = 0; i < aResult.length; i++) {
						var sValueKey = "/value";
						var sDependentPath = this.getConfigurationPath();
						if (aResult[i].indexOf("destinations.") === 0 || aResult[i].indexOf("parameters.") === 0) {
							if (aResult[i].indexOf("destinations.") === 0) {
								sValueKey = "/name";
							}
							sDependentPath = sDependentPath + aResult[i].replace(".", "/") + "/" + sValueKey;
						} else if (aResult[i].indexOf("{items>") === 0) {
							sDependentPath = sDependentPath + "/parameters/" + aResult[i].slice(7, -1);
						}
						var oItem = this._mItemsByPaths[sDependentPath];
						if (oItem) {
							//DIGITALWORKPLACE-4802
							//clone the config since the item may dependent to itself in filter backend feature
							if (oItem._settingspath === oConfig._settingspath) {
								oConfig = merge({}, oConfig);
							}
							oItem._dependentFields = oItem._dependentFields || [];
							oItem._dependentFields.push({
								field: oField,
								config: oConfig
							});
						}
					}
				}
			}
		}
	};
	/**
	 * Adds an item to the _formContent aggregation based on the config settings
	 * @param {} oConfig
	 */
	Editor.prototype._addItem = function (oConfig) {
		var sMode = this.getMode();
		//force to turn off features for settings and dynamic values and set the default if not configured
		if (this.getAllowDynamicValues() === false || !oConfig.allowDynamicValues) {
			oConfig.allowDynamicValues = false;
		}
		if (this.getAllowSettings() === false) {
			oConfig.allowSettings = false;
		}
		oConfig.__cols = oConfig.cols || 2;

		//if the item is not visible or translation mode, continue immediately
		if (oConfig.visible === false || (!oConfig.translatable && sMode === "translation" && oConfig.type !== "group")) {
			return;
		}
		if (oConfig.type === "group") {
			var oPanel = new Panel({
				headerText: oConfig.label,
				visible: oConfig.visible,
				expandable: oConfig.expandable !== false,
				expanded: oConfig.expanded !== false,
				width: "auto",
				backgroundDesign: "Transparent",
				objectBindings: {
					currentSettings: {
						path: "currentSettings>" + oConfig._settingspath
					},
					items: {
						path: "items>/form/items"
					},
					context: {
						path: "context>/"
					}
				},
				expand: function (oEvent) {
					var oControl = oEvent.getSource();
					if (!oEvent.mParameters.expand && oControl.getParent().getAggregation("_messageStrip") !== null) {
						MessageStripId = oControl.getParent().getAggregation("_messageStrip").getId();
					}
					if (oEvent.mParameters.expand) {
						var oMessageStrip = Core.byId(MessageStripId);
						oControl.addContent(oMessageStrip);
						oControl.focus();
					}
				}
			});
			this.addAggregation("_formContent", oPanel);
			oPanel._cols = oConfig.cols || 2; //by default 2 cols
			if (oConfig.hint) {
				this._addHint(oConfig.hint);
			}
			return;
		}
		if (oConfig.type === "separator") {
			var oSeparator = new Separator();
			this.addAggregation("_formContent", oSeparator);
			//currently do not publish the line property to customer
			//oSeparator._hasLine = oConfig.line || false;
			return;
		}
		var oNewLabel = null;
		if (sMode === "translation") {
			if ((typeof oConfig.value === "string" && oConfig.value.indexOf("{") === 0) || typeof oConfig.values !== "undefined") {
				//do not show dynamic values for translation
				return;
			}
			//adding an internal _language object to save the original value for the UI
			oConfig._language = {
				value: oConfig.value
			};

			//force a 2 column layout in the form, remember the original to reset

			oConfig.cols = 1;
			//delete values property of string field
			delete oConfig.values;

			//create a configuration clone. map the _settingspath setting to _language, and set it to not editable
			var origLangField = deepClone(oConfig, 500);
			origLangField._settingspath += "/_language";
			origLangField.editable = false;
			origLangField.required = false;
			/* hide multi language function since there has a translation issue in Portal
			//if has valueTransaltions, get value via language setting in core
			if (origLangField.valueTranslations) {
				var sLanguage = Core.getConfiguration().getLanguage().replaceAll('_', '-');
				if (Editor._languages[sLanguage]) {
					if (origLangField.valueTranslations[sLanguage]) {
						origLangField.value = origLangField.valueTranslations[sLanguage];
					}
				} else if (sLanguage.indexOf"-") > -1) {
					sLanguage = sLanguage.substring(0, sLanguage.indexOf("-"));
					if (Editor._languages[sLanguage]) {
						if (origLangField.valueTranslations[sLanguage]) {
							origLangField.value = origLangField.valueTranslations[sLanguage];
						}
					}
				}
			}*/
			if (!origLangField.value) {
				//the original language field shows only a text control. If empty we show a dash to avoid empty text.
				origLangField.value = "-";
			}
			var oLabel = this._createLabel(origLangField);
			this.addAggregation("_formContent",
				oLabel
			);
			var oField = this._createField(origLangField);
			oField.isOrigLangField = true;
			this.addAggregation("_formContent", oField);

			oConfig.value = oConfig._translatedValue || "";
			//even if a item is not visible or not editable by another layer for translations it should always be editable and visible
			oConfig.editable = oConfig.visible = oConfig.translatable;
			//if there are changes for the current layer, read the already translated value from there
			//now merge these changes for translation into the item configs
			if (this._currentLayerManifestChanges) {
				oConfig.value = this._currentLayerManifestChanges[oConfig.manifestpath] || oConfig.value;
			}
			//change the label for the translation field
			oConfig.label = oConfig._translatedLabel || "";
			oConfig.required = false; //translation is never required
			var oField = this._createField(oConfig);
			this.addAggregation("_formContent",
				oField
			);
		} else {
			oNewLabel = this._createLabel(oConfig);
			this.addAggregation("_formContent",
				oNewLabel
			);
			//if there are changes for the current layer, read the already translated value from there
			//now merge these changes for translation into the item configs
			if (this._currentLayerManifestChanges) {
				oConfig.value = this._currentLayerManifestChanges[oConfig.manifestpath] || oConfig.value;
			}
			var oField = this._createField(oConfig);
			this.addAggregation("_formContent",
				oField
			);
		}
		//add hint in the new row.
		if (oConfig.hint && (!oConfig.cols || oConfig.cols === 2)) {
			this._addHint(oConfig.hint);
		}
		//reset the cols to original
		oConfig.cols = oConfig.__cols;
		delete oConfig.__cols;
	};

	Editor.prototype._createHint = function (sHint) {
		sHint = sHint.replace(/<a href/g, "<a target='blank' href");
		var oFormattedText = new FormattedText({
			htmlText: sHint
		});
		return oFormattedText;
	};

	Editor.prototype._addHint = function (sHint) {
		var oHint = this._createHint(sHint);
		this.addAggregation("_formContent", oHint);
	};
	/**
	 * Returns the current language specific text for a given key or "" if no translation for the key exists
	 */
	Editor.prototype._getCurrentLanguageSpecificText = function (sKey) {
		var sLanguage = this._language;
		if (this._oTranslationBundle) {
			var sText = this._oTranslationBundle.getText(sKey, [], true);
			if (sText === undefined) {
				return "";
			}
			return sText;
		}
		if (!sLanguage) {
			return "";
		}
		var vI18n = this._oEditorManifest.get("/sap.app/i18n");
		if (!vI18n) {
			return "";
		}
		if (typeof vI18n === "string") {
			var aFallbacks = [sLanguage];
			if (sLanguage.indexOf("-") > -1) {
				aFallbacks.push(sLanguage.substring(0, sLanguage.indexOf("-")));
			}
			//add en into fallbacks
			if (!includes(aFallbacks, "en")) {
				aFallbacks.push("en");
			}
			// load the ResourceBundle relative to the manifest
			this._oTranslationBundle = ResourceBundle.create({
				url: this.getBaseUrl() + vI18n,
				async: false,
				locale: sLanguage,
				supportedLocales: aFallbacks,
				fallbackLocale: "en"
			});

			return this._getCurrentLanguageSpecificText(sKey);
		}
	};

	/**
	 * Starts the editor, creates the fields
	 */
	Editor.prototype._startEditor = function () {
		var oContents = this.getAggregation("_formContent");
		if (oContents && oContents.length > 0) {
			this.destroyAggregation("_formContent");
		}
		var oSettings = this._settingsModel.getProperty("/");
		var aItems;
		if (oSettings.form && oSettings.form.items) {
			aItems = oSettings.form.items;
			//get current language
			var sLanguage = this._language || this.getLanguage() || Core.getConfiguration().getLanguage().replaceAll('_', '-');
			if (this.getMode() === "translation") {
				//add top panel of translation editor
				this._addItem({
					type: "group",
					translatable: true,
					expandable: false,
					label: this._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[sLanguage]
				});
			}
			//add general configuration group
			var bAddGeneralSettingsPanel = false;
			for (var m in aItems) {
				var oItem = aItems[m];
				if (oItem.type === "group") {
					break;
				} else if (oItem.visible) {
					bAddGeneralSettingsPanel = true;
					break;
				}
			}
			if (bAddGeneralSettingsPanel) {
				//add general settings panel
				this._addItem({
					type: "group",
					translatable: true,
					label: this._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS")
				});
			}
			this._mItemsByPaths = {};
			for (var n in aItems) {
				var oItem = aItems[n];
				if (oItem) {
					//force a label setting, set it to the name of the item
					oItem.label = oItem.label || n;
					//what is the current value from the change?
					/* hide multi language function since there has a translation issue in Portal
					var sCurrentLayerValue, sValueTranslationsPath, aTranslationLayerValueChanges;
					* remove below line if release this feature again
					*/
					var sCurrentLayerValue;
					if (oItem.manifestpath) {
						this._mItemsByPaths[oItem.manifestpath] = oItem;
						/* hide multi language function since there has a translation issue in Portal
						sValueTranslationsPath = oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueTranslations";
						if (this.getMode() === "translation") {
							if (this._currentLayerManifestChanges
								&& this._currentLayerManifestChanges[sValueTranslationsPath]) {
								//get valueTranslations from current layer changes if current mode is translation
								aTranslationLayerValueChanges = this._currentLayerManifestChanges[sValueTranslationsPath];
							}
						} else {
							sCurrentLayerValue = this._currentLayerManifestChanges[oItem.manifestpath];
						}*/
						/* hide multi language function since there has a translation issue in Portal
						* need to remove below line later if release multi language function again
						*/
						sCurrentLayerValue = this._currentLayerManifestChanges[oItem.manifestpath];
					}
					//if not changed it should be undefined, and ignore changes in tranlation layer
					oItem._changed = sCurrentLayerValue !== undefined && this.getMode() !== "translation";

					if (oItem.values) {
						oItem.translatable = false;
					}

					oItem._beforeValue = this._getManifestBeforelValue(oItem.manifestpath);

					//check if the provided value from the parameter or designtime default value is a translated value
					//restrict this to string types for now
					if (oItem.type === "string") {
						/* hide multi language function since there has a translation issue in Portal
						//get i18n path of the editor, and set it to item for initializing EditorResourceBundles
						var vI18n = this._oEditorManifest.get("/sap.app/i18n");
						if (!vI18n) {
							vI18n = "";
						}
						oItem._resourceBundleURL = this.getBaseUrl() + vI18n;
						if (oItem.manifestpath) {
							//merge valueTranslations in current mainfest mode and current layer changes
							var oValueTranslationsInManifest = this._manifestModel.getProperty(sValueTranslationsPath);
							oItem.valueTranslations = merge(oValueTranslationsInManifest, aTranslationLayerValueChanges);
							aTranslationLayerValueChanges = undefined;
						}*/
						//check if is translatable via default value, if default value match "{{sTranslationTextKey}}" or "{i18n>sTranslationTextKey}", it is translatable
						oItem._translatedDefaultPlaceholder = this._getManifestDefaultValue(oItem.manifestpath);
						var sTranslationTextKey = null,
							sPlaceholder = oItem._translatedDefaultPlaceholder;
						if (sPlaceholder) {
							//value with parameter syntax will not be translated
							if (this._isValueWithParameterSyntax(sPlaceholder)) {
								oItem.translatable = false;
							}
							//parameter translated value wins over designtime defaultValue
							if (this._isValueWithHandlebarsTranslation(sPlaceholder)) {
								sTranslationTextKey = sPlaceholder.substring(2, sPlaceholder.length - 2);
							} else if (sPlaceholder.startsWith("{i18n>")) {
								sTranslationTextKey = sPlaceholder.substring(6, sPlaceholder.length - 1);
							}
							//only if there is a translation key
							if (sTranslationTextKey) {
								//force translatable, even if it was not explicitly set already
								oItem.translatable = true;
							}
						}
						//check if before value still has tranlation key
						oItem._translatedPlaceholder = oItem._beforeValue;
						sTranslationTextKey = null;
						sPlaceholder = oItem._translatedPlaceholder;
						if (sPlaceholder) {
							//value with parameter syntax will not be translated
							if (this._isValueWithParameterSyntax(sPlaceholder)) {
								oItem.translatable = false;
							}
							//parameter translated value wins over designtime defaultValue
							if (this._isValueWithHandlebarsTranslation(sPlaceholder)) {
								sTranslationTextKey = sPlaceholder.substring(2, sPlaceholder.length - 2);
							} else if (sPlaceholder.startsWith("{i18n>")) {
								sTranslationTextKey = sPlaceholder.substring(6, sPlaceholder.length - 1);
							}
							//only if there is a translation key
							if (sTranslationTextKey) {
								oItem._translatedValue = this.getModel("i18n").getResourceBundle().getText(sTranslationTextKey);
								if (oItem._changed) {
									//item was changed, take the current value
									oItem.value = sCurrentLayerValue;
								} else {
									oItem.value = oItem._translatedValue;
								}
								if (oItem.valueTranslations && oItem.valueTranslations[sLanguage]) {
									oItem.value = oItem.valueTranslations[sLanguage];
								}
								if (this.getMode() === "translation") {
									//if we are in translation mode the default value differs and depends on the language
									//TODO this does not work in SWZ, the base path is not taken into account...
									//get the translated default value for the language we want to translate this.getLanguage()
									oItem._translatedValue = this._getCurrentLanguageSpecificText(sTranslationTextKey);
								}
							} else if (oItem.translatable  && this.getMode() === "translation") {
								//if no translation key which means item defined as string value directly.
								//set the _translatedValue with item manifest value or default value.
								oItem._translatedValue  = oItem._translatedPlaceholder;
								oItem.value = oItem._beforeValue;
							}
						}
						if (this.getMode() === "translation") {
							if (oItem.valueTranslations && oItem.valueTranslations[sLanguage]) {
								oItem._translatedValue = oItem.valueTranslations[sLanguage];
							}
							if (this._isValueWithHandlebarsTranslation(oItem.label)) {
								oItem._translatedLabel = this._getCurrentLanguageSpecificText(oItem.label.substring(2, oItem.label.length - 2), true);
							} else if (oItem.label && oItem.label.startsWith("{i18n>")) {
								//TODO this does not work in SWZ, the base path is not taken into account...
								//get the translated default value for the language we want to translate this.getLanguage()
								oItem._translatedLabel = this._getCurrentLanguageSpecificText(oItem.label.substring(6, oItem.label.length - 1), true);
							}
						}
					} else if (oItem.type === "string[]") {
						var sValueItemsPath = oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueItems";
						var oValueItems = this._manifestModel.getProperty(sValueItemsPath);
						if (oValueItems) {
							oItem.valueItems = oValueItems;
						}
						// get value tokens of MultiInput from manifest change for current item
						var sValueTokensPath = oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueTokens";
						var oValueTokens = this._manifestModel.getProperty(sValueTokensPath);
						if (oValueTokens) {
							oItem.valueTokens = oValueTokens;
						}
					}

					//translate label if it is {{KEY}}
					if (oItem.label && this._isValueWithHandlebarsTranslation(oItem.label)) {
						var sTranslationLabelKey = oItem.label.substring(2, oItem.label.length - 2);
						if (sTranslationLabelKey) {
							oItem.label = this.getModel("i18n").getResourceBundle().getText(sTranslationLabelKey);
						}
					}
				}
			}
		}

		for (var n in aItems) {
			var oItem = aItems[n];
			this._addItem(oItem);
		}
		//add additional content
		if (this.getMode() !== "translation") {
			Promise.resolve(this._initPreview()).then(function() {
				Promise.all(this._aFieldReadyPromise).then(function () {
					this._ready = true;
					this.fireReady();
				}.bind(this));
			}.bind(this));
		} else {
			Promise.all(this._aFieldReadyPromise).then(function () {
				this._ready = true;
				this.fireReady();
			}.bind(this));
		}
	};
	/**
	 * Destroy the editor and the internal instances that it created
	 */
	Editor.prototype.destroy = function () {
		if (this._oPopover) {
			this._oPopover.destroy();
		}
		if (this._oDesigntimeInstance) {
			this._oDesigntimeInstance.destroy();
		}
		var oPreview = this.getAggregation("_preview");
		if (oPreview && oPreview.destroy) {
			oPreview.destroy();
		}
		var oMessageStrip = Core.byId(MessageStripId);
		if (oMessageStrip) {
			oMessageStrip.destroy();
		}
		this._manifestModel = null;
		this._beforeManifestModel = null;
		this._oInitialManifestModel = null;
		this._settingsModel = null;
		Control.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Initializes the additional content
	 */
	Editor.prototype._initPreview = function () {
		return new Promise(function (resolve, reject) {
			resolve();
		});
	};

	/**
	 * Applies the defaults for the designtime settings
	 */
	Editor.prototype._applyDesigntimeDefaults = function (oSettings) {
		oSettings = oSettings || {};
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		var mItems = oSettings.form.items || oSettings.form.items;
		for (var n in mItems) {
			var oItem = mItems[n];
			if (oItem.manifestpath) {
				oItem.value = this._manifestModel.getProperty(oItem.manifestpath);
			}
			if (oItem.visible === undefined || oItem.visible === null) {
				oItem.visible = true;
			}
			if (oItem.editable === undefined || oItem.editable === null) {
				oItem.editable = true;
			}
			if (this.getMode() !== "admin") {
				if (oItem.visibleToUser !== undefined) {
					oItem.visible = oItem.visibleToUser;
				}
				if (oItem.editableToUser !== undefined) {
					oItem.editable = oItem.editableToUser;
				}
			}
			if (typeof oItem.translatable !== "boolean") {
				oItem.translatable = false;
			}
			if (!oItem.label) {
				oItem.label = n;
			}

			if (!oItem.type || oItem.type === "enum") {

				oItem.type = "string";
			}
			//only if the value is undefined from the this._manifestModel.getProperty(oItem.manifestpath)
			//false, "", 0... are valid values and should not apply the default
			if (oItem.value === undefined || oItem.value === null) {
				switch (oItem.type) {
					case "boolean": oItem.value = false; break;
					case "integer":
					case "number": oItem.value = 0; break;
					case "string[]": oItem.value = []; break;
					default: oItem.value = "";
				}
			}
			if (oItem.type === "group") {
				if (oItem.visible === undefined || oItem.value === null) {
					oItem.visible = true;
				}
			}
			oItem._settingspath = "/form/items/" + n;
		}
	};
	/**
	 * Applies previous layer designtime settings that were changed
	 */
	Editor.prototype._applyDesigntimeLayers = function (oSettings) {
		//pull current values
		if (this._appliedLayerManifestChanges && Array.isArray(this._appliedLayerManifestChanges)) {
			for (var i = 0; i < this._appliedLayerManifestChanges.length; i++) {
				var oChanges = this._appliedLayerManifestChanges[i][":designtime"];
				if (oChanges) {
					var aKeys = Object.keys(oChanges);
					for (var j = 0; j < aKeys.length; j++) {
						this._settingsModel.setProperty(aKeys[j], oChanges[aKeys[j]]);
					}
				}
			}
		}
		if (this._currentLayerManifestChanges) {
			var oChanges = this._currentLayerManifestChanges[":designtime"];
			if (oChanges) {
				var aKeys = Object.keys(oChanges);
				for (var j = 0; j < aKeys.length; j++) {
					//apply the values to a "_next/editable", "_next/visible" entry to the settings.
					//the current layer needs to be able to change those values
					var sPath = aKeys[j],
						sNext = sPath.substring(0, sPath.lastIndexOf("/") + 1) + "_next";
					if (!this._settingsModel.getProperty(sNext)) {
						//create a _next entry if it does not exist
						this._settingsModel.setProperty(sNext, {});
					}
					var sNext = sPath.substring(0, sPath.lastIndexOf("/") + 1) + "_next",
						sProp = sPath.substring(sPath.lastIndexOf("/") + 1);
					this._settingsModel.setProperty(sNext + "/" + sProp, oChanges[aKeys[j]]);
				}
			}
		}
	};
	/**
	 * Creates a designtime instance based on an configuration section within the manifest.
	 * This is valid if there is no explicit sap.card/designtime module in the manifest itself.
	 */
	Editor.prototype._createParameterDesigntime = function (oConfiguration) {
		var oSettings = {},
			sBasePath = this.getConfigurationPath() + "/parameters",
			sMode = this.getMode();
		if (oConfiguration && oConfiguration.parameters) {
			oSettings.form = oSettings.form || {};
			oSettings.form.items = oSettings.form.items || {};
			var oItems = oSettings.form.items;
			Object.keys(oConfiguration.parameters).forEach(function (n) {
				oItems[n] = merge({
					manifestpath: sBasePath + n + "/value",
					editable: (sMode !== "translation"),
					_settingspath: "/form/items/" + n
				}, oConfiguration.parameters[n]);
				var oItem = oItems[n];
				if (!oItem.type) {
					oItem.type = "string";
				}
				if (!oItem.hasOwnProperty("visible")) {
					oItem.visible = true;
				}
			});
		}
		return new Designtime(oSettings);
	};
	/**
	 * Adds additional settings for destinations section in admin mode
	 * @param {} oConfiguration
	 */
	Editor.prototype._addDestinationSettings = function (oConfiguration) {
		var oSettings = this._oDesigntimeInstance.getSettings(),
			sBasePath = this.getConfigurationPath() + "/destinations";
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		if (oSettings && oConfiguration && oConfiguration.destinations) {
			if (!oSettings.form.items["destination.group"]) {
				//destination section separated by a group header
				oSettings.form.items["destination.group"] = {
					label: this._oResourceBundle.getText("EDITOR_DESTINATIONS") || "Destinations",
					type: "group",
					visible: true
				};
			}
			var oItems = oSettings.form.items,
				oHost = this.getHostInstance();
			Object.keys(oConfiguration.destinations).forEach(function (n) {
				oItems[n + ".destinaton"] = merge({
					manifestpath: sBasePath + "/" + n + "/name", //destination points to name not value
					visible: true,
					type: "destination",
					editable: true,
					allowDynamicValues: false,
					allowSettings: false,
					value: oConfiguration.destinations[n].name,
					defaultValue: oConfiguration.destinations[n].defaultUrl,
					_settingspath: "/form/items/" + [n + ".destinaton"],
					_values: [],
					_destinationName: n
				}, oConfiguration.destinations[n]);
				if (typeof oItems[n + ".destinaton"].label === "undefined") {
					oItems[n + ".destinaton"].label = n;
				}
				if (oHost) {
					oItems[n + ".destinaton"]._loading = true;
				}
			});
			var getDestinationsDone = false;
			if (oHost) {
				this.getHostInstance().getDestinations().then(function (a) {
					getDestinationsDone = true;
					Object.keys(oConfiguration.destinations).forEach(function (n) {
						oItems[n + ".destinaton"]._values = a;
						oItems[n + ".destinaton"]._loading = false;
						this._settingsModel.checkUpdate(true);
					}.bind(this));
				}.bind(this)).catch(function () {
					//Fix DIGITALWORKPLACE-4359, retry once for the timeout issue
					return this.getHostInstance().getDestinations();
				}.bind(this)).then(function (b) {
					if (getDestinationsDone) {
						return;
					}
					Object.keys(oConfiguration.destinations).forEach(function (n) {
						oItems[n + ".destinaton"]._values = b;
						oItems[n + ".destinaton"]._loading = false;
						this._settingsModel.checkUpdate(true);
					}.bind(this));
				}.bind(this)).catch(function (e) {
					Object.keys(oConfiguration.destinations).forEach(function (n) {
						oItems[n + ".destinaton"]._loading = false;
						this._settingsModel.checkUpdate(true);
					}.bind(this));
					Log.error("Can not get destinations list from '" + oHost.getId() + "'.");
				}.bind(this));
			}
		}
	};

	/**
	 * Returns the default value that was given by the developer for the given path
	 * @param {string} sPath
	 */
	Editor.prototype._getManifestDefaultValue = function (sPath) {
		return this._oInitialManifestModel.getProperty(sPath);
	};
	Editor.prototype._getManifestBeforelValue = function (sPath) {
		return this._beforeManifestModel.getProperty(sPath);
	};
	/**
	 * Returns whether the value is translatable via the handlbars translation syntax {{KEY}}
	 * For other than string values false is returned
	 * @param {any} vValue
	 */
	Editor.prototype._isValueWithHandlebarsTranslation = function (vValue) {
		if (typeof vValue === "string") {
			return !!vValue.match(REGEXP_TRANSLATABLE);
		}
		return false;
	};

	Editor.prototype._isValueWithParameterSyntax = function (vValue) {
		if (typeof vValue === "string") {
			return !!vValue.match(REGEXP_PARAMETERS);
		}
		return false;
	};

	//create static context entries
	Editor._contextEntries =
	{
		empty: {
			label: oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_VAL"),
			type: "string",
			description: oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_DESC"),
			placeholder: "",
			value: ""
		},
		"editor.internal": {
			label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_INTERNAL_VAL"),
			todayIso: {
				type: "string",
				label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
				description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_DESC"),
				tags: [],
				placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
				customize: ["format.dataTime"],
				value: "{{parameters.TODAY_ISO}}"
			},
			nowIso: {
				type: "string",
				label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
				description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_DESC"),
				tags: [],
				placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
				customize: ["dateFormatters"],
				value: "{{parameters.NOW_ISO}}"
			},
			currentLanguage: {
				type: "string",
				label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
				description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
				tags: ["technical"],
				customize: ["languageFormatters"],
				placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
				value: "{{parameters.LOCALE}}"
			}
		}
	};
	//map of language strings in their actual language representation, initialized in Editor.init
	Editor._languages = {};

	//theming from parameters to css valiables if css variables are not turned on
	//find out if css vars are turned on
	Editor._appendThemeVars = function () {
		var aVars = [
			"sapUiButtonHoverBackground",
			"sapUiBaseBG",
			"sapUiContentLabelColor",
			"sapUiTileSeparatorColor",
			"sapUiHighlight",
			"sapUiListSelectionBackgroundColor",
			"sapUiNegativeText",
			"sapUiCriticalText",
			"sapUiPositiveText",
			"sapUiChartScrollbarBorderColor"
		];
		var mParams = Parameters.get({
			name: aVars,
			callback: function (_params) {
			   // this will only be called if params weren’t available synchronously
			}
		});
		if (mParams) {
			for (var n in mParams) {
				document.body.style.setProperty("--" + n, mParams[n]);
			}
		}
	};

	Editor.prototype.prepareFieldsInKey = function(oConfig) {
		//get field names in the item key
		this._sKeySeparator = oConfig.values.keySeparator;
		if (!this._sKeySeparator) {
			this._sKeySeparator = "#";
		}
		var sKey = oConfig.values.item.key;
		this._aFields = sKey.split(this._sKeySeparator);
		for (var n in this._aFields) {
			//remove the {} in the field
			if (this._aFields[n].startsWith("{")) {
				this._aFields[n] = this._aFields[n].substring(1);
			}
			if (this._aFields[n].endsWith("}")) {
				this._aFields[n] = this._aFields[n].substring(0, this._aFields[n].length - 1);
			}
		}
	};

	Editor.prototype.getKeyFromItem = function(oItem) {
		var sItemKey = "";
		this._aFields.forEach(function (field) {
			sItemKey += oItem[field].toString() + this._sKeySeparator;
		}.bind(this));
		if (sItemKey.endsWith(this._sKeySeparator)) {
			sItemKey = sItemKey.substring(0, sItemKey.length - this._sKeySeparator.length);
		}
		return sItemKey;
	};

	//initializes global settings
	Editor.init = function () {
		this.init = function () { }; //replace self

		//add theming variables if css vars are not turned on
		//if (!window.getComputedStyle(document.documentElement).getPropertyValue('--sapBackgroundColor')) {
		Editor._appendThemeVars();
		Core.attachThemeChanged(function () {
			Editor._appendThemeVars();
		});
		//}

		var sCssURL = sap.ui.require.toUrl("sap.ui.integration.editor.css.Editor".replace(/\./g, "/") + ".css");
		includeStylesheet(sCssURL);
		LoaderExtensions.loadResource("sap/ui/integration/editor/languages.json", {
			dataType: "json",
			failOnError: false,
			async: true
		}).then(function (o) {
			Editor._languages = o;
		});
	};

	Editor.init();

	return Editor;
});