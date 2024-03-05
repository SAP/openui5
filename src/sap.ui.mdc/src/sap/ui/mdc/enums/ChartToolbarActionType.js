/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 *
	 * Defines the types of chart actions in the toolbar.<br>
	 * Can be used to remove some of the default <code>ToolbarAction</code>. For more information, see {@link sap.ui.mdc.Chart#ignoreToolbarActions}.
	 *
	 * @alias sap.ui.mdc.enums.ChartToolbarActionType
	 * @since 1.115
	 * @enum {string}
	 * @public
	 */
	const ChartToolbarActionType = {
		/**
		 * Zoom-in and zoom-out action.
		 *
		 * @public
		 */
		ZoomInOut: "ZoomInOut",
		/**
		 * Drill-down and drill-up action.
		 *
		 * @public
		 */
		DrillDownUp: "DrillDownUp",
		/**
		 * Legend action.
		 *
		 * @public
		 */
		Legend: "Legend"
	};

	DataType.registerEnum("sap.ui.mdc.enums.ChartToolbarActionType", ChartToolbarActionType);

	return ChartToolbarActionType;

}, /* bExport= */ true);