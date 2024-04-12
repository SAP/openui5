/*
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"./PluginBase"
], function(
	Element,
	PluginBase
) {

	"use strict";

	/**
	 * Constructs an instance of sap.ui.table.plugins.SelectionPlugin
	 *
	 * The following restrictions apply:
	 * <ul>
	 *   <li>Do not create subclasses of the <code>SelectionPlugin</code>. The API is subject to change.
	 *       <b>Note:</b> Subclasses provided by the UI5 framework that are not explicitly marked as experimental or restricted in any other way can
	 *       be used on a regular basis.</li>
	 * </ul>
	 *
	 * @abstract
	 * @class Implements the selection methods for a table.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @since 1.64
	 * @experimental As of version 1.64
	 * @alias sap.ui.table.plugins.SelectionPlugin
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const SelectionPlugin = PluginBase.extend("sap.ui.table.plugins.SelectionPlugin", {metadata: {
		"abstract": true,
		library: "sap.ui.table",
		properties: {
			/**
			 * Indicates whether this plugin is enabled.
			 */
			enabled: {type: "boolean", defaultValue: true} // TODO: Should be in PluginBase, which is still private for the time being
		},
		events: {
			/**
			 * This event is fired when the selection is changed.
			 */
			selectionChange: {
				parameters: {
				}
			}
		}
    }});

	SelectionPlugin.findOn = PluginBase.findOn;

	SelectionPlugin.prototype.setParent = function(oParent) {
		const oTable = this.getTable();

		PluginBase.prototype.setParent.apply(this, arguments);
		(oParent || oTable)._initSelectionPlugin();
	};

	SelectionPlugin.prototype.exit = function() {
		PluginBase.prototype.exit.apply(this, arguments);
		this.getTable()?._initSelectionPlugin();
	};

	SelectionPlugin.prototype.setEnabled = function(bEnabled) {
		this.setProperty("enabled", bEnabled, true);

		if (this.getEnabled()) {
			this.activate();
		} else {
			this.deactivate();
		}

		return this;
	};

	/**
	 * TODO: Historically grown and hard to understand possible combinations of settings. Refactor!
	 *
	 * @returns {{headerSelector: {type: string, bla: blub}}}
	 * @private
	 */
	SelectionPlugin.prototype.getRenderConfig = function() {
		return {
			headerSelector: {
				type: "none"
			}
		};
	};

	/**
	 * This hook is called when the header selector is pressed.
	 * TODO: Also provide the event object?
	 *
	 * @private
	 */
	SelectionPlugin.prototype.onHeaderSelectorPress = function() {};

	/**
	 * This hook is called when a keyboard shortcut relevant for selection is pressed.
	 * TODO: Document parameter to that possible values are clear
	 * TODO: Also provide the event object?
	 *
	 * @param {string} sType Type of the keyboard shortcut.
	 * @param {sap.ui.base.Event} oEvent The emitted event.
	 * @private
	 */
	SelectionPlugin.prototype.onKeyboardShortcut = function(sType, oEvent) {};

	/**
	 * Changes the selection state of a row.
	 *
	 * @param {sap.ui.table.Row} oRow Instance of the row
	 * @param {boolean} bSelected The new selection state
	 * @param {object} [mConfig]
	 * @param {boolean} [mConfig.range=false]
	 *     Whether to change the selection of the range from the last changed row to this one. The table's preferred selection status of the range is
	 *     indicated with the <code>bSelected</code> parameter, but the plugin may decide otherwise.
	 * @abstract
	 * @private
	 */
	SelectionPlugin.prototype.setSelected = function(oRow, bSelected, mConfig) {
		throw new Error(this + " does not implement #setSelected");
	};

	/**
	 * Checks whether a row is selected.
	 *
	 * @param {sap.ui.table.Row} oRow Instance of the row
	 * @returns {boolean} Whether the row is selected
	 * @abstract
	 * @private
	 */
	SelectionPlugin.prototype.isSelected = function(oRow) {
		throw new Error(this + " does not implement #isSelected");
	};

	/**
	 * Returns the number of selected rows.
	 *
	 * @returns {int} The number of selected rows
	 * @abstract
	 * @private
	 */
	SelectionPlugin.prototype.getSelectedCount = function() {
		throw new Error(this + " does not implement #getSelectedCount");
	};

	return SelectionPlugin;
});