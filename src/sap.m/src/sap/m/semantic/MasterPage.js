/*!
 * ${copyright}
 */

sap.ui.define([ 'jquery.sap.global', "sap/m/semantic/SemanticPage", "sap/m/semantic/SemanticPageRenderer", "sap/m/semantic/MultiSelectAction" ], function(jQuery, SemanticPage, SemanticPageRenderer, MultiSelectAction) {
	"use strict";


	/**
	 * Constructor for a new MasterPage
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A MasterPage is a {@link sap.m.semantic.SemanticPage} that is restricted to include only semantic controls of the following semantic types:
	 *
	 * <ul>

	 * </ul>
	 *
	 * @extends sap.m.semantic.SemanticPage
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.MasterPage
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MasterPage = SemanticPage.extend("sap.m.semantic.MasterPage", /** @lends sap.m.semantic.MasterPage.prototype */ {
		metadata: {
			aggregations: {
				/**
				 * Add action
				 */
				addAction: {
					type: "sap.m.semantic.AddAction",
					multiple: false
				},
				/**
				 * Main action
				 */
				mainAction: {
					type: "sap.m.semantic.MainAction",
					multiple: false
				},
				/**
				 * Positive action
				 */
				positiveAction: {
					type: "sap.m.semantic.PositiveAction",
					multiple: false
				},
				/**
				 * Negative action
				 */
				negativeAction: {
					type: "sap.m.semantic.NegativeAction",
					multiple: false
				},
				/**
				 * MultiSelect action
				 */
				multiSelectAction: {
					type: "sap.m.semantic.MultiSelectAction",
					multiple: false
				},
				/**
				 * Forward action
				 */
				forwardAction: {
					type: "sap.m.semantic.ForwardAction",
					multiple: false
				},
				/**
				 * Edit action
				 */
				editAction: {
					type: "sap.m.semantic.EditAction",
					multiple: false
				},
				/**
				 * Save action
				 */
				saveAction: {
					type: "sap.m.semantic.SaveAction",
					multiple: false
				},
				/**
				 * Cancel action
				 */
				cancelAction: {
					type: "sap.m.semantic.CancelAction",
					multiple: false
				},
				/**
				 * Sort action
				 */
				sort: {
					type: "sap.m.semantic.ISort",
					multiple: false
				},
				/**
				 * Filter action
				 */
				filter: {
					type: "sap.m.semantic.IFilter",
					multiple: false
				},
				/**
				 * Group action
				 */
				group: {
					type: "sap.m.semantic.IGroup",
					multiple: false
				},
				/**
				 * MessagesIndicator
				 */
				messagesIndicator: {
					type: "sap.m.semantic.MessagesIndicator",
					multiple: false
				}
			}
		},
		renderer: SemanticPageRenderer.render
	});

	return MasterPage;
}, /* bExport= */ true);
