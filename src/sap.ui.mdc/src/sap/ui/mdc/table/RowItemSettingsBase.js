/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/base/strings/capitalize"
], (
	Element,
	capitalize
) => {
	"use strict";

	/**
	 * Constructor for a new <code>RowItemSettingsBase</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 *
	 * @class
	 * Shared base for the row/item settings of <code>sap.ui.mdc.List</code> and <code>sap.ui.mdc.Table</code>.
	 * Subclasses add their own action-count property and actions aggregation.
	 * It must not be used stand-alone.
	 * @extends sap.ui.core.Element
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.154
	 * @alias sap.ui.mdc.table.RowItemSettingsBase
	 * @public
	 */
	const RowItemSettingsBase = Element.extend("sap.ui.mdc.table.RowItemSettingsBase", {
		metadata: {
			"abstract": true,
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Defines the highlight state.
				 */
				highlight: {type: "string", group: "Appearance", defaultValue: "None"},
				/**
				 * Defines the semantics of the highlight state, used for accessibility purposes.
				 */
				highlightText: {type: "string", group: "Misc", defaultValue: ""},
				/**
				 * Defines whether the item is in a navigated state.
				 */
				navigated: {type: "boolean", group: "Appearance", defaultValue: false}
			}
		}
	});

	/**
	 * Returns the shared settings as an object with property values or binding infos.
	 *
	 * @returns {object} Map of property names to values or binding infos
	 * @private
	 */
	RowItemSettingsBase.prototype.getAllSettings = function() {
		const mSettings = {};
		const oClone = this.clone();

		["navigated", "highlight", "highlightText"].forEach((sProperty) => {
			mSettings[sProperty] = this.isBound(sProperty) ? oClone.getBindingInfo(sProperty) : this.getProperty(sProperty);
		});

		oClone.destroy();
		return mSettings;
	};

	/**
	 * Returns the actions configuration as an object with the items array or binding info.
	 *
	 * @param {string} sActionsAggregation Name of the subclass actions aggregation
	 * @param {string[]} aTemplateKeys Property names to extract from the action template
	 * @returns {object} Map containing the actions items or binding info
	 * @private
	 */
	RowItemSettingsBase.prototype.getAllActions = function(sActionsAggregation, aTemplateKeys) {
		const mSettings = {};

		if (this.isBound(sActionsAggregation)) {
			const oClone = this.clone();
			mSettings.items = oClone.getBindingInfo(sActionsAggregation);
			const oTemplate = mSettings.items.template;
			mSettings.templateInfo = {};
			aTemplateKeys.forEach((sKey) => {
				mSettings.templateInfo[sKey] = oTemplate.isBound(sKey) ? oTemplate.getBindingInfo(sKey) : oTemplate["get" + capitalize(sKey)]();
			});
			oClone.destroy();
		} else {
			mSettings.items = this.getAggregation(sActionsAggregation) || [];
		}

		return mSettings;
	};

	/**
	 * Returns the effective number of actions to display.
	 *
	 * @param {string} sCountProperty Name of the subclass action-count property
	 * @param {string} sActionsAggregation Name of the subclass actions aggregation
	 * @returns {int} The number of actions
	 * @private
	 */
	RowItemSettingsBase.prototype.getEffectiveActionCount = function(sCountProperty, sActionsAggregation) {
		if (!this.isPropertyInitial(sCountProperty) || this.getProperty(sCountProperty) !== -1) {
			return this.getProperty(sCountProperty);
		}

		if (this.isBound(sActionsAggregation)) {
			return 1;
		}

		return (this.getAggregation(sActionsAggregation) || []).length;
	};

	return RowItemSettingsBase;
});
