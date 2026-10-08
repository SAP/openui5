/*!
 * ${copyright}
 */

// Provides control sap.m.table.Title.
sap.ui.define([
	"sap/ui/core/Control",
	"./TitleRenderer"
],
	function(Control, TitleRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.m.table.Title</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A composite title control intended to display a table title along with optional
	 * total and selected row counts.
	 *
	 * The <code>sap.m.table.Title</code> control renders the provided <code>sap.m.Title</code> control and optionally
	 * displays the table's total row count, the selected row count, or both independently.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.ITitle
	 * @implements sap.ui.core.IShrinkable
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.147
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.table.Title
	 */
	const Title = Control.extend("sap.m.table.Title", /** @lends sap.m.table.Title.prototype */ {
		metadata : {
			library : "sap.m",
			interfaces : [
				"sap.ui.core.ITitle",
				"sap.ui.core.IShrinkable"
			],
			properties : {
				/**
				 * Defines the value that is displayed as the total row count.
				 *
				 * <b>Note:</b> A value of 0 represents an empty table, while a negative value
				 * indicates that the total count is unknown. Although both cases are not displayed
				 * to the user, they are handled differently for accessibility reasons.
				 */
				totalCount : {type : "int", group : "Appearance", defaultValue : 0},

				/**
				 * Defines the value that is displayed as the selected row count.
				 *
				 * <b>Note:</b> A value of 0 indicates that no rows are selected, while a negative value
				 * indicates that the selected count is unknown. Although these cases are not displayed
				 * to the user, they are handled differently for accessibility reasons.
				 */
				selectedCount : {type : "int", group : "Appearance", defaultValue : 0},

				/**
				 * Toggles between compact and extended display modes for the
				 * <code>selectedCount</code> and <code>totalCount</code>.
				 *
				 * <ul>
				 *   <li><b>Compact mode (<code>false</code>)</b>: Displays counts in a condensed format.</li>
				 *   <li><b>Extended mode (<code>true</code>)</b>: Displays counts with separate descriptive labels.</li>
				 * </ul>
				 */
				showExtendedView : {type : "boolean", group : "Appearance", defaultValue : false},

				/**
				 * Determines whether the count labels of the extended view read as rows (default) or as items.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				context : {type : "string", group : "Appearance", defaultValue : "Table"},

				/**
				 * Determines whether the control is visible.
				 *
				 * <b>Note:</b> If set to <code>false</code>, the control is hidden but still rendered for accessibility reasons.
				 */
				visible : {type : "boolean", group : "Appearance", defaultValue : true}
			},
			defaultAggregation : "title",
			aggregations : {
				/**
				 * Sets the title control, which is displayed in the toolbar as usual.
				 *
				 * <b>Note:</b> You must set a <code>title</code> to use this control.
				 */
				title : {type : "sap.m.Title", multiple : false}
			}
		},

		renderer: TitleRenderer
	});

	return Title;

});
