/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	/**
	 * Object containing selected contexts.
	 *
	 * @typedef {object} sap.ui.fl.variants.context.Component.SelectedContexts
	 * @property {string[]} oSelectedContexts.role - Array of selected roles
	 * @since 1.88
	 * @private
	 * @ui5-restricted sap.ui.comp, sap.ui.fl
	 */

	/**
	 * Provides a UI component for context sharing.
	 *
	 * @namespace sap.ui.fl.variants.context.Component
	 * @since 1.88.0
	 * @private
	 * @ui5-restricted sap.ui.comp, sap.ui.fl
	 */
	return UIComponent.extend("sap.ui.fl.variants.context.Component", {

		metadata: {
			manifest: "json"
		},
		onInit() {
			var oSelectedContextsModel = this.getModel("selectedContexts");
			oSelectedContextsModel.setProperty("/selected", []);
		},

		/**
		 * Returns flexObject of selected contexts from a given context sharing component.
		 *
		 * @returns {sap.ui.fl.variants.context.Component.SelectedContexts} Object containing selected contexts
		 */
		getSelectedContexts() {
			var oSelectedRoles = this.getModel("selectedContexts").getProperty("/selected");
			var aSelectedRoleIds = oSelectedRoles.map(function(oRole) {
				return oRole.id;
			});
			return { role: aSelectedRoleIds };
		},

		/**
		 * Sets the text for an empty list with the advice to select at least one role
		 */
		setEmptyListTextWithAdvice() {
			var oRoleSelectionModel = this.getModel("selectedContexts");
			oRoleSelectionModel.setProperty("/noDataText",
				this.getRootControl().getController().oI18n.getText("NO_SELECTED_ROLES_WITH_ADVICE"));
			oRoleSelectionModel.refresh(true);
		},

		/**
		 * Returns context sharing data binding model
		 *
		 * @returns {sap.ui.model.Model} Model containing selected contexts
		 */
		getSelectedContextsModel() {
			return this.getModel("selectedContexts");
		},

		/**
		 * Sets selected contexts.
		 *
		 * @param {sap.ui.fl.variants.context.Component.SelectedContexts} oSelectedContexts - Selected contexts
		 */
		setSelectedContexts(oSelectedContexts) {
			var aSelectedRoles = oSelectedContexts.role.map(function(oRole) {
				return {id: oRole, description: ""};
			});
			var oSelectedContextsModel = this.getModel("selectedContexts");
			oSelectedContextsModel.setProperty("/selected", aSelectedRoles);
			oSelectedContextsModel.refresh(true);
		},
		resetSelectedContexts() {
			var oSelectedContextsModel = this.getModel("selectedContexts");
			oSelectedContextsModel.setProperty("/selected", []);
			oSelectedContextsModel.refresh(true);
		},

		/**
		 * Checks whether the given context sharing component is ready to be saved.
		 * Displays UI error message in case there is an inconsistency within the variant: The 'restricted' option is selected, but no role was chosen.
		 *
		 * @deprecated As of version 1.100
		 * @returns {boolean} <code>true</code> if the component has errors, <code>false</code> if there are no errors
		 */
		hasErrorsAndShowErrorMessage() {
			return false;
		},

		/**
		 * Sets if message strip is shown
		 * @param {boolean} bShowMessageStrip - Visibility of the message strip
		 */
		showMessageStrip(bShowMessageStrip) {
			var oRoleSelectionModel = this.getModel("selectedContexts");
			oRoleSelectionModel.setProperty("/showMessageStrip", bShowMessageStrip);
			oRoleSelectionModel.refresh(true);
		}
	});
});
