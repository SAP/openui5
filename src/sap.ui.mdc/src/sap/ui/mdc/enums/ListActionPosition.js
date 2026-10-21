/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Defines the supported positions for list-relevant actions within the list toolbar, in accordance with the {@link https://www.sap.com/design-system/fiori-design-web/ui-elements/table-bar/ SAP Design System guidelines}.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.ListActionPosition
	 * @since 1.154
	 * @public
	 */
	const ListActionPosition = {
		/**
		 * Extension point for the personalization actions at the start of the group.
		 * These actions change the arrangement or personalization of the list at the item level, such as List Settings.
		 * @private
		 */
		PersonalizationActions: "PersonalizationActions",

		/**
		 * The position of the settings action in the personalization actions group.
		 * @private
		 */
		PersonalizationActionsSettings: "PersonalizationActionsSettings",

		/**
		 * Extension point for the export actions at the start of the group.
		 * These actions convert the content of the list into an external format, such as Excel, PDF, a printed document.
		 * @private
		 */
		ExportActions: "ExportActions",

		/**
		 * The position of the export action in the export actions group.
		 * @private
		 */
		ExportActionsExport: "ExportActionsExport",

		/**
		 * Extension point for actions displayed after all list-relevant actions.
		 * These actions allow applications to add additional functionality, such as pagination, refresh.
		 * @public
		 */
		EndActions: "EndActions"
	};

	DataType.registerEnum("sap.ui.mdc.enums.ListActionPosition", ListActionPosition);

	return ListActionPosition;

}, /* bExport= */ true);
