/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Defines the alignment of the <code>ActionToolbarAction</code> action control.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.ActionToolbarActionAlignment
	 */
	const ActionToolbarActionAlignment = {
		/**
		 * Align to the beginning
		 * @public
		 */
		Begin: "Begin",
		/**
		 * Align to the end
		 * @public
		 */
		End: "End"
	};

	DataType.registerEnum("sap.ui.mdc.enums.ActionToolbarActionAlignment", ActionToolbarActionAlignment);

	return ActionToolbarActionAlignment;

}, /* bExport= */ true);
