/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/editor/Editor",
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card"
], function (
	Editor,
	Core,
	Card
) {
	"use strict";

	var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");
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
	var CardEditor = Editor.extend("sap.ui.integration.designtime.editor.CardEditor", /** @lends sap.ui.integration.designtime.editor.CardEditor.prototype */ {
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
		var oPreview = this.getAggregation("_preview");
		if (oPreview && oPreview.getSettings() && oPreview.getSettings().preview && oPreview.getSettings().preview.modes === "None") {
			return false;
		}
		return true;
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
				var instance = Core.byId(vCardIdOrSettings);
				if (!instance) { //not a card instance, but a string
					//could be a card dom element id
					var element = document.getElementById(vCardIdOrSettings);
					if (element && element.tagName && element.tagName === "ui-integration-card") {
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
				baseUrl: vCardIdOrSettings.getBaseUrl()
			};
		}
		if (typeof vCardIdOrSettings === "object") {
			this._oEditorCard = new Card(vCardIdOrSettings);
			this._oEditorCard.onBeforeRendering();
			this._oEditorCard.attachEventOnce("_cardReady", function () {
				this.setJson(vCardIdOrSettings, bSuppressRerendering);
			}.bind(this));
		}
	};

	/**
	 * Initializes the additional content
	 */
	CardEditor.prototype._initPreview = function () {
		var oSettings = this._oDesigntimeInstance.getSettings() || {};
		oSettings.preview = oSettings.preview || {};
		oSettings.preview.position = this.getPreviewPosition();
		return new Promise(function (resolve, reject) {
			sap.ui.require(["sap/ui/integration/designtime/editor/CardPreview"], function (Preview) {
				var oPreview = new Preview({
					settings: oSettings,
					card: this._oEditorCard
				});
				this.setAggregation("_preview", oPreview);
				resolve();
			}.bind(this));
		}.bind(this));
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