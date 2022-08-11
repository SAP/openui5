/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/base/Log"
], function (BaseExtension,
			 Log) {
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
	 * @extends sap.ui.integration.Extension
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.94
	 * @alias sap.ui.integration.editor.Extension
	 */
	var Extension = BaseExtension.extend("sap.ui.integration.editor.Extension");

	Extension.prototype.init = function () {
		BaseExtension.prototype.init.apply(this, arguments);
		this._oEditorInterface = null;
		this._oEditor = null;
	};

	Extension.prototype.exit = function () {
		BaseExtension.prototype.exit.apply(this, arguments);
		this._oEditorInterface = null;
		this._oEditor = null;
	};

	/**
	 * See generated JSDoc
	 */
	Extension.prototype.setFormatters = function (aFormatters) {
		BaseExtension.prototype.setFormatters.apply(this, arguments);
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
	 * Sets the editor.
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