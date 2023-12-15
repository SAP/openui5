/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Defines the alignment of the <code>ActionToolbarAction</code> action control.
	 *
	 * @enum {string}
	 * @since 1.88
	 * @alias sap.ui.mdc.enum.ActionToolbarActionAlignment
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.ActionToolbarActionAlignment}
	 */
	const ActionToolbarActionAlignment = {
		/**
		 * @public
		 */
		Begin: "Begin",
		/**
		 * @public
		 */
		End: "End"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.enum.ActionToolbarActionAlignment", ActionToolbarActionAlignment);

	return ActionToolbarActionAlignment;

}, /* bExport= */ true);