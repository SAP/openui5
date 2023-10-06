/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/semantic/SemanticPage", "sap/m/semantic/SemanticPageRenderer", "sap/m/library"], function(SemanticPage, SemanticPageRenderer, library) {
	"use strict";


	// shortcut for sap.m.semantic.SemanticRuleSetType
	var SemanticRuleSetType = library.semantic.SemanticRuleSetType;


	/**
	 * Constructor for a new MasterPage
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A MasterPage is a {@link sap.m.semantic.SemanticPage} that supports semantic content of the following types:
	 *
	 * <ul>
	 * 	<li>{@link sap.m.semantic.AddAction}</li>
	 * 	<li>{@link sap.m.semantic.MainAction}</li>
	 * 	<li>{@link sap.m.semantic.PositiveAction}</li>
	 * 	<li>{@link sap.m.semantic.NegativeAction}</li>
	 * 	<li>{@link sap.m.semantic.ForwardAction}</li>
	 * 	<li>{@link sap.m.semantic.EditAction}</li>
	 * 	<li>{@link sap.m.semantic.SaveAction}</li>
	 * 	<li>{@link sap.m.semantic.DeleteAction}</li>
	 * 	<li>{@link sap.m.semantic.CancelAction}</li>
	 * 	<li>{@link sap.m.semantic.MultiSelectAction}</li>
	 * 	<li>{@link sap.m.semantic.FlagAction}</li>
	 * 	<li>{@link sap.m.semantic.FavoriteAction}</li>
	 * 	<li>{@link sap.m.semantic.SortAction}</li>
	 * 	<li>{@link sap.m.semantic.SortSelect}</li>
	 * 	<li>{@link sap.m.semantic.FilterAction}</li>
	 * 	<li>{@link sap.m.semantic.FilterSelect}</li>
	 * 	<li>{@link sap.m.semantic.GroupAction}</li>
	 * 	<li>{@link sap.m.semantic.GroupSelect}</li>
	 * 	<li>{@link sap.m.semantic.MessagesIndicator}</li>
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
	 */
	var MasterPage = SemanticPage.extend("sap.m.semantic.MasterPage", /** @lends sap.m.semantic.MasterPage.prototype */ {
		metadata: {
			library: "sap.m",
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
				 * Delete action
				 */
				deleteAction: {
					type: "sap.m.semantic.DeleteAction",
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
		renderer: SemanticPageRenderer
	});

	MasterPage.prototype.init = function () {

		SemanticPage.prototype.init.call(this);
		this._getPage().getLandmarkInfo().setRootLabel(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("SEMANTIC_MASTER_PAGE_TITLE"));
	};

	MasterPage.prototype.getSemanticRuleSet = function() {
		return SemanticRuleSetType.Classic; //this page should only use the Classic ruleset (no other rules are specified for this page for now)
	};

	return MasterPage;
});
