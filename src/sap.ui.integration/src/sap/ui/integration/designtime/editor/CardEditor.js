/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/deepClone",
	"sap/base/util/merge",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Designtime",
	"sap/ui/dom/includeStylesheet",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/LoaderExtensions",
	"sap/ui/integration/util/CardMerger",
	"sap/m/Label",
	"sap/m/Title",
	"sap/ui/core/Icon",
	"sap/m/ResponsivePopover",
	"sap/m/Text"
], function (
	deepClone,
	merge,
	Core,
	Control,
	Card,
	Designtime,
	includeStylesheet,
	JSONModel,
	LoaderExtension,
	CardMerger,
	Label,
	Title,
	Icon,
	RPopover,
	Text
) {
	"use strict";

	/**
	 * Sets the zIndex of target 100 above source zIndex
	 * @param {Element} target
	 * @param {Element} source
	 */
	function setHigherZIndex(target, source) {
		if (target && target.nodeType !== 1) {
			return;
		}
		if (source && source.nodeType !== 1) {
			target.style.zIndex = 100;
			return;
		}
		var z = parseInt(window.getComputedStyle(source).getPropertyValue('z-index'));
		if (isNaN(z)) {
			if (source.parentNode && source.parentNode.nodeType === 1) {
				setHigherZIndex(target, source.parentNode);
			} else {
				target.style.zIndex = 100;
			}
		} else {
			target.style.zIndex = z + 100;
		}
	}

	var REGEXP_TRANSLATABLE = /\{\{(?!parameters.)(?!destinations.)([^\}\}]+)\}\}|\{i18n>([^\}]+)\}/g;



	/**
	 * Constructor for a new <code>Card Editor</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control allows to edit manifest settings for a card based on a configuration from a designtime module.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @see {@link topic:5b46b03f024542ba802d99d67bc1a3f4 Cards}
	 * @since 1.83
	 * @private
	 * @experimental since 1.83.0
	 * @alias sap.ui.integration.designtime.CardEditor
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CardEditor = Control.extend("sap.ui.integration.designtime.editor.CardEditor", /** @lends sap.ui.integration.designtime.editor.CardEditor.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			properties: {

				/**
				 * Set an id to an already existing card instance as string or provide the settings for a card as an object
				 * {
				 *    manifest:        manifest for the card as a json object
				 *    baseUrl:         base url for the card
				 *    ...
				 * }
				 * Depending on the scenario there is a card instance already available. In this case an id to this card instance
				 * should be provided, to avoid an additional card instance creation.
				 */
				card: {
					type: "any",
					defaultValue: null
				},
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
					defaultValue: "en_US"
				}
			},
			aggregations: {
				/**
				 * Defines the header of the card.
				 */
				_formContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					visibility: "hidden"
				},
				_preview: {
					type: "sap.ui.integration.designtime.editor.CardPreview",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				ready: {}
			}
		},
		renderer: function (oRm, oControl) {
			//surrounding div tag <div class="sapUiIntegrationCardEditor sapUiIntegrationCardEditor(Translation|Preview)"
			oRm.openStart("div");
			oControl.getMode() === "translation" ? oRm.addClass("sapUiIntegrationCardEditorTranslation") : oRm.addClass("sapUiIntegrationCardEditorPreview");
			oRm.addClass("sapUiIntegrationCardEditor");
			oRm.writeClasses();
			oRm.writeElementData(oControl);
			oRm.openEnd();

			if (oControl.isReady()) {
				//surrounding div tag for form <div class="sapUiIntegrationCardEditorForm"
				oRm.openStart("div");
				oRm.addClass("sapUiIntegrationCardEditorForm");
				oRm.writeClasses();
				oRm.openEnd();
				var aItems = oControl.getAggregation("_formContent");

				//render items
				if (aItems) {
					var oLabel,
						iCol = 0;
					for (var i = 0; i < aItems.length; i++) {
						var oItem = aItems[i];

						if (oItem.isA("sap.m.Label")) {
							oLabel = oItem; //store the label and render it together with the next field
							continue;
						}
						var oSpecial = oItem.getSpecialButton && oItem.getSpecialButton();
						oRm.openStart("div");
						oRm.addClass("sapUiIntegrationCardEditorItem");
						if (oSpecial) {
							oRm.addClass("special");
						}
						if (oControl.getMode() === "translation") {
							oRm.addClass("language");
						}
						//if multiple cols are used in the form, set class sapUiIntegrationCardEditorItemCol1 or sapUiIntegrationCardEditorItemCol2
						if (oItem._cols === 1) {
							oRm.addClass("sapUiIntegrationCardEditorItemCol" + (++iCol));
						} else {
							iCol = 0;
						}

						oRm.writeClasses();

						oRm.openEnd();
						if (oItem.isA("sap.m.Title")) {
							oRm.renderControl(oItem);
						} else {
							//render label and field
							if (oLabel) {
								var oDependent = oLabel.getDependents() && oLabel.getDependents()[0];
								oRm.openStart("div");
								oRm.addClass("sapUiIntegrationCardEditorItemLabel");
								if (oDependent && !oControl.getMode() === "translation") {
									oRm.addClass("description");
								}
								oRm.openEnd();
								oRm.renderControl(oLabel);
								if (oDependent) {
									oRm.renderControl(oDependent);
								}
								oRm.close("div");
							}
							oRm.renderControl(oItem);
							if (oSpecial) {
								oRm.renderControl(oItem.getSpecialButton());
							}
						}
						oRm.close("div");
						oLabel = null; //reset the label
						iCol = iCol == 2 ? 0 : iCol; //reset the cols if 2, we only support 2 cols currently
					}
				}
				oRm.close("div");

				//render the preview
				var oPreview = oControl.getAggregation("_preview");
				oPreview && oRm.renderControl(oPreview);
			}
			oRm.close("div");
		}
	});

	/**
	 * Init of the editor
	 */
	CardEditor.prototype.init = function () {
		this._ready = false;
		//load translations
		this._oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");
		this._appliedLayerManifestChanges = [];
		this._currentLayerManifestChanges = {};
	};

	/**
	 * Returns whether the editor is ready to be used
	 */
	CardEditor.prototype.isReady = function () {
		return this._ready;
	};

	/**
	 * Filters the manifestChanges array in the oManifestSettings
	 * All changes that are done for layers > than current layer are removed (see also CardMerger.layers)
	 * The current layers changes are stored in this._currentLayerManifestChanges to be applied later in the editor code.
	 * All changes that are done for layers < that the current layer are kept in oManifestSettings.manifestChanges
	 *
	 * @param {*} oManifestSettings
	 */
	CardEditor.prototype._filterManifestChangesByLayer = function (oManifestSettings) {
		var aChanges = [],
			oCurrentLayerChanges = { ":layer": CardMerger.layers[this.getMode()] },
			iCurrentModeIndex = CardMerger.layers[this.getMode()];
		oManifestSettings.manifestChanges.forEach(function (oChange) {
			//filter manifest changes. only the changes before the current layer are needed
			//card editor will merge the last layer locally to allow "reset" or properties
			//also for translation layer, the "original" value is needed
			var iLayer = oChange.hasOwnProperty(":layer") ? oChange[":layer"] : 1000;
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
	 * Sets the card property as a string, object {manifest:{}, baseUrl:{}} or a reference to a card instance
	 * @param {any} vCardIdOrSettings
	 * @param {boolean} bSuppressRerendering
	 */
	CardEditor.prototype.setCard = function (vCardIdOrSettings, bSuppressRerendering) {

		this._ready = false;
		if (vCardIdOrSettings === this.getProperty("card")) {
			return this;
		}
		if (this._oEditorCard) {
			this._oEditorCard.destroy();
		}
		if (this._oDesigntimeInstance) {
			this._oDesigntimeInstance.destroy();
		}
		this.setProperty("card", vCardIdOrSettings, bSuppressRerendering);

		//Waiting for additional settings on the card that are applied synchronously
		Promise.resolve().then(function () {
			this._initCard(vCardIdOrSettings);
		}.bind(this));
		return this;
	};

	CardEditor.prototype._getOriginalManifestJson = function () {
		try {
			return this._oEditorCard._oCardManifest._oManifest.getRawJson();
		} catch (ex) {
			return {};
		}
	};

	/**
	 * Initializes the editors card settings
	 * @param {} vCardIdOrSettings
	 */
	CardEditor.prototype._initCard = function (vCardIdOrSettings) {
		if (typeof vCardIdOrSettings === "string") {
			var val = vCardIdOrSettings;
			try {
				vCardIdOrSettings = JSON.parse(vCardIdOrSettings);
			} catch (ex) {
				vCardIdOrSettings = val;
			}
			//the id of an existing card
			vCardIdOrSettings = Core.byId(vCardIdOrSettings);
		}
		if (vCardIdOrSettings && vCardIdOrSettings.isA && vCardIdOrSettings.isA("sap.ui.integration.widgets.Card")) {
			//a card instance
			vCardIdOrSettings = {
				manifest: vCardIdOrSettings.getManifest(),
				manifestChanges: vCardIdOrSettings.getManifestChanges(),
				host: vCardIdOrSettings.getHost(),
				baseUrl: vCardIdOrSettings.getBaseUrl()
			};
		}
		if (typeof vCardIdOrSettings === "object") {
			var iCurrentModeIndex = CardMerger.layers[this.getMode()];

			if (vCardIdOrSettings.manifestChanges) {
				//remove the changes from the current layer
				this._filterManifestChangesByLayer(vCardIdOrSettings);
			}

			//create a new card settings for a new card
			this._oEditorCard = new Card(vCardIdOrSettings);

			this._oEditorCard.attachManifestReady(function () {
				if (!this._oEditorCard._isManifestReady) {
					//TODO: manifestReady is fired even if the manifest is not ready. Check why.
					return;
				}
				if (this._manifestModel) {
					//already created
					return;
				}

				this._appliedLayerManifestChanges = vCardIdOrSettings.manifestChanges;
				var oManifestData = this._oEditorCard.getManifestEntry("/");

				if (iCurrentModeIndex < CardMerger.layers["translation"] && this._currentLayerManifestChanges) {
					//merge if not translation
					oManifestData = CardMerger.mergeCardDelta(oManifestData, [this._currentLayerManifestChanges]);
				}
				//create a manifest model after the changes are merged
				this._manifestModel = new JSONModel(oManifestData);

				//create a manifest model for the original "raw" manifest that was initially loaded
				this._originalManifestModel = new JSONModel(this._getOriginalManifestJson());

				this._initInternal();

				//use the translations from the card
				if (!this._oEditorCard.getModel("i18n")) {
					this._oEditorCard._loadDefaultTranslations();
				}
				this.setModel(this._oEditorCard.getModel("i18n"), "i18n");

				//add a context model
				this._createContextModel();
			}.bind(this));
			//the internal card instance should be invisible initially
			this._oEditorCard.setVisible(false);
			this._oEditorCard.onBeforeRendering();
		}
	};

	/**
	 * Initializes the editor after the card is set
	 */
	CardEditor.prototype._initInternal = function () {
		//load the designtime control and bundles lazy
		var sDesigntime = this._oEditorCard.getManifestEntry("/sap.card/designtime"),
			oConfiguration = this._manifestModel.getProperty("/sap.card/configuration"),
			oPromise;
		if (sDesigntime) {
			//load designtime from module
			oPromise = this._oEditorCard.loadDesigntime().then(function (oDesigntime) {
				this._applyDesigntimeDefaults(oDesigntime.getSettings());
				return oDesigntime;
			}.bind(this));
		} else {
			//stay compatible and create designtime configuration based on parameters/destinations
			oPromise = Promise.resolve(this._createParameterDesigntime(oConfiguration));
		}
		oPromise.then(function (oDesigntime) {
			this._oDesigntimeInstance = oDesigntime;
			if (this.getMode() === "admin" || this.getMode() === "all") {
				//always add destination settings
				this._addDestinationSettings(oConfiguration, this._oDesigntimeInstance);
			}

			//create a settings model
			this._settingsModel = new JSONModel(this._oDesigntimeInstance.getSettings());
			this.setModel(this._settingsModel, "currentSettings");
			this._applyDesigntimeLayers(); //changes done from admin to content on the dt values
			this._requireFields().then(function () {
				this._startEditor();
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Returns the current settings as a json with a manifest path and the current value
	 * additionally there is a layer number added as ":layer"
	 */
	CardEditor.prototype.getCurrentSettings = function () {
		var oSettings = this._settingsModel.getProperty("/"),
			mResult = {};
		for (var n in oSettings.form.items) {
			var oItem = oSettings.form.items[n];
			if (oItem.editable && oItem.visible) {
				if ((this.getMode() === "translation" && oItem.translatable) || this.getMode() !== "translation") {
					if (oItem.translatable && !oItem._changed && oItem._translatedDefaultPlaceholder) {
						//do not save a value that was not changed and comes from a translated default value
						//mResult[oItem.manifestpath] = oItem._translatedDefaultPlaceholder;
						//if we would save it
						continue;
					} else {
						mResult[oItem.manifestpath] = oItem.value;
					}
				}
			}
		}
		mResult[":layer"] = CardMerger.layers[this.getMode()];
		mResult[":errors"] = this.checkCurrentSettings()[":errors"];
		return mResult;
	};

	/**
	 * Checks for invalid values in the current settings and reports the errors
	 * TODO: highlight issues and add states...
	 */
	CardEditor.prototype.checkCurrentSettings = function () {
		var oSettings = this._settingsModel.getProperty("/"),
			mChecks = {};
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
		mChecks[":layer"] = CardMerger.layers[this.getMode()];
		mChecks[":errors"] = Object.values(mChecks).indexOf(false) > -1;
		return mChecks;
	};

	/**
	 * Creates a model for the context object of the host environment
	 */
	CardEditor.prototype._createContextModel = function () {
		var oHost = this._oEditorCard.getHostInstance(),
			oContextModel = new JSONModel({});

		//add the model
		this.setModel(oContextModel, "context");

		//get the context from the host
		if (oHost) {
			oHost.getContext().then(function (oData) {
				oContextModel.setData(oData);
			});
		}

		//async update of the value via host call
		oContextModel.getProperty = function (sPath, oContext) {
			var sAbsolutePath = this.resolve(sPath, oContext);
			if (sAbsolutePath.endsWith("/value")) {
				this._mValues = this._mValues || {};
				if (this._mValues.hasOwnProperty(sAbsolutePath)) {
					return this._mValues[sAbsolutePath];
					//when should this be invalidated?
				}
				this._mValues[sAbsolutePath] = undefined;
				//ask the host
				oHost.getContextValue(sAbsolutePath.substring(1)).then(function (vValue) {
					this._mValues[sAbsolutePath] = vValue;
					this.checkUpdate();
				}.bind(this));
				return undefined;
			} else {
				//resolve dt data locally
				return JSONModel.prototype.getProperty.apply(this, arguments);
			}
		};
	};

	//map editors for a specific type
	CardEditor.fieldMap = {
		"string": "sap/ui/integration/designtime/editor/fields/StringField",
		"integer": "sap/ui/integration/designtime/editor/fields/IntegerField",
		"number": "sap/ui/integration/designtime/editor/fields/NumberField",
		"boolean": "sap/ui/integration/designtime/editor/fields/BooleanField",
		"date": "sap/ui/integration/designtime/editor/fields/DateField",
		"datetime": "sap/ui/integration/designtime/editor/fields/DateTimeField",
		"destination": "sap/ui/integration/designtime/editor/fields/DestinationField"
	};
	CardEditor.Fields = null;

	/**
	 * Loads all field modules registered in CardEditor.fieldMap and stores the classes in CardEditor.Fields
	 */
	CardEditor.prototype._requireFields = function () {
		if (CardEditor.Fields) {
			return Promise.resolve();
		}
		return new Promise(function (resolve) {
			sap.ui.require(Object.values(CardEditor.fieldMap), function () {
				CardEditor.Fields = {};
				for (var n in CardEditor.fieldMap) {
					CardEditor.Fields[n] = arguments[Object.keys(CardEditor.fieldMap).indexOf(n)];
				}
				resolve();
			});
		});
	};

	/**
	 * Creates a label based on the configuration settings
	 * @param {} oConfig
	 */
	CardEditor.prototype._createLabel = function (oConfig) {
		var oLabel = new Label({
			text: oConfig.label,
			//mark only fields that are required and editable,
			//otherwise this is confusing because user will not be able to correct it
			required: oConfig.required && oConfig.editable || false
		});
		oLabel._cols = oConfig.cols || 2; //by default 2 cols

		if (oConfig.description) {
			var oIcon = new Icon({
				src: "sap-icon://message-information",
				color: "Marker",
				size: "12px",
				useIconTooltip: false,
				visible: this.getMode() !== "translation"
			});
			oIcon.addStyleClass("sapUiIntegrationCardEditorDescriptionIcon");
			oLabel.addDependent(oIcon);
			oIcon.onmouseover = function () {
				this._getPopover().getContent()[0].setText(oConfig.description);
				this._getPopover().openBy(oIcon);
			}.bind(this);
			oIcon.onmouseout = function () {
				this._getPopover().close();
			}.bind(this);
		}
		return oLabel;
	};

	CardEditor.prototype._getPopover = function () {
		if (this._oPopover) {
			return this._oPopover;
		}

		var oText = new Text({
			text: "Description"
		});
		oText.addStyleClass("sapUiTinyMargin sapUiIntegrationCardEditorDescriptionText");

		this._oPopover = new RPopover({
			showHeader: false,
			content: [oText],
			afterOpen: function (oEvent) {
				//do this after open, because dom ref or popover is not available in before event.
				setHigherZIndex(oEvent.getSource().getDomRef(), oEvent.getParameter("openBy").getDomRef());
			}
		});
		this._oPopover.addStyleClass("sapUiIntegrationCardEditorPopover");

		return this._oPopover;
	};


	/**
	 * Creates a Field based on the configuration settings
	 * @param {*} oConfig
	 */
	CardEditor.prototype._createField = function (oConfig) {
		var oField = new CardEditor.Fields[oConfig.type]({
			configuration: oConfig,
			mode: this.getMode(),
			objectBindings: {
				currentSettings: {
					path: "currentSettings>" + oConfig._settingspath
				}
			}
		});
		//listen to changes on the settings
		var oBinding = this._settingsModel.bindProperty(oConfig._settingspath + "/value");
		oBinding.attachChange(function () {
			oConfig._changed = true;
		});

		this._addValueListModel(oConfig, oField);

		oField._cols = oConfig.cols || 2; //by default 2 cols
		return oField;
	};

	/**
	 * Creates a unnamed model if a values.data section exists in the configuration
	 * @param {object} oConfig
	 * @param {BaseField} oField
	 */
	CardEditor.prototype._addValueListModel = function (oConfig, oField) {
		if (oConfig.values && oConfig.values.data) {
			var oValueModel = new JSONModel({});
			var oPromise = this._oEditorCard._oDataProviderFactory.create(oConfig.values.data).getData();
			oPromise.then(function (oJson) {
				oConfig._values = oJson;
				oValueModel.setData(oConfig._values);
				oValueModel.checkUpdate();
			});
			//in the designtime the item bindings will not use a named model, therefore we add a unnamed model for the field
			//to carry the values, also we use the binding context to connect the given path from oConfig.values.data.path
			//with that the result of the data request can be have also other structures.
			oField.setModel(oValueModel, undefined);
			oField.bindObject({
				path: oConfig.values.data.path || "/"
			});
		}
	};

	/**
	 * Adds an item to the _formContent aggregation based on the config settings
	 * @param {} oConfig
	 */
	CardEditor.prototype._addItem = function (oConfig) {

		var sMode = this.getMode();
		//if the item is not visible or translation mode, continue immediately
		if (!oConfig.visible || (!oConfig.translatable && sMode === "translation")) {
			return;
		}

		if (oConfig.type === "group") {
			this.addAggregation("_formContent", new Title({
				text: oConfig.label
			}));
			return;
		}

		if (sMode === "translation") {
			//adding an internal _language object to save the original value for the UI
			var language = this.getLanguage();
			oConfig._language = {
				value: oConfig.value
			};
			oConfig.value = "";

			//even if a item is not visible or not editable by another layer for translations it should always be editable and visible
			oConfig.editable = oConfig.visible = oConfig.translatable;


			//if there are changes for the current layer, read the already translated value from there
			//now merge these changes for translation into the item configs
			if (this._currentLayerManifestChanges) {
				oConfig.value = this._currentLayerManifestChanges[oConfig.manifestpath] || "";
			}
			//force a 2 column layout in the form
			oConfig.cols = 1;

			//create a configuration clone. map the _settingspath setting to _language, and set it to not editable
			var origLangField = deepClone(oConfig, 10);
			origLangField._settingspath += "/_language";
			origLangField.editable = false;
			origLangField.label += " - Original";
			origLangField.required = false;

			this.addAggregation("_formContent",
				this._createLabel(origLangField)
			);

			this.addAggregation("_formContent",
				this._createField(origLangField)
			);
			//change the label for the translation field
			oConfig.label += " - " + CardEditor._languages[language] || "unknown";
			oConfig.required = false; //translation is never required
			//now continue with the default...
		}

		//default for all modes
		this.addAggregation("_formContent",
			this._createLabel(oConfig)
		);

		this.addAggregation("_formContent",
			this._createField(oConfig)
		);
	};

	/**
	 * Starts the editor, creates the fields and preview
	 */
	CardEditor.prototype._startEditor = function () {
		this.destroyAggregation("_formContent");
		var oSettings = this._oDesigntimeInstance.getSettings();
		if (oSettings.form && oSettings.form.items) {
			for (var n in oSettings.form.items) {
				var oItem = oSettings.form.items[n];
				if (oItem) {
					//force a label setting, set it to the name of the item
					oItem.label = oItem.label || n;
					//check if the provided value from the parameter is a translated value
					//restrict this to string types for now
					if (oItem.type === "string") {
						var sDefaultValue = this._getManifestDefaultValue(oItem.manifestpath);
						if (this._isValueWithHandlebarsTranslation(sDefaultValue)) {
							oItem.translatable = true;
							oItem._translatedDefaultPlaceholder = sDefaultValue;
						}
					}
					oItem._changed = false;
					this._addItem(oItem);
				}
			}
		}
		//add preview
		if (this.getMode() !== "translation") {
			this._initPreview();
		}

		this._ready = true;
		this.fireReady();
	};

	/**
	 * Destroy the editor and the internal card instance that it created
	 */
	CardEditor.prototype.destroy = function () {
		if (this._oEditorCard) {
			this._oEditorCard.destroy();
		}
		if (this._oPopover) {
			this._oPopover.destroy();
		}
		if (this._oDesigntimeInstance) {
			this._oDesigntimeInstance.destroy();
		}
		this._manifestModel = null;
		this._originalManifestModel = null;
		this._settingsModel = null;

		Control.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Initializes the preview
	 */
	CardEditor.prototype._initPreview = function () {
		sap.ui.require(["sap/ui/integration/designtime/editor/CardPreview"], function (Preview) {
			var oPreview = new Preview({
				settings: this._oDesigntimeInstance.getSettings(),
				card: this._oEditorCard
			});
			this.setAggregation("_preview", oPreview);
		}.bind(this));
	};

	/**
	 * updates the preview
	 * TODO: Track changes and call update of the preview
	 */
	CardEditor.prototype._updatePreview = function () {
		var oPreview = this.getAggregation("_preview");
		if (oPreview) {
			oPreview.update();
		}
	};
	/**
	 * Applies the defaults for the designtime settings
	 */
	CardEditor.prototype._applyDesigntimeDefaults = function (oSettings) {
		oSettings = oSettings || {};
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		oSettings.preview = oSettings.preview || {
			modes: "Abstract"
		};
		var mItems = oSettings.form.items || oSettings.form.items;
		for (var n in mItems) {
			var oItem = mItems[n];
			if (oItem.manifestpath) {
				oItem.value = this._manifestModel.getProperty(oItem.manifestpath);
				if (typeof oItem.visible !== "boolean") {
					oItem.visible = true;
				}
				if (typeof oItem.translatable !== "boolean") {
					oItem.translatable = false;
				}
				if (typeof oItem.editable !== "boolean") {
					oItem.editable = true;
				}
				if (!oItem.label) {
					oItem.label = n;
				}
				if (!oItem.type) {
					oItem.type = "string";
				}
				if (!oItem.value) {
					switch (oItem.type) {
						case "boolean": oItem.value = false; break;
						case "integer":
						case "number": oItem.value = 0; break;
						default: oItem.value = "";
					}
				}
			} else if (oItem.type === "group") {
				if (typeof oItem.visible !== "boolean") {
					oItem.visible = true;
				}
			}
			oItem._settingspath = "/form/items/" + n;
			oItem.editable = oItem.editable !== false;
		}
	};

	/**
	 * Applies previous layer designtime settings that were changed
	 */
	CardEditor.prototype._applyDesigntimeLayers = function (oSettings) {
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
	};

	/**
	 * Creates a designtime instance based on an configuration section within the manifest.
	 * This is valid if there is no explicit sap.card/designtime module in the manifest itself.
	 */
	CardEditor.prototype._createParameterDesigntime = function (oConfiguration) {
		var oSettings = {},
			sBasePath = "/sap.card/configuration/parameters/",
			sMode = this.getMode();
		if (oConfiguration && oConfiguration.parameters) {
			oSettings.form = oSettings.form || {};
			oSettings.form.items = oSettings.form.items || {};
			var oItems = oSettings.form.items;
			Object.keys(oConfiguration.parameters).forEach(function (n) {
				oItems[n] = merge({
					manifestpath: sBasePath + n + "/value",
					visible: true,
					editable: (sMode !== "translation"),
					_settingspath: "/form/items/" + n
				}, oConfiguration.parameters[n]);
				var oItem = oItems[n];
				if (!oItem.type) {
					oItem.type === "string";
				}
			});
		}
		return new Designtime(oSettings);
	};

	/**
	 * Adds additional settings for destinations section in admin mode
	 * @param {} oConfiguration
	 */
	CardEditor.prototype._addDestinationSettings = function (oConfiguration) {
		var oSettings = this._oDesigntimeInstance.getSettings(),
			sBasePath = "/sap.card/configuration/destinations/";
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		if (oSettings && oConfiguration && oConfiguration.destinations) {
			if (!oSettings.form.items["destination.group"]) {
				//destination section separated by a group header
				oSettings.form.items["destination.group"] = {
					label: this._oResourceBundle.getText("CARDEDITOR_DESTINATIONS") || "Destinations",
					type: "group",
					visible: true
				};
			}
			var oItems = oSettings.form.items;
			Object.keys(oConfiguration.destinations).forEach(function (n) {
				var _values = [{}], //empty entry
					oHost = this._oEditorCard.getHostInstance();
				oItems[n] = merge({
					manifestpath: sBasePath + n + "/name", //destination points to name not value
					visible: true,
					type: "destination",
					editable: true,
					value: oConfiguration.destinations[n].name,
					defaultValue: oConfiguration.destinations[n].defaultUrl,
					_settingspath: "/form/items/" + n,
					_values: _values
				}, oConfiguration.destinations[n]);
				if (oHost) {
					this._oEditorCard.getHostInstance().getDestinations().then(function (n, a) {
						oItems[n]._values = _values.concat(a);
					}.bind(this, n)); //pass in n as first parameter
				}
			}.bind(this));
		}
	};

	/**
	 * Returns the default value that was given by the developer for the given path
	 * @param {string} sPath
	 */
	CardEditor.prototype._getManifestDefaultValue = function (sPath) {
		return this._originalManifestModel.getProperty(sPath);
	};

	/**
	 * Returns whether the value is translatable via the handlbars translation syntax {{KEY}}
	 * For other than string values false is returned
	 * @param {any} vValue
	 */
	CardEditor.prototype._isValueWithHandlebarsTranslation = function (vValue) {
		if (typeof vValue === "string") {
			return !!vValue.match(REGEXP_TRANSLATABLE);
		}
		return false;
	};

	//map of language strings in their actual language representation, initialized in CardEditor.init
	CardEditor._languages = {};

	//map of predefined parameters in the card, initialized in CardEditor.init
	CardEditor._predefinedParameters = {};

	//initializes global settings
	CardEditor.init = function () {

		this.init = function () { }; //replace self

		//TODO: This should be replaced with a themable .less file
		var sCssURL = sap.ui.require.toUrl("sap.ui.integration.designtime.editor.css.CardEditor".replace(/\./g, "/") + ".css");
		includeStylesheet(sCssURL);
		LoaderExtension.loadResource("sap/ui/integration/designtime/editor/languages.json", {
			dataType: "json",
			failOnError: false,
			async: true
		}).then(function (o) {
			CardEditor._languages = o;
		});
		LoaderExtension.loadResource("sap/ui/integration/designtime/editor/predefinedParameters.json", {
			dataType: "json",
			failOnError: false,
			async: true
		}).then(function (o) {
			CardEditor._predefinedParameters = o;
		});
	};
	CardEditor.init();

	return CardEditor;
});
