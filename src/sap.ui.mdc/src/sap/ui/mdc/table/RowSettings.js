/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], (
	Element
) => {
	"use strict";
	/**
	 * Constructor for new <code>RowSettings</code>.
	 *
	 * <b>Note:</b> Only use bindings that are bound against the rows, as working functionality cannot be ensured for other binding types.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>RowSettings</code> control is used to configure a row.
	 * This control can only be used in the context of the <code>sap.ui.mdc.Table</code> control to define row settings.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.mdc.table.RowSettings
	 */

	const RowSettings = Element.extend("sap.ui.mdc.table.RowSettings", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The highlight state of the rows.
				 *
				 * If the highlight is set to {@link module:sap/ui/core/message/MessageType MessageType.None} (default), no highlights are visible.
				 * Valid values for the <code>highlight</code> property are values of the enumerations {@link module:sap/ui/core/message/MessageType}
				 * or {@link sap.ui.core.IndicationColor} (only values of <code>Indication01</code> to <code>Indication10</code> are supported
				 * for accessibility contrast reasons).
				 *
				 * Accessibility support is provided with the {@link sap.ui.mdc.table.RowSettings#setHighlightText highlightText} property.
				 * If the <code>highlight</code> property is set to a value of {@link module:sap/ui/core/message/MessageType}, the
				 * <code>highlightText</code> property does not need to be set because a default text is used. However, the default text can be
				 * overridden by setting the <code>highlightText</code> property.
				 * In all other cases the <code>highlightText</code> property must be set.
				 *
				 */
				highlight: {type: "string", group: "Appearance", defaultValue: "None"},

				/**
				 * Defines the semantics of the {@link sap.ui.mdc.table.RowSettings#setHighlight highlight} property for accessibility purposes.
				 */
				highlightText: {type: "string", group: "Misc", defaultValue: ""},

				/**
				 * The navigated state of a row. The navigation indicator is displayed at the end of a row.
				 */
				navigated: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			aggregations: {
				/**
				 * The actions that appear at the end of a row.
				 *
				 * <b>Note:</b> This aggregation cannot be bound with a factory. If the table type is
				 * {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}, only the <code>Navigation</code> row action type is supported.
				 */
				rowActions: {type: "sap.ui.mdc.table.RowActionItem", multiple: true}
			}
		}
	});

	RowSettings.prototype.getAllSettings = function() {
		const mSettings = {};
		const thisCloned = this.clone(); // To make sure the binding info instances are not shared between different tables

		if (this.isBound("navigated")) {
			mSettings.navigated = thisCloned.getBindingInfo("navigated");
		} else {
			mSettings.navigated = this.getNavigated();
		}

		if (this.isBound("highlight")) {
			mSettings.highlight = thisCloned.getBindingInfo("highlight");
		} else {
			mSettings.highlight = this.getHighlight();
		}

		if (this.isBound("highlightText")) {
			mSettings.highlightText = thisCloned.getBindingInfo("highlightText");
		} else {
			mSettings.highlightText = this.getHighlightText();
		}

		return mSettings;
	};

	RowSettings.prototype.getAllActions = function() {
		const mSettings = {};
		const thisCloned = this.clone();

		if (this.isBound("rowActions")) {
			// Set bindingInfo for items aggregation to bindingInfo of rowActions
			mSettings.items = thisCloned.getBindingInfo("rowActions");
			const oTemplate = mSettings.items.template;
			// Create temporary metdata information for later processing
			mSettings.templateInfo = {
				type: oTemplate.isBound("type") ? oTemplate.getBindingInfo("type") : oTemplate.getType(),
				text: oTemplate.isBound("text") ? oTemplate.getBindingInfo("text") : oTemplate.getText(),
				icon: oTemplate.isBound("icon") ? oTemplate.getBindingInfo("icon") : oTemplate.getIcon(),
				visible: oTemplate.isBound("visible") ? oTemplate.getBindingInfo("visible") : oTemplate.getVisible()
			};
		} else {
			mSettings.items = this.getRowActions();
		}
		return mSettings;
	};

	RowSettings.prototype.getRowActionCount = function() {
		let iCount = 0;
		if (this.isBound("rowActions")) {
			iCount = 1;
		} else {
			iCount = this.getRowActions().length;
		}
		return iCount;
	};

	return RowSettings;
});