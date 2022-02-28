/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.ViewSettingsDialog.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ViewSettingsDialog"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ViewSettingsDialog</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.fiori.ViewSettingsDialog</code> component helps the user to sort data within a list or a table. It consists of several lists like <code>Sort order</code> which is built-in and <code>Sort By</code> and <code>Filter By</code> lists, for which you must be provide items(<code>sap.ui.webc.fiori.SortItem</code> & <code>sap.ui.webc.fiori.FilterItem</code> respectively) These options can be used to create sorters for a table.
	 *
	 * The <code>sap.ui.webc.fiori.ViewSettingsDialog</code> interrupts the current application processing as it is the only focused UI element and the main screen is dimmed/blocked. The <code>sap.ui.webc.fiori.ViewSettingsDialog</code> is modal, which means that user action is required before returning to the parent window is possible.
	 *
	 * <h3>Structure</h3> A <code>sap.ui.webc.fiori.ViewSettingsDialog</code> consists of a header, content, and a footer for action buttons. The <code>sap.ui.webc.fiori.ViewSettingsDialog</code> is usually displayed at the center of the screen.
	 *
	 * <h3>Responsive Behavior</h3> <code>sap.ui.webc.fiori.ViewSettingsDialog</code> stretches on full screen on phones.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.95.0
	 * @experimental Since 1.95.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.ViewSettingsDialog
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ViewSettingsDialog = WebComponent.extend("sap.ui.webc.fiori.ViewSettingsDialog", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-view-settings-dialog-ui5",
			properties: {

				/**
				 * Defines the initial sort order.
				 */
				sortDescending: {
					type: "boolean",
					defaultValue: false
				}
			},
			aggregations: {

				/**
				 *
				 */
				filterItems: {
					type: "sap.ui.webc.fiori.IFilterItem",
					multiple: true,
					slot: "filterItems"
				},

				/**
				 *
				 */
				sortItems: {
					type: "sap.ui.webc.fiori.ISortItem",
					multiple: true,
					slot: "sortItems"
				}
			},
			events: {

				/**
				 * Fired when cancel button is activated.
				 */
				cancel: {
					parameters: {
						/**
						 * The current sort order selected.
						 */
						sortOrder: {
							type: "string"
						},

						/**
						 * The currently selected <code>sap.ui.webc.fiori.SortItem</code> text attribute.
						 */
						sortBy: {
							type: "string"
						},

						/**
						 * The currently selected <code>sap.ui.webc.fiori.SortItem</code>.
						 */
						sortByItem: {
							type: "HTMLElement"
						},

						/**
						 * The selected sort order (true = descending, false = ascending).
						 */
						sortDescending: {
							type: "boolean"
						},

						/**
						 * The selected filters items.
						 */
						filterItems: {
							type: "Array"
						}
					}
				},

				/**
				 * Fired when confirmation button is activated.
				 */
				confirm: {
					parameters: {
						/**
						 * The current sort order selected.
						 */
						sortOrder: {
							type: "string"
						},

						/**
						 * The currently selected <code>sap.ui.webc.fiori.SortItem</code> text attribute.
						 */
						sortBy: {
							type: "string"
						},

						/**
						 * The currently selected <code>sap.ui.webc.fiori.SortItem</code>.
						 */
						sortByItem: {
							type: "HTMLElement"
						},

						/**
						 * The selected sort order (true = descending, false = ascending).
						 */
						sortDescending: {
							type: "boolean"
						},

						/**
						 * The selected filters items.
						 */
						filterItems: {
							type: "Array"
						}
					}
				}
			},
			methods: ["show"]
		}
	});

	/**
	 * Shows the dialog.
	 * @public
	 * @name sap.ui.webc.fiori.ViewSettingsDialog#show
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ViewSettingsDialog;
});