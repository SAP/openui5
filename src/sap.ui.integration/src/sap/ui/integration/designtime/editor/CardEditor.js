/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/editor/Editor",
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/editor/Merger",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/merge",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/integration/library",
	"sap/ui/integration/designtime/editor/CardPreview",
	"sap/ui/core/Lib",
	"sap/ui/core/Element"
], function(
	Editor,
	Core,
	Card,
	Merger,
	JSONModel,
	merge,
	ResourceModel,
	library,
	CardPreview,
	Lib,
	Element
) {
	"use strict";

	var oResourceBundle = Lib.getResourceBundleFor("sap.ui.integration");

	var CardDataMode = library.CardDataMode;
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
	 * @experimental since 1.83.0
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
		renderer: Editor.getMetadata().getRenderer().render
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
		if (!this.isReady() || sPreviewPosition !== "separate") {
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
	 * Sets the card property as a string, object {manifest:{}, baseUrl:{}} or a reference to a card instance
	 * @param {any} vCardIdOrSettings
	 * @param {boolean} bSuppressRerendering
	 */
	CardEditor.prototype.setCard = function (vCardIdOrSettings, bSuppressRerendering) {
		if (vCardIdOrSettings === this.getProperty("card")) {
			return this;
		}
		if (this._oEditorCard) {
			this._oEditorCard.destroy();
		}
		this.setProperty("card", vCardIdOrSettings, bSuppressRerendering);
		if (typeof vCardIdOrSettings === "string") {
			try {
				vCardIdOrSettings = JSON.parse(vCardIdOrSettings);
			} catch (ex) {
				//not json
				//could be a card instance id
				var instance = Element.registry.get(vCardIdOrSettings);
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
			this._oEditorCard = new Card(vCardIdOrSettings);
			this._oEditorCard.onBeforeRendering();
			this._oEditorCard.attachEventOnce("_dataReady", function () {
				this.setJson(vCardIdOrSettings, bSuppressRerendering);
			}.bind(this));
		}
	};

	CardEditor.prototype.createManifest = function (vIdOrSettings, bSuppress) {
		this._isManifestReady = false;
		if (this._oEditorManifest) {
			this._oEditorManifest.destroy();
		}
		this.destroyAggregation("_extension");
		var iCurrentModeIndex = Merger.layers[this.getMode()];

		this._oEditorManifest = this._oEditorCard._oCardManifest;
		this._registerManifestModulePath();
		// since Manifest.js will translate i18n values in the manifest.json which we don't want to,
		// so we need to get inital manifest json, merge it with before layer changes by ourself to keep the i18n key
		var oInitialJson = this._oEditorManifest._oInitialJson;
		this._oInitialManifestModel = new JSONModel(oInitialJson);
		this.setProperty("json", oInitialJson, bSuppress);
		var oManifestJson;
		if (this._beforeLayerManifestChanges) {
			oManifestJson = Merger.mergeDelta(oInitialJson, [this._beforeLayerManifestChanges]);
		} else {
			oManifestJson = oInitialJson;
		}
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
		this._initResourceBundlesForMultiTranslation();
		//add a context model
		this._createContextModel();
		if (this._oEditorManifest && this._oEditorManifest.getResourceBundle()) {
			var oResourceBundle = this._oEditorManifest.getResourceBundle();
			var oResourceModel = new ResourceModel({
				bundle: oResourceBundle
			});
			this.setModel(oResourceModel, "i18n");
			if (this._oResourceBundle) {
				oResourceModel.enhance(this._oResourceBundle);
			}
			this._oResourceBundle = oResourceModel.getResourceBundle();
		}

		return this._loadExtension().then(function() {
			this._initInternal();
		}.bind(this));
	};

	/**
	 * Initializes the additional content
	 */
	CardEditor.prototype._initPreview = function () {
		var oSettings = this._oDesigntimeInstance.getSettings() || {};
		oSettings.preview = oSettings.preview || {};
		oSettings.preview.position = this.getPreviewPosition();
		var oCardPreview = new CardPreview({
			settings: oSettings,
			card: this._oEditorCard,
			parentWidth: this.getWidth(),
			parentHeight: this.getHeight()
		});
		this.setAggregation("_preview", oCardPreview);
		oCardPreview.setAssociation("_editor", this);
		return oCardPreview;
	};

	CardEditor.prototype._loadExtension = function () {
		return new Promise(function (resolve, reject) {
			var oExtension = this._oEditorCard.getAggregation("_extension");
			this.setAggregation("_extension", oExtension); // the framework validates that the subclass extends "sap.ui.integration.Extension"
			resolve();
		}.bind(this));
	};

	CardEditor.prototype._mergeContextData = function (oContextData) {
		var oData = {};
		//empty entry
		oData["empty"] = CardEditor._contextEntries.empty;
		//custom entries
		for (var n in oContextData) {
			oData[n] = oContextData[n];
		}
		//editor internal
		oData["card.internal"] = CardEditor._contextEntries["card.internal"];
		return oData;
	};

	//create static context entries
	CardEditor._contextEntries =
	{
		empty: {
			label: oResourceBundle.getText("CARDEDITOR_CONTEXT_EMPTY_VAL"),
			type: "string",
			description: oResourceBundle.getText("CARDEDITOR_CONTEXT_EMPTY_DESC"),
			placeholder: "",
			value: ""
		},
		"card.internal": {
			label: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_INTERNAL_VAL"),
			todayIso: {
				type: "string",
				label: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_TODAY_VAL"),
				description: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_TODAY_DESC"),
				tags: [],
				placeholder: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_TODAY_VAL"),
				customize: ["format.dataTime"],
				value: "{{parameters.TODAY_ISO}}"
			},
			nowIso: {
				type: "string",
				label: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_NOW_VAL"),
				description: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_NOW_DESC"),
				tags: [],
				placeholder: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_NOW_VAL"),
				customize: ["dateFormatters"],
				value: "{{parameters.NOW_ISO}}"
			},
			currentLanguage: {
				type: "string",
				label: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_LANG_VAL"),
				description: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_LANG_VAL"),
				tags: ["technical"],
				customize: ["languageFormatters"],
				placeholder: oResourceBundle.getText("CARDEDITOR_CONTEXT_CARD_LANG_VAL"),
				value: "{{parameters.LOCALE}}"
			}
		}
	};

	return CardEditor;
});