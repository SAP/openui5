/*
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase"
], function(
	PluginBase
) {
	"use strict";

	/**
	 * @abstract
	 * @class
	 * Base class for the selection plugins. A selection plugin is responsible for the selection behavior of the table. It handles the selection state
	 * and provides information about the selection state to the table. The subclass is also responsible for firing the <code>selectionChange</code>
	 * event when the selection is changed.
	 *
	 * Do not add more than one selection plugin to a table.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.64
	 * @alias sap.ui.table.plugins.SelectionPlugin
	 *
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const SelectionPlugin = PluginBase.extend("sap.ui.table.plugins.SelectionPlugin", {metadata: {
		"abstract": true,
		library: "sap.ui.table",
		properties: {
			/**
			 * Indicates whether this plugin is enabled.
			 */
			enabled: {type: "boolean", defaultValue: true} // TODO: Inherited from private PluginBase. Remove once PluginBase is public.
		},
		events: {
			/**
			 * This event is fired when the selection is changed.
			 */
			selectionChange: {}
		}
    }});

	SelectionPlugin.findOn = PluginBase.findOn;

	SelectionPlugin.prototype.setParent = function(oParent) {
		const oOldParent = this.getParent();

		PluginBase.prototype.setParent.apply(this, arguments);

		oOldParent?._onSelectionPluginChange();
		if (oOldParent !== oParent) {
			oParent?._onSelectionPluginChange();
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
	 * TODO: Document type parameter to that possible values are clear
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
	 * TODO: mConfig was a quick solution. Replace parameterization with dedicated methods? This signature looks like there could also be a
	 * range deselection. Table isn't requesting it, yet, maybe it will one day.
	 * Plugins need to remember the last selected row/context/index. The table should not need to. In simple words: The table should just tell the
	 * plugin that the user wants to select a range to the given row (pressed shift+click on a row) and the plugin should handle the rest. A plugin
	 * might even ignore the request to select a range (if it cannot do it) and select just the row.
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
	 * TODO: Only used for the row drag ghost. Replace with getSelectedContexts() (getSelectedContexts().length)? Useful in integration scenarios.
	 * Check if this is possible with our index-based selection plugins. And if not, does that need to impact the modern interface? Legacy alternative
	 * possible?
	 * If we keep this method, rename to getSelectionCount?
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