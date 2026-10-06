/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/editor/Constants",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/editor/Merger",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/merge",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/integration/library",
	"sap/ui/integration/designtime/editor/CardPreview",
	"sap/base/util/extend",
	"sap/base/Log",
	"sap/ui/integration/editor/EditorContext"
], function(
	Element,
	Editor,
	Constants,
	Card,
	Merger,
	JSONModel,
	merge,
	ResourceModel,
	library,
	CardPreview,
	extend,
	Log,
	EditorContext
) {
	"use strict";

	var CardDataMode = library.CardDataMode,
		CONTEXT_ENTRIES;
	/**
	 * Constructor for a new <code>Card Editor</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control allows to edit manifest settings for a card based on a configuration from a designtime module.
	 *
	 * @extends sap.ui.integration.editor.Editor
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @see {@link topic:5b46b03f024542ba802d99d67bc1a3f4 Cards}
	 * @since 1.83
	 * @private
	 * @alias sap.ui.integration.designtime.editor.CardEditor
	 */
	var CardEditor = Editor.extend("sap.ui.integration.designtime.editor.CardEditor", /** @lends sap.ui.integration.designtime.editor.CardEditor.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * Set an id to an already existing card instance as string or provide the settings for a card as an object
				 * <pre>
				 * {
				 *    manifest:        manifest for the card as a json object
				 *    baseUrl:         base url for the card
				 *    ...
				 * }
				 * </pre>
				 * Depending on the scenario there is a card instance already available. In this case an id to this card instance
				 * should be provided, to avoid an additional card instance creation.
				 */
				card: {
					type: "any",
					defaultValue: null
				}
			},
			aggregations: {
				_extension: {
					type: "sap.ui.integration.Extension",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: Editor.getMetadata().getRenderer()
	});

	CardEditor.prototype.hasPreview = function() {
		var oCardPreview = this.getAggregation("_preview");
		if (oCardPreview) {
			if (oCardPreview.getSettings() && oCardPreview.getSettings().preview && oCardPreview.getSettings().preview.modes === "None") {
				return false;
			}
			return true;
		}
		return false;
	};

	CardEditor.prototype.getSeparatePreview = function() {
		var sPreviewPosition = this.getPreviewPosition();
		if (!this.isFieldReady() || sPreviewPosition !== "separate") {
			return null;
		}
		return this._initPreview();
	};

	/**
	 * updates the card preview
	 */
	 CardEditor.prototype._updatePreview = function () {
		var oCardPreview = this.getAggregation("_preview");
		if (oCardPreview && oCardPreview.update && oCardPreview._getCurrentMode() !== "None") {
			oCardPreview.update();
		}
	};

	/**
	 * Switch to another editor based on the manifest and item object
	 *
	 * @param {*} oManifest the manifest of the editor to switch to
	 * @param {*} oItemObject the binding object of the pressed tree item
	 * @param {string} sPath the path of the pressed tree item
	 */
	CardEditor.prototype.switchToEditor = function(oManifest, oItemObject, sPath) {
		// save the current card instance, to avoid creating new instance when switching between child cards
		this._oChildTreeSettings = this._oChildTreeSettings || {};
		if (!this._oChildTreeSettings[this._oChildTree._path]) {
			this._oChildTreeSettings[this._oChildTree._path] = this._oEditorCard;
		}

		// if current card is not a child card, keep it as the main card for child cards
		var bDestoryCurrentCard = !!this.isChild;
		if (!bDestoryCurrentCard) {
			this._mainCard = this._oEditorCard;
		}

		// switch to pressed item, get settings
		this.isChild = oItemObject.isChild;
		var oManifestChanges;
		if (!this.isChild) {
			oManifestChanges = this._aMainEditorChanges;
		} else {
			oManifestChanges = this._oChildEditorChanges[sPath] || [];
		}
		if (this._oChildTreeSettings[sPath]) {
			this._vIdOrSettings = this._oChildTreeSettings[sPath];
			this._vIdOrSettings.setManifestChanges(oManifestChanges);
		} else {
			this._vIdOrSettings.baseUrl = oItemObject.baseUrl;
			this._vIdOrSettings.manifest = oManifest;
			this._vIdOrSettings.manifestChanges = oManifestChanges;
		}

		// switch to the pressed item card
		this.setCard(this._vIdOrSettings, true, bDestoryCurrentCard); //suppress rerendering as the editor will be rerendered anyway
	};

	/**
	 * Sets the card property as a string, object {manifest:{}, baseUrl:{}} or a reference to a card instance
	 * @param {any} vCardIdOrSettings
	 * @param {boolean} bSuppressRerendering
	 * @param {boolean} bDestoryCurrentCard
	 */
	CardEditor.prototype.setCard = function (vCardIdOrSettings, bSuppressRerendering, bDestoryCurrentCard) {
		if (vCardIdOrSettings === this.getProperty("card")) {
			return this;
		}
		if (this._oEditorCard && bDestoryCurrentCard !== false) {
			this._oEditorCard.destroy();
		}
		this.setProperty("card", vCardIdOrSettings, bSuppressRerendering);
		if (typeof vCardIdOrSettings === "string") {
			try {
				vCardIdOrSettings = JSON.parse(vCardIdOrSettings);
			} catch (ex) {
				//not json
				//could be a card instance id
				var instance = Element.getElementById(vCardIdOrSettings);
				if (!instance) { //not a card instance, but a string
					//could be a card dom element id
					var element = document.getElementById(vCardIdOrSettings);
					if (element && element.tagName && element.tagName.toUpperCase() === "ui-integration-card".toUpperCase()) {
						instance = element._getControl();
					}
				}
				vCardIdOrSettings = instance;
			}
		}
		if (vCardIdOrSettings && vCardIdOrSettings.isA && vCardIdOrSettings.isA("sap.ui.integration.widgets.Card")) {
			//a card instance
			vCardIdOrSettings = {
				manifest: vCardIdOrSettings.getManifest(),
				manifestChanges: vCardIdOrSettings.getManifestChanges(),
				host: vCardIdOrSettings.getHost(),
				baseUrl: vCardIdOrSettings.getBaseUrl(),
				dataMode: CardDataMode.Active
			};
		}
		if (typeof vCardIdOrSettings === "object") {
			if (!vCardIdOrSettings.dataMode) {
				vCardIdOrSettings.dataMode = CardDataMode.Active;
			}
			// remove useless property
			delete vCardIdOrSettings.destoryManifest;
			this._oEditorCard = new Card(vCardIdOrSettings);
			this._oEditorCard.attachEventOnce("_contentReady", function () {
				var oCardContent = this._oEditorCard.getCardContent();
				if (oCardContent) {
					oCardContent.onBeforeRendering();
				}
			}.bind(this));
			this._oEditorCard.attachEventOnce("_dataReady", function () {
				// copy models from Card to editor
				this.propagateModels(this._oEditorCard, this, ["i18n", "context", "contextflat"]);
				vCardIdOrSettings.destoryManifest = bDestoryCurrentCard;
				this.setJson(vCardIdOrSettings, bSuppressRerendering);
			}.bind(this));
			this._oEditorCard.onBeforeRendering();
			// set the main card as opener reference to the child card for destinations
			if (this.isChild) {
				this._oEditorCard.setAssociation("openerReference", this._mainCard);
			}
		}
	};

	CardEditor.prototype.initDestinations = function (vHost) {
		this._oDestinationsModel = new JSONModel({});
		this.setModel(this._oDestinationsModel, "destinations");
		var oHostInstance = this.getHostInstance();

		if (vHost && !oHostInstance) {
			Log.error(
				"sap.ui.integration.designtime.editor.CardEditor: Host with id '" + vHost + "' is not available during card editor initialization. It must be available for host specific features to work.",
				"Make sure that the host already exists, before assigning it to the card editor.",
				"sap.ui.integration.designtime.editor.CardEditor"
			);
		}

		this._oDestinations = this._oEditorCard._oDestinations;
	};

	/**
	 * Copy the models from one managed object into another.
	 *
	 * @param {sap.ui.base.ManagedObject} oSource Copy from this managed object.
	 * @param {sap.ui.base.ManagedObject} oTarget The object which will receive the models.
	 * @param {array} aSkipModels The array includes the model names which will be skipped during the copy
	 */
	CardEditor.prototype.propagateModels = function (oSource, oTarget, aSkipModels) {
		var oSourceModels = extend({}, oSource.oPropagatedProperties.oModels, oSource.oModels),
			aModelsNames = Object.keys(oSourceModels),
			oDefaultModel = oSource.getModel();

		if (oDefaultModel) {
			oTarget.setModel(oDefaultModel);
		}

		aSkipModels = aSkipModels || [];

		aModelsNames.forEach(function (sModelName) {
			if (sModelName === "undefined") {
				// "undefined" is used for the propagated default model, we have already copied it
				return;
			}

			if (aSkipModels.includes(sModelName)) {
				// model should not be copied if its name included the array aSkipModels
				return;
			}

			var oModel = oSource.getModel(sModelName);

			if (oModel) {
				oTarget.setModel(oModel, sModelName);
			}
		});
	};

	CardEditor.prototype.createManifest = async function (vIdOrSettings, bSuppress) {
		this._isManifestReady = false;
		if (vIdOrSettings.destoryManifest !== false && this._oManifest) {
			this._oManifest.destroy();
		}
		this.destroyAggregation("_extension");
		var iCurrentModeIndex = Merger.layers[this.getMode()];

		this._oManifest = this._oEditorCard._oCardManifest;
		this._registerManifestModulePath();
		// since Manifest.js will translate i18n values in the manifest.json which we don't want to,
		// so we need to get inital manifest json, merge it with before layer changes by ourself to keep the i18n key
		var oInitialJson = this._oManifest._oInitialJson;
		this._oInitialManifestModel = new JSONModel(oInitialJson);
		this.setProperty("json", oInitialJson, bSuppress);
		var oManifestJson;
		if (this._oBeforeLayerChange) {
			oManifestJson = Merger.mergeDelta(oInitialJson, [this._oBeforeLayerChange]);
		} else {
			oManifestJson = oInitialJson;
		}
		var oBeforeLayerManifestJson = merge({}, oManifestJson);
		this._oBeforeLayerManifestModel = new JSONModel(oBeforeLayerManifestJson);
		if (iCurrentModeIndex < Merger.layers["translation"] && this._oCurrentLayerChange) {
			//merge if not translation
			oManifestJson = Merger.mergeDelta(oManifestJson, [this._oCurrentLayerChange]);
		}
		//create a manifest model after the changes are merged
		this._oManifestModel = new JSONModel(oManifestJson);
		this._isManifestReady = true;
		this.fireManifestReady();
		this._initResourceBundlesForMultiTranslation();
		if (this.getMode() === Constants.EDITOR_MODE.TRANSLATION) {
			await this._loadSpecialTranslations();
		}
		//add a context model
		EditorContext.createContextModel(this, CONTEXT_ENTRIES, "card.internal");
		if (this._oManifest && this._oManifest.getResourceBundle()) {
			var oResourceBundle = this._oManifest.getResourceBundle();
			var oResourceModel = new ResourceModel({
				bundle: oResourceBundle
			});
			// wait for the promise returned by #getResourceBundle to resolve before accessing model data
			await oResourceModel.getResourceBundle();
			this.setModel(oResourceModel, "i18n");
			if (this._oResourceBundle) {
				await oResourceModel.enhance(this._oResourceBundle);
			}
			// wait for the promise returned by #getResourceBundle to resolve before accessing model data
			this._oResourceBundle = await oResourceModel.getResourceBundle();
		}

		return this._loadExtension().then(function() {
			this._initInternal();
		}.bind(this));
	};

	/**
	 * Initializes the preview content
	 */
	CardEditor.prototype._initPreview = function () {
		var oSettings = this._oDesigntimeInstance.getSettings() || {};
		oSettings.preview = oSettings.preview || {};
		oSettings.preview.position = this.getPreviewPosition();
		var oCardPreview = new CardPreview({
			settings: oSettings,
			card: this._oEditorCard,
			parentWidth: this._oChildTree && this._editorWidth ? this._editorWidth : this.getWidth(),
			parentHeight: this.getHeight()
		});
		// set preview size type if has child cards
		if (this._oChildTree && this._previewSize) {
			oCardPreview._currentSize = this._previewSize;
		}
		this.setAggregation("_preview", oCardPreview);
		oCardPreview.setAssociation("_editor", this);
		return oCardPreview;
	};

	/**
	 * Destory the preview content
	 */
	CardEditor.prototype._destoryPreview = function () {
		var oPreview = this.getAggregation("_preview");
		if (oPreview) {
			// save the editor width and preview size type for the next card editor
			this._editorWidth = oPreview.getParentWidth();
			this._previewSize = oPreview._currentSize;
			// do not remove css properties here, as they will be used for the next card editor
			oPreview.destroy(false);
			this.setAggregation("_preview", null);
		}
	};

	CardEditor.prototype._loadExtension = function () {
		return new Promise(function (resolve, reject) {
			var oExtension = this._oEditorCard.getAggregation("_extension");
			this.setAggregation("_extension", oExtension); // the framework validates that the subclass extends "sap.ui.integration.Extension"
			resolve();
		}.bind(this));
	};

	// TODO: Check if this can reuse EditorContext.initContextEntries
	//init context entries
	CardEditor.initContextEntries = function() {
		return {
			empty: {
				label: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_EMPTY_VAL"),
				type: "string",
				description: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_EMPTY_DESC"),
				placeholder: "",
				value: ""
			},
			"card.internal": {
				label: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_INTERNAL_VAL"),
				todayIso: {
					type: "string",
					label: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_TODAY_VAL"),
					description: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_TODAY_DESC"),
					tags: [],
					placeholder: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_TODAY_VAL"),
					customize: ["format.dataTime"],
					value: "{{parameters.TODAY_ISO}}"
				},
				nowIso: {
					type: "string",
					label: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_NOW_VAL"),
					description: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_NOW_DESC"),
					tags: [],
					placeholder: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_NOW_VAL"),
					customize: ["dateFormatters"],
					value: "{{parameters.NOW_ISO}}"
				},
				currentLanguage: {
					type: "string",
					label: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_LANG_VAL"),
					description: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_LANG_VAL"),
					tags: ["technical"],
					customize: ["languageFormatters"],
					placeholder: Editor.oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_LANG_VAL"),
					value: "{{parameters.LOCALE}}"
				}
			}
		};
	};

	//create static context entries
	CONTEXT_ENTRIES = CardEditor.initContextEntries();

	//change static members if language changed
	CardEditor.prototype._applyLanguageChange = function () {
		CONTEXT_ENTRIES = CardEditor.initContextEntries();
	};

	return CardEditor;
});