/*!
 * ${copyright}
 */

// Provides control sap.m.SelectDialogBase.
sap.ui.define([
		'./library',
		'sap/ui/core/Control',
		'sap/ui/core/InvisibleText',
		"sap/ui/core/Lib"
],
function(
	library,
	Control,
	InvisibleText,
	Library
) {
	"use strict";

	// shortcut for sap.m.SelectDialogInitialFocus
	var SelectDialogInitialFocus = library.SelectDialogInitialFocus;

	/**
	 * Constructor for a new SelectDialogBase.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.SelectDialogBase</code> control provides a base functionality of the
	 * <code>sap.m.SelectDialog</code> and <code>sap.m.TableSelectDialog</code> controls.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @abstract
	 * @since 1.93
	 * @alias sap.m.SelectDialogBase
	 */
	var SelectDialogBase = Control.extend("sap.m.SelectDialogBase", /** @lends sap.m.SelectDialogBase.prototype */ {
		metadata: {
			library: "sap.m",
			"abstract": true,
			properties: {
				/**
				 * Specifies the control that will receive the initial focus.
				 *
				 * <b>Note:</b> When the <code>growing</code> property is set to <code>true</code>,
				 * you can set the initial focus to <code>sap.m.SelectDialogInitialFocus.SearchField</code>.
				 * In this way the user can easily search for items that are not currently visible.
				 * @since 1.117.0
				 */
				initialFocus: {type: "sap.m.SelectDialogInitialFocus", group: "Behavior", defaultValue: SelectDialogInitialFocus.List}
			},
			aggregations: {},
			events: {
				/**
				 * Fires before <code>items</code> binding is updated (e.g. sorting, filtering)
				 *
				 * <b>Note:</b> Event handler should not invalidate the control.
				 * @since 1.93
				 */
				updateStarted : {
					parameters : {

						/**
						 * The reason of the update, e.g. Binding, Filter, Sort, Growing, Change, Refresh, Context.
						 */
						reason : {type : "string"},

						/**
						 * Actual number of items.
						 */
						actual : {type : "int"},

						/**
						 * The total count of bound items. This can be used if the <code>growing</code> property is set to <code>true</code>.
						 */
						total : {type : "int"}
					}
				},

				/**
				 * Fires after <code>items</code> binding is updated and processed by the control.
				 * @since 1.93
				 */
				updateFinished : {
					parameters : {

						/**
						 * The reason of the update, e.g. Binding, Filter, Sort, Growing, Change, Refresh, Context.
						 */
						reason : {type : "string"},

						/**
						 * Actual number of items.
						 */
						actual : {type : "int"},

						/**
						 * The total count of bound items. This can be used if the <code>growing</code> property is set to <code>true</code>.
						 */
						total : {type : "int"}
					}
				},

				/**
				 * Fires when selection is changed via user interaction inside the control.
				 * @since 1.93
				 */
				selectionChange : {
					parameters : {

						/**
						 * The item whose selection has changed. In <code>MultiSelect</code> mode, only the up-most selected item is returned. This parameter can be used for single-selection modes.
						 */
						listItem : {type : "sap.m.ListItemBase"},

						/**
						 * Array of items whose selection has changed. This parameter can be used for <code>MultiSelect</code> mode.
						 */
						listItems : {type : "sap.m.ListItemBase[]"},

						/**
						 * Indicates whether the <code>listItem</code> parameter is selected or not.
						 */
						selected : {type : "boolean"},

						/**
						 * Indicates whether the select all action is triggered or not.
						 */
						selectAll : {type : "boolean"}
					}
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function () {
			}
		}
	});

	SelectDialogBase.getInvisibleText = function() {
		if (!this.oInvisibleText) {
			this.oInvisibleText = new InvisibleText({
				text: Library.getResourceBundleFor("sap.m").getText("SELECTDIALOGBASE_LISTLABEL")
			}).toStatic();
		}

		return this.oInvisibleText;
	};

	SelectDialogBase.prototype._getInitialFocus = function () {
		switch (this.getInitialFocus()) {
			case SelectDialogInitialFocus.SearchField:
				return this._oSearchField;
			default:
				return this._oDialog.getContent()[1];
		}
	};

	return SelectDialogBase;
});
