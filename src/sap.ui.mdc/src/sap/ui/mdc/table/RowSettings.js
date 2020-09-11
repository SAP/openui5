/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.table.RowSettings
sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";
	/**
	 * Constructor for new RowSettings.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>RowSettings</code> control allows you to configure a row.
	 * You can only use this control in the context of the <code>sap.ui.mdc.Table</code> control to define row settings.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.mdc.table.RowSettings
	 */

	var RowSettings = Element.extend("sap.ui.mdc.table.RowSettings", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The highlight state of the rows.
				 *
				 * If the highlight is set to {@link sap.ui.core.MessageType sap.ui.core.MessageType.None} (default), no highlights are visible.
				 * Valid values for the <code>highlight</code> property are values of the enumerations {@link sap.ui.core.MessageType} or
				 * {@link sap.ui.core.IndicationColor}.
				 *
				 * Accessibility support is provided through the associated {@link sap.ui.mdc.table.RowSettings#setHighlightText highlightText} property.
				 * If the <code>highlight</code> property is set to a value of {@link sap.ui.core.MessageType}, the <code>highlightText</code>
				 * property does not need to be set because a default text is used. However, the default text can be overridden by setting the
				 * <code>highlightText</code> property.
				 * In all other cases the <code>highlightText</code> property must be set.
				 *
				 */
				highlight : {type : "string", group : "Appearance", defaultValue : "None"},

				/**
				 * Defines the semantics of the {@link sap.ui.mdc.table.RowSettings#setHighlight highlight} property for accessibility purposes.
				 *
				 */
				highlightText : {type : "string", group : "Misc", defaultValue : ""},

				/**
				 * The navigated state of a row.
				 *
				 * If set to <code>true</code>, a navigation indicator is displayed at the end of the row.
				 */
				navigated : {type : "boolean", group : "Appearance", defaultValue : false}
			}
		}
	});

	RowSettings.prototype.getAllSettings = function() {
		var mSettings = {},
			thisCloned = this.clone();	// To make sure the binding info instances are not shared between different tables

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

	return RowSettings;
});