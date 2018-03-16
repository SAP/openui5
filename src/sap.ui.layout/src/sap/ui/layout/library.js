/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.layout.
 */
sap.ui.define([
	'sap/ui/base/DataType',
	'sap/ui/core/library'], // library dependency
	function(DataType) {

	"use strict";

	/**
	 * SAPUI5 library with layout controls.
	 *
	 * @namespace
	 * @name sap.ui.layout
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.layout",
		version: "${version}",
		dependencies: ["sap.ui.core"],
		designtime: "sap/ui/layout/designtime/library.designtime",
		types: [
			"sap.ui.layout.BackgroundDesign",
			"sap.ui.layout.GridIndent",
			"sap.ui.layout.GridPosition",
			"sap.ui.layout.GridSpan",
			"sap.ui.layout.BlockBackgroundType",
			"sap.ui.layout.form.GridElementCells",
			"sap.ui.layout.form.SimpleFormLayout",
			"sap.ui.layout.form.ColumnsXL",
			"sap.ui.layout.form.ColumnsL",
			"sap.ui.layout.form.ColumnsM",
			"sap.ui.layout.form.ColumnCells",
			"sap.ui.layout.form.EmptyCells"
		],
		interfaces: [],
		controls: [
			"sap.ui.layout.AlignedFlowLayout",
			"sap.ui.layout.DynamicSideContent",
			"sap.ui.layout.FixFlex",
			"sap.ui.layout.Grid",
			"sap.ui.layout.HorizontalLayout",
			"sap.ui.layout.ResponsiveFlowLayout",
			"sap.ui.layout.ResponsiveSplitter",
			"sap.ui.layout.ResponsiveSplitterPage",
			"sap.ui.layout.Splitter",
			"sap.ui.layout.VerticalLayout",
			"sap.ui.layout.BlockLayoutCell",
			"sap.ui.layout.BlockLayoutRow",
			"sap.ui.layout.BlockLayout",
			"sap.ui.layout.form.Form",
			"sap.ui.layout.form.FormLayout",
			"sap.ui.layout.form.GridLayout",
			"sap.ui.layout.form.ColumnLayout",
			"sap.ui.layout.form.ResponsiveGridLayout",
			"sap.ui.layout.form.ResponsiveLayout",
			"sap.ui.layout.form.SimpleForm"
		],
		elements: [
			"sap.ui.layout.GridData",
			"sap.ui.layout.ResponsiveFlowLayoutData",
			"sap.ui.layout.SplitterLayoutData",
			"sap.ui.layout.form.FormContainer",
			"sap.ui.layout.form.FormElement",
			"sap.ui.layout.form.GridContainerData",
			"sap.ui.layout.PaneContainer",
			"sap.ui.layout.SplitPane",
			"sap.ui.layout.form.GridElementData",
			"sap.ui.layout.form.ColumnElementData",
			"sap.ui.layout.form.ColumnContainerData"
		],
		extensions: {
			flChangeHandlers: {
				"sap.ui.layout.BlockLayout": {
					"moveControls": "default"
				},
				"sap.ui.layout.BlockLayoutRow": {
					"moveControls": "default",
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.ui.layout.BlockLayoutCell": "sap/ui/layout/flexibility/BlockLayoutCell",
				"sap.ui.layout.DynamicSideContent": {
					"moveControls": "default",
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.ui.layout.form.SimpleForm": "sap/ui/layout/flexibility/SimpleForm",
				"sap.ui.layout.Grid": {
					"moveControls": "default",
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.ui.layout.FixFlex": {
					"moveControls": "default",
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.ui.layout.form.Form": "sap/ui/layout/flexibility/Form",
				"sap.ui.layout.form.FormContainer": "sap/ui/layout/flexibility/FormContainer",
				"sap.ui.layout.form.FormElement": "sap/ui/layout/flexibility/FormElement",
				"sap.ui.layout.HorizontalLayout": {
					"moveControls": "default",
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.ui.layout.Splitter": {
					"moveControls": "default",
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.ui.layout.VerticalLayout": {
					"moveControls": "default",
					"hideControl": "default",
					"unhideControl": "default"
				}
			},
			//Configuration used for rule loading of Support Assistant
			"sap.ui.support": {
				publicRules:true,
				internalRules:true
			}
		}
	});

	/**
	 * Available Background Design.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.36.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.BackgroundDesign = {

		/**
		 * A solid background color dependent on the theme.
		 * @public
		 */
		Solid : "Solid",

		/**
		 * Transparent background.
		 * @public
		 */
		Transparent : "Transparent",

		/**
		 * A translucent background depending on the opacity value of the theme.
		 * @public
		 */
		Translucent : "Translucent"

	};

	/**
	 * @classdesc A string type that represents Grid's indent values for large, medium and small screens. Allowed values are separated by space Letters L, M or S followed by number of columns from 1 to 11 that the container has to take, for example: "L2 M4 S6", "M11", "s10" or "l4 m4". Note that the parameters have to be provided in the order large  medium  small.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.GridIndent = DataType.createType('sap.ui.layout.GridIndent', {
	    isValid : function(vValue) {
	      return /^(([Xx][Ll](?:[0-9]|1[0-1]))? ?([Ll](?:[0-9]|1[0-1]))? ?([Mm](?:[0-9]|1[0-1]))? ?([Ss](?:[0-9]|1[0-1]))?)$/.test(vValue);
	    }

	  },
	  DataType.getType('string')
	);

	/**
	 * The position of the Grid. Can be "Left", "Center" or "Right". "Left" is default.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.GridPosition = {

		/**
		 * Grid is aligned left.
		 * @public
		 */
		Left : "Left",

		/**
		 * Grid is aligned to the right.
		 * @public
		 */
		Right : "Right",

		/**
		 * Grid is centered on the screen.
		 * @public
		 */
		Center : "Center"

	};


	/**
	 * @classdesc A string type that represents Grid's span values for large, medium and small screens. Allowed values are separated by space Letters L, M or S followed by number of columns from 1 to 12 that the container has to take, for example: "L2 M4 S6", "M12", "s10" or "l4 m4". Note that the parameters have to be provided in the order large  medium  small.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.GridSpan = DataType.createType('sap.ui.layout.GridSpan', {
	    isValid : function(vValue) {
	      return /^(([Xx][Ll](?:[1-9]|1[0-2]))? ?([Ll](?:[1-9]|1[0-2]))? ?([Mm](?:[1-9]|1[0-2]))? ?([Ss](?:[1-9]|1[0-2]))?)$/.test(vValue);
	    }

	  },
	  DataType.getType('string')
	);

		/**
		 * A string type that is used inside the BlockLayout to set predefined background color to the cells inside
		 * the control.
		 * @enum {string}
		 * @public
		 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
		 */
	sap.ui.layout.BlockBackgroundType = {
		/**
		 * Background is transparent
		 * @public
		 */
		Default: "Default",
		/**
		 * Background is with predefined light colors
		 * @public
		 */
		Light: "Light",
		/**
		 * Background with bright and dark background colors
		 * @deprecated since 1.50
		 * @public
		 */
		Mixed: "Mixed",
		/**
		 * Background with pre-defined accent colors
		 * @public
		 */
		Accent: "Accent",
		/**
		 * For applications that want to make use of e.g. charts in the Blocks, this layout type has spacings around the Blocks
		 * @public
		 */
		Dashboard: "Dashboard"
	};

	/**
	 * A string type that is used inside the BlockLayoutRow to set predefined set of colors the cells inside
	 * the control. Color sets depend on sap.ui.layout.BlockBackgroundType
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.BlockRowColorSets = {
		/**
		 * sap.ui.layout.BlockBackgroundType.Default: N/A
		 * sap.ui.layout.BlockBackgroundType.Light: Color Set 1
		 * sap.ui.layout.BlockBackgroundType.Mixed: Color Set 1
		 * sap.ui.layout.BlockBackgroundType.Accent: Color Set 1
		 * sap.ui.layout.BlockBackgroundType.Dashboard: N/A
		 * @public
		 */
		ColorSet1: "ColorSet1",
		/**
		 * sap.ui.layout.BlockBackgroundType.Default: N/A
		 * sap.ui.layout.BlockBackgroundType.Light: Color Set 2
		 * sap.ui.layout.BlockBackgroundType.Mixed: Color Set 2
		 * sap.ui.layout.BlockBackgroundType.Accent: Color Set 2
		 * sap.ui.layout.BlockBackgroundType.Dashboard: N/A
		 * @public
		 */
		ColorSet2: "ColorSet2",
		/**
		 * sap.ui.layout.BlockBackgroundType.Default: N/A
		 * sap.ui.layout.BlockBackgroundType.Light: Color Set 1
		 * sap.ui.layout.BlockBackgroundType.Mixed: Color Set 1
		 * sap.ui.layout.BlockBackgroundType.Accent: Color Set 3
		 * sap.ui.layout.BlockBackgroundType.Dashboard: N/A
		 * @public
		 */
		ColorSet3: "ColorSet3",
		/**
		 * sap.ui.layout.BlockBackgroundType.Default: N/A
		 * sap.ui.layout.BlockBackgroundType.Light: Color Set 2
		 * sap.ui.layout.BlockBackgroundType.Mixed: Color Set 2
		 * sap.ui.layout.BlockBackgroundType.Accent: Color Set 4
		 * sap.ui.layout.BlockBackgroundType.Dashboard: N/A
		 * @public
		 */
		ColorSet4: "ColorSet4"
	};


	/**
	 * A string type that is used inside the BlockLayoutCell to set a predefined set of colors for the cells.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.48
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.BlockLayoutCellColorSet = {
		/**
		 * Color Set 1
		 *
		 * @public
		 */
		ColorSet1: "ColorSet1",
		/**
		 * Color Set 2
		 *
		 * @public
		 */
		ColorSet2: "ColorSet2",
		/**
		 * Color Set 3
		 *
		 * @public
		 */
		ColorSet3: "ColorSet3",
		/**
		 * Color Set 4
		 *
		 * @public
		 */
		ColorSet4: "ColorSet4",
		/**
		 * Color Set 5
		 *
		 * @public
		 */
		ColorSet5: "ColorSet5",
		/**
		 * Color Set 6
		 *
		 * @public
		 */
		ColorSet6: "ColorSet6",
		/**
		 * Color Set 7
		 *
		 * @public
		 */
		ColorSet7: "ColorSet7",
		/**
		 * Color Set 8
		 *
		 * @public
		 */
		ColorSet8: "ColorSet8",
		/**
		 * Color Set 9
		 *
		 * @public
		 */
		ColorSet9: "ColorSet9",
		/**
		 * Color Set 10
		 *
		 * @public
		 */
		ColorSet10: "ColorSet10",
		/**
		 * Color Set 11
		 *
		 * @public
		 */
		ColorSet11: "ColorSet11"
	};

		/**
		 * A string type that is used inside the BlockLayoutCell to set a predefined set of color shades for the cells.
		 * The colors are defined with sap.ui.layout.BlockLayoutCellColorSet. And this is for the shades only.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.48
		 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
		 */
		sap.ui.layout.BlockLayoutCellColorShade = {
			/**
			 * Shade A
			 *
			 * @public
			 */
			ShadeA: "ShadeA",
			/**
			 * Shade B
			 *
			 * @public
			 */
			ShadeB: "ShadeB",
			/**
			 * Shade C
			 *
			 * @public
			 */
			ShadeC: "ShadeC",
			/**
			 * Shade D
			 *
			 * @public
			 */
			ShadeD: "ShadeD"
		};


	sap.ui.layout.form = sap.ui.layout.form || {};

	/**
	 * @classdesc A string that defines the number of used cells in a <code>GridLayout</code>. This can be a number from 1 to 16, "auto" or "full".
	 * If set to "auto" the size is determined by the number of fields and the available cells. For labels the auto size is 3 cells.
	 * If set to "full" only one field is allowed within the <code>FormElement</code>. It gets the full width of the row and the label is displayed above. <b>Note:</b> For labels full size has no effect.
	 *
	 * @namespace
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.form.GridElementCells = DataType.createType('sap.ui.layout.form.GridElementCells', {
		isValid : function(vValue) {
			return /^(auto|full|([1-9]|1[0-6]))$/.test(vValue);
			}

		},
		DataType.getType('string')
	);


	/**
	 * Available <code>FormLayouts</code> used to render a <code>SimpleForm</code>.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.16.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.form.SimpleFormLayout = {

		/**
		 * Uses the <code>ResponsiveLayout</code> layout to render the <code>SimpleForm</code> control
		 * @public
		 */
		ResponsiveLayout : "ResponsiveLayout",

		/**
		 * Uses the <code>GridLayout</code> layout to render the <code>SimpleForm</code> control
		 * @public
		 */
		GridLayout : "GridLayout",

		/**
		 * Uses the <code>ResponsiveGridLayout</code> layout to render the <code>SimpleForm</code> control
		 * @public
		 * @since 1.16.0
		 */
		ResponsiveGridLayout : "ResponsiveGridLayout",

		/**
		 * Uses the <code>ColumnLayout</code> layout to render the <code>SimpleForm</code> control
		 * @public
		 * @since 1.56.0
		 */
		ColumnLayout : "ColumnLayout"

	};

	/**
	 * Types of the DynamicSideContent Visibility options
	 *
	 * @enum {string}
	 * @public
	 * @since 1.30
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.SideContentVisibility = {
		/**
		 * Show the side content on any breakpoint
		 * @public
		 */
		AlwaysShow: "AlwaysShow",
		/**
		 * Show the side content on XL breakpoint
		 * @public
		 */
		ShowAboveL: "ShowAboveL",
		/**
		 * Show the side content on L and XL breakpoints
		 * @public
		 */
		ShowAboveM: "ShowAboveM",
		/**
		 * Show the side content on M, L and XL breakpoints
		 * @public
		 */
		ShowAboveS: "ShowAboveS",
		/**
		 * Don't show the side content on any breakpoints
		 * @public
		 */
		NeverShow: "NeverShow"
	};

	/**
	 * Types of the DynamicSideContent FallDown options
	 *
	 * @enum {string}
	 * @public
	 * @since 1.30
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.SideContentFallDown = {
		/**
		 * Side content falls down on breakpoints below XL
		 * @public
		 */
		BelowXL: "BelowXL",
		/**
		 * Side content falls down on breakpoints below L
		 * @public
		 */
		BelowL: "BelowL",
		/**
		 * Side content falls down on breakpoints below M
		 * @public
		 */
		BelowM: "BelowM",
		/**
		 * Side content falls down on breakpoint M and the minimum width for the side content
		 * @public
		 */
		OnMinimumWidth: "OnMinimumWidth"
	};

	/**
	 * The position of the side content - End (default) and Begin.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.SideContentPosition = {
		/**
		 * The side content is on the right side of the main container in left-to-right mode and on the left side in right-to-left mode.
		 * @public
		 */
		End : "End",

		/**
		 * The side content is on the left side of the main container in left-to-right mode and on the right side in right-to-left mode.
		 * @public
		 */
		Begin : "Begin"
	};

	/**
	 * @classdesc An <code>int</code> type that defines how many columns a <code>Form</code> control using
	 * the <code>ColumnLayout</code> as layout can have if it has extra-large size
	 *
	 * Allowed values are numbers from 1 to 4.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @since 1.56.0
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.form.ColumnsXL = DataType.createType('sap.ui.layout.form.ColumnsXL', {
		isValid : function(vValue) {
			if (vValue > 0 && vValue <= 4) {
				return true;
			} else {
				return false;
			}
		}

	},
	DataType.getType('int')
	);

	/**
	 * @classdesc An <code>int</code> type that defines how many columns a <code>Form</code> control using
	 * the <code>ColumnLayout</code> as layout can have if it has large size
	 *
	 * Allowed values are numbers from 1 to 3.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @since 1.56.0
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.form.ColumnsL = DataType.createType('sap.ui.layout.form.ColumnsL', {
		isValid : function(vValue) {
			if (vValue > 0 && vValue <= 3) {
				return true;
			} else {
				return false;
			}
		}

	},
	DataType.getType('int')
	);

	/**
	 * @classdesc An <code>int</code> type that defines how many columns a <code>Form</code> control using
	 * the <code>ColumnLayout</code> as layout can have if it has medium size
	 *
	 * Allowed values are numbers from 1 to 2.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @since 1.56.0
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.form.ColumnsM = DataType.createType('sap.ui.layout.form.ColumnsM', {
		isValid : function(vValue) {
			if (vValue > 0 && vValue <= 2) {
				return true;
			} else {
				return false;
			}
		}

	},
	DataType.getType('int')
	);

	/**
	 * @classdesc An <code>int</code> type that defines how many cells a control inside of a column
	 * of a <code>Form</code> control using the <code>ColumnLayout</code> control as layout can use.
	 *
	 * Allowed values are numbers from 1 to 12.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @since 1.56.0
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.form.ColumnCells = DataType.createType('sap.ui.layout.form.ColumnCells', {
		isValid : function(vValue) {
			if (vValue > 0 && vValue <= 12) {
				return true;
			} else {
				return false;
			}
		}

	},
	DataType.getType('int')
	);

	/**
	 * @classdesc An <code>int</code> type that defines how many cells beside the controls
	 * inside of a column of a <code>Form</code> control using the <code>ColumnLayout</code> control as layout
	 * are empty.
	 *
	 * Allowed values are numbers from 0 to 11.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @since 1.56.0
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.form.EmptyCells = DataType.createType('sap.ui.layout.form.EmptyCells', {
		isValid : function(vValue) {
			if (vValue >= 0 && vValue < 12) {
				return true;
			} else {
				return false;
			}
		}

	},
	DataType.getType('int')
	);

	// factory for Form to create labels and buttons to be overwritten by commons and mobile library
	if (!sap.ui.layout.form.FormHelper) {
		sap.ui.layout.form.FormHelper = {
			createLabel: function(sText){ throw new Error("no Label control available!"); }, /* must return a Label control */
			createButton: function(sId, fPressFunction, fnCallback){ throw new Error("no Button control available!"); }, /* must return a button control */
			setButtonContent: function(oButton, sText, sTooltip, sIcon, sIconHovered){ throw new Error("no Button control available!"); },
			addFormClass: function(){ return null; },
			setToolbar: function(oToolbar){ return oToolbar; }, /* allow to overwrite toolbar settings */
			bArrowKeySupport: true, /* enables the keyboard support for arrow keys */
			bFinal: false /* if true, the helper must not be overwritten by an other library */
		};
	}

	return sap.ui.layout;

});
