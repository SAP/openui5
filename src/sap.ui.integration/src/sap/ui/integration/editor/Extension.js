/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/library",
	"sap/base/Log",
	"sap/ui/base/ManagedObject"
], function (library,
			 Log,
			 ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new <code>Extension</code>.
	 *
	 * @param {string} [sId] ID for the new extension, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new extension.
	 *
	 * @class
	 * Brings JavaScript capabilities for an {@link sap.ui.integration.editor.Editor} where custom logic can be implemented.
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.94
	 * @alias sap.ui.integration.editor.Extension
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
	 */
	var Extension = ManagedObject.extend("sap.ui.integration.editor.Extension", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * The formatters, which can be used in the manifest.
				 * @experimental since 1.94
				 */
				formatters: {
					type: "object"
				}
			}
		}
	});

	Extension.prototype.init = function () {
		this._oEditorInterface = null;
		this._oEditor = null;
	};

	Extension.prototype.exit = function () {
		this._oEditorInterface = null;
		this._oEditor = null;
	};

	/**
	 * See generated JSDoc
	 */
	Extension.prototype.setFormatters = function (aFormatters) {
		this.setProperty("formatters", aFormatters);

		if (!this._oEditor) {
			return;
		}

		if (this._oEditor.getAggregation("_extension") !== this) {
			Log.error("Extension formatters must be set before the initialization of the editor. Do this inside Extension#init().");
		}
	};

	/**
	 * Called when the editor is ready.
	 * @public
	 */
	Extension.prototype.onEditorReady = function () { };

	/**
	 * Returns an interface to the editor, which uses this extension.
	 * @public
	 * @returns {sap.ui.integration.widgets.CardFacade} An interface to the card.
	 */
	 Extension.prototype.getEditor = function () {
		return this._oEditorInterface;
	};

	/**
	 * Sets the card.
	 *
	 * @param {object} oEditor The editor.
	 * @param {object} oEditorInterface A limited interface to the editor.
	 * @private
	 */
	Extension.prototype._setEditor = function (oEditor, oEditorInterface) {
		this._oEditor = oEditor;
		this._oEditorInterface = oEditorInterface;
	};

	return Extension;
});