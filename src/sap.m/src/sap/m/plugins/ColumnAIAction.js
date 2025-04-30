/*!
 * ${copyright}
 */

sap.ui.define(["./PluginBase", "../library", "../Button" ,"sap/ui/core/Lib"], function(PluginBase, library, Button, Lib) {
	"use strict";

	/**
	 * Constructor for a new <code>ColumnAIAction</code> plugin that can be used to add an AI related action for table columns.
	 *
	 * @param {string} [sId] ID for the new <code>ColumnAIAction</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the <code>ColumnAIAction</code>
	 *
	 * @class
	 * This plugin adds an AI related action to a table column.
	 *
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.136
	 * @alias sap.m.plugins.ColumnAIAction
	 * @borrows sap.m.plugins.PluginBase.findOn as findOn
	 */
	const ColumnAIAction = PluginBase.extend("sap.m.plugins.ColumnAIAction", /** @lends sap.m.plugins.ColumnAIAction.prototype */ { metadata: {
		library: "sap.m",
		events: {
			/**
			 * Fired when the AI action is pressed.
			 */
			press: {
				parameters: {
					/**
					 * The column action that triggered the event.
					 */
					action: {type: "sap.ui.core.Control"}
				}
			}
		}
	}});

	ColumnAIAction.findOn = PluginBase.findOn;

	ColumnAIAction.prototype.onActivate = function(oControl) {
		this.getConfig("setAction", oControl, this._getAction());
	};

	ColumnAIAction.prototype.onDeactivate = function() {
		if (this._oAction) {
			this._oAction.destroy(true);
			this._oAction = null;
		}
	};

	ColumnAIAction.prototype._getAction = function() {
		this._oAction ??= new Button({
			icon: "sap-icon://ai",
			type: library.ButtonType.Transparent,
			press: [this._onActionPress, this],
			tooltip: Lib.getResourceBundleFor("sap.m").getText("COLUMNACTIONAI_TOOLTIP")
		}).addStyleClass("sapMPluginsColumnAIAction");
		return this._oAction;
	};

	ColumnAIAction.prototype._onActionPress = function(oEvent) {
		this.firePress({
			action: oEvent.getSource()
		});
	};

	PluginBase.setConfigs({
		"sap.m.Column": {
			setAction: function(oColumn, oAction) {
				oColumn.setAggregation("_action", oAction);
			}
		},
		"sap.ui.table.Column": {
			setAction: function(oColumn, oAction) {
				oColumn.setAggregation("_action", oAction);
			}
		}
	}, ColumnAIAction);

	return ColumnAIAction;
});