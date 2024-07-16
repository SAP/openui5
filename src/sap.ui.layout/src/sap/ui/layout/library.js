/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.layout.
 */
sap.ui.define([
	'sap/ui/base/DataType',
	'sap/ui/core/Lib',
	'sap/ui/core/library'], // library dependency
	function(DataType, Library, library) {
	 "use strict";

	 /**
	  * SAPUI5 library with layout controls.
	  *
	  * @namespace
	  * @alias sap.ui.layout
	  * @author SAP SE
	  * @version ${version}
	  * @since 1.15
	  * @public
	  */
	 var thisLib = Library.init({
		 apiVersion: 2,
		 name : "sap.ui.layout",
		 version: "${version}",
		 dependencies: ["sap.ui.core"],
		 designtime: "sap/ui/layout/designtime/library.designtime",
		 types: [
			 "sap.ui.layout.BackgroundDesign",
			 "sap.ui.layout.BlockBackgroundType",
			 "sap.ui.layout.BlockLayoutCellColorSet",
			 "sap.ui.layout.BlockLayoutCellColorShade",
			 "sap.ui.layout.BlockRowColorSets",
			 "sap.ui.layout.BoxesPerRowConfig",
			 "sap.ui.layout.GridIndent",
			 "sap.ui.layout.GridPosition",
			 "sap.ui.layout.GridSpan",
			 "sap.ui.layout.SideContentFallDown",
			 "sap.ui.layout.SideContentPosition",
			 "sap.ui.layout.SideContentVisibility",
			 "sap.ui.layout.form.ColumnsXL",
			 "sap.ui.layout.form.ColumnsL",
			 "sap.ui.layout.form.ColumnsM",
			 "sap.ui.layout.form.ColumnCells",
			 "sap.ui.layout.form.EmptyCells",
			 "sap.ui.layout.form.GridElementCells",
			 "sap.ui.layout.form.SimpleFormLayout",
			 "sap.ui.layout.cssgrid.CSSGridAutoFlow",
			 "sap.ui.layout.cssgrid.CSSGridTrack",
			 "sap.ui.layout.cssgrid.CSSGridLine",
			 "sap.ui.layout.cssgrid.CSSGridGapShortHand"
		 ],
		 interfaces: [
			 "sap.ui.layout.cssgrid.IGridConfigurable",
			 "sap.ui.layout.cssgrid.IGridItemLayoutData"
		 ],
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
		  "sap.ui.layout.form.ColumnLayout",
		  "sap.ui.layout.form.ResponsiveGridLayout",
		  "sap.ui.layout.form.SimpleForm",
		  "sap.ui.layout.cssgrid.CSSGrid"
		 ],
		 elements: [
		  "sap.ui.layout.BlockLayoutCellData",
		  "sap.ui.layout.GridData",
		  "sap.ui.layout.ResponsiveFlowLayoutData",
		  "sap.ui.layout.SplitterLayoutData",
		  "sap.ui.layout.form.FormContainer",
		  "sap.ui.layout.form.FormElement",
		  "sap.ui.layout.PaneContainer",
		  "sap.ui.layout.SplitPane",
		  "sap.ui.layout.form.ColumnElementData",
		  "sap.ui.layout.form.ColumnContainerData",
		  "sap.ui.layout.cssgrid.GridItemLayoutData"
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
	  * Defines the functions that need to be implemented by a Control which wants
	  * to have display:grid behavior via sap.ui.layout.cssgrid.GridLayoutDelegate
	  *
	  * @since 1.60.0
	  * @public
	  * @interface
	  * @name sap.ui.layout.cssgrid.IGridConfigurable
	  */

	 /**
	  * The function is used by GridLayoutDelegate to determine on which HTML Elements the display:grid styles should be applied
	  *
	  * @returns {sap.ui.core.Control[]|HTMLElement[]} The controls or HTML elements on which display:grid styles should be applied
	  * @since 1.60.0
	  * @public
	  * @function
	  * @name sap.ui.layout.cssgrid.IGridConfigurable.getGridDomRefs
	  */

	 /**
	  * The function is used by GridLayoutDelegate to get the grid layout (display:grid styles) to apply
	  *
	  * @returns {sap.ui.layout.cssgrid.GridLayoutBase} The display:grid layout to apply
	  * @since 1.60.0
	  * @public
	  * @function
	  * @name sap.ui.layout.cssgrid.IGridConfigurable.getGridLayoutConfiguration
	  */

	 /**
	  * LayoutData for grid items
	  *
	  * @since 1.88.0
	  * @public
	  * @interface
	  * @name sap.ui.layout.cssgrid.IGridItemLayoutData
	  */

	 /**
	  * Available Background Design.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.36.0
	  */
	 thisLib.BackgroundDesign = {

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
	  * @classdesc
	  * A string type that represents the indent values of the <code>Grid</code> for large, medium and small screens.
	  *
	  * Allowed values are separated by space with case insensitive Letters XL, L, M or S followed by number of columns from 1 to 11
	  * that the container has to take, for example: <code>L2 M4 S6</code>, <code>M11</code>, <code>s10</code>
	  * or <code>l4 m4</code>.
	  *
	  * <b>Note:</b> The parameters must be provided in the order <large medium small>.
	  *
	  * @final
	  * @namespace
	  * @public
	  */
	 thisLib.GridIndent = DataType.createType('sap.ui.layout.GridIndent', {
		 isValid : function(vValue) {
		   return /^(([Xx][Ll](?:[0-9]|1[0-1]))? ?([Ll](?:[0-9]|1[0-1]))? ?([Mm](?:[0-9]|1[0-1]))? ?([Ss](?:[0-9]|1[0-1]))?)$/.test(vValue);
		 }

	   },
	   DataType.getType('string')
	 );

	 /**
	  * The position of the {@link sap.ui.layout.Grid}. Can be <code>Left</code> (default), <code>Center</code>
	  * or <code>Right</code>.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.GridPosition = {

		 /**
		  * <code>Grid</code> is aligned left.
		  * @public
		  */
		 Left : "Left",

		 /**
		  * <code>Grid</code> is aligned to the right.
		  * @public
		  */
		 Right : "Right",

		 /**
		  * <code>Grid</code> is centered on the screen.
		  * @public
		  */
		 Center : "Center"

	 };


	 /**
	  * @classdesc
	  * A string type that represents the span values of the <code>Grid</code> for large, medium and small screens.
	  *
	  * Allowed values are separated by space with case insensitive Letters XL, L, M or S followed by number of columns from 1 to 12
	  * that the container has to take, for example: <code>L2 M4 S6</code>, <code>M12</code>,
	  * <code>s10</code> or <code>l4 m4</code>.
	  *
	  * <b>Note:</b> The parameters must be provided in the order <large medium small>.
	  *
	  * @final
	  * @namespace
	  * @public
	  */
	 thisLib.GridSpan = DataType.createType('sap.ui.layout.GridSpan', {
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
	  */
	 thisLib.BlockBackgroundType = {
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
	  */
	 thisLib.BlockRowColorSets = {
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
	  */
	 thisLib.BlockLayoutCellColorSet = {
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
	  */
	 thisLib.BlockLayoutCellColorShade = {
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
		 ShadeD: "ShadeD",
		 /**
		  * Shade E - available only for SAP Quartz and Horizon themes
		  *
		  * @public
		  */
		 ShadeE: "ShadeE",
		 /**
		  * Shade F - available only for SAP Quartz and Horizon themes
		  *
		  * @public
		  */
		 ShadeF: "ShadeF"
	 };


	 thisLib.form = thisLib.form || {};


	 /**
	  * Available <code>FormLayouts</code> used to render a <code>SimpleForm</code>.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.16.0
	  */
	 thisLib.form.SimpleFormLayout = {
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
	  */
	 thisLib.SideContentVisibility = {
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
	  */
	 thisLib.SideContentFallDown = {
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
	  */
	 thisLib.SideContentPosition = {
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
	  * Allowed values are numbers from 1 to 6.
	  * <b>Note:</b> In versions lower than 1.89 only 4 columns are allowed.
	  *
	  * @final
	  * @namespace
	  * @public
	  * @since 1.56.0
	  */
	 thisLib.form.ColumnsXL = DataType.createType('sap.ui.layout.form.ColumnsXL', {
		 isValid : function(vValue) {
			 if (vValue > 0 && vValue <= 6) {
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
	  * Allowed values are numbers from 1 to 4.
	  * <b>Note:</b> In versions lower than 1.122 only 3 columns are allowed.
	  *
	  * @final
	  * @namespace
	  * @public
	  * @since 1.56.0
	  */
	 thisLib.form.ColumnsL = DataType.createType('sap.ui.layout.form.ColumnsL', {
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
	  * the <code>ColumnLayout</code> as layout can have if it has medium size
	  *
	  * Allowed values are numbers from 1 to 3.
	  * <b>Note:</b> In versions lower than 1.122 only 2 columns are allowed.
	  *
	  * @final
	  * @namespace
	  * @public
	  * @since 1.56.0
	  */
	 thisLib.form.ColumnsM = DataType.createType('sap.ui.layout.form.ColumnsM', {
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
	  * @classdesc An <code>int</code> type that defines how many cells a control inside of a column
	  * of a <code>Form</code> control using the <code>ColumnLayout</code> control as layout can use.
	  *
	  * Allowed values are numbers from 1 to 12 and -1. -1 means the value is calculated.
	  *
	  * @final
	  * @namespace
	  * @public
	  * @since 1.56.0
	  */
	 thisLib.form.ColumnCells = DataType.createType('sap.ui.layout.form.ColumnCells', {
		 isValid : function(vValue) {
			 if (vValue === -1) {
				 return true;
			 } else if (vValue > 0 && vValue <= 12) {
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
	  */
	 thisLib.form.EmptyCells = DataType.createType('sap.ui.layout.form.EmptyCells', {
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

	 thisLib.cssgrid = thisLib.cssgrid || {};

	 /**
	  * @classdesc A string type that represents a grid track (the space between two grid lines)
	  *
	  * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Grid_tracks}
	  * @since 1.60.0
	  * @public
	  * @namespace
	  * @final
	  */
	 thisLib.cssgrid.CSSGridTrack = DataType.createType("sap.ui.layout.cssgrid.CSSGridTrack", {
			 isValid: function (sValue) {
				 var sCSSSizeRegex = /(auto|inherit|(([0-9]+|[0-9]*\.[0-9]+)([rR][eE][mM]|[eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|[vV][wW]|[vV][hH]|[vV][mM][iI][nN]|[vV][mM][aA][xX]|%))|calc\(\s*(\(\s*)*[-+]?(([0-9]+|[0-9]*\.[0-9]+)([rR][eE][mM]|[eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|[vV][wW]|[vV][hH]|[vV][mM][iI][nN]|[vV][mM][aA][xX]|%)?)(\s*(\)\s*)*(\s[-+]\s|[*\/])\s*(\(\s*)*([-+]?(([0-9]+|[0-9]*\.[0-9]+)([rR][eE][mM]|[eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|[vV][wW]|[vV][hH]|[vV][mM][iI][nN]|[vV][mM][aA][xX]|%)?)))*\s*(\)\s*)*\))/g;

				 // Remove valid keywords that can be used as part of a grid track property value
				 sValue = sValue.replace(/(minmax|repeat|fit-content|max-content|min-content|auto-fill|auto-fit|fr|min|max)/g, "");
				 // Remove valid CSSSizes
				 sValue = sValue.replace(sCSSSizeRegex, "");
				 // Remove expression syntax
				 sValue = sValue.replace(/\(|\)|\+|\-|\*|\/|calc|\%|\,/g, "");
				 // Remove any number leftovers which are not CSSSizes
				 sValue = sValue.replace(/[0-9]/g, "");
				 // Remove whitespace
				 sValue = sValue.replace(/\s/g, "");

				 return sValue.length === 0;
			 },
			 parseValue: function (sValue) {
				 return sValue.trim().split(/\s+/).join(" ");
			 }
		 },
		 DataType.getType("string")
	 );

	 /**
	  * @classdesc A string type that represents a short hand CSS grid gap.
	  *
	  * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/gap}
	  * @since 1.60.0
	  * @public
	  * @namespace
	  * @final
	  */
	 thisLib.cssgrid.CSSGridGapShortHand = DataType.createType("sap.ui.layout.cssgrid.CSSGridGapShortHand", {
			 isValid: function (vValue) {
				 var bResult = true,
					 aValues = vValue.split(/\s+/);

				 aValues.forEach(function (sValue) {
					 if (!library.CSSSize.isValid(sValue)) {
						 bResult = false;
					 }
				 });

				 return bResult;
			 },
			 parseValue: function (sValue) {
				 return sValue.trim().split(/\s+/).join(" ");
			 }
		 },
		 DataType.getType("string")
	 );

	 /**
	  * @classdesc A string type that represents one or two grid lines. Used to define the position and size of a single grid item.
	  *
	  * Valid values:
	  * <ul>
	  * <li>auto</li>
	  * <li>inherit</li>
	  * <li>1</li>
	  * <li>span 2</li>
	  * <li>span 2 / 5</li>
	  * <li>span 2 / -5</li>
	  * <li>5 / 7</li>
	  * <li>7 / span 5</li>
	  * <li>span 7 / span 5</li>
	  * </ul>
	  *
	  * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Grid_lines MDN web docs: grid lines}
	  * @since 1.60.0
	  * @public
	  * @namespace
	  * @final
	  */
	 thisLib.cssgrid.CSSGridLine = DataType.createType("sap.ui.layout.cssgrid.CSSGridLine", {
			 isValid: function (sValue) {
				 return /^(auto|inherit|((span)?(\s)?-?[0-9]+(\s\/\s(span)?(\s)?-?[0-9]*)?)?)$/.test(sValue);
			 }
		 },
		 DataType.getType("string")
	 );

	 /**
	  * A string type that is used for CSS grid to control how the auto-placement algorithm works,
	  * specifying exactly how auto-placed items get flowed into the grid.
	  *
	  * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow}
	  * @enum {string}
	  * @since 1.60.0
	  * @public
	  */
	 thisLib.cssgrid.CSSGridAutoFlow = {

		 /**
		  * Insert auto-placed items by filling each row.
		  * @public
		  */
		 Row: "Row",

		 /**
		  * Insert auto-placed items by filling each column.
		  * @public
		  */
		 Column: "Column",

		 /**
		  * Insert auto-placed items by filling each row, and fill any holes in the grid.
		  * @public
		  */
		 RowDense: "RowDense",

		 /**
		  * Insert auto-placed items by filling each column, and fill any holes in the grid.
		  * @public
		  */
		 ColumnDense: "ColumnDense"
	 };

	 /**
	  * @classdesc A string type that represents how many boxes per row should be displayed for each screen size. The breakpoints are for extra large (XL), large (L), medium (M) and small (S) screen sizes.
	  *
	  * <b>Note:</b> The parameters must be provided in the order <XL L M S>.
	  *
	  * @example <code>XL7 L6 M4 S2</code>
	  * @example <code>XL12 L12 M12 S1</code>
	  * @since 1.61.0
	  * @public
	  * @namespace
	  * @final
	  */
	 thisLib.BoxesPerRowConfig = DataType.createType("sap.ui.layout.BoxesPerRowConfig", {
			 isValid : function(vValue) {
				 return /^(([Xx][Ll](?:[1-9]|1[0-2]))? ?([Ll](?:[1-9]|1[0-2]))? ?([Mm](?:[1-9]|1[0-2]))? ?([Ss](?:[1-9]|1[0-2]))?)$/.test(vValue);
			 }
		 },
		 DataType.getType("string")
	 );

	 /**
	  * Register the above listed enum types.
	  */
	 DataType.registerEnum("sap.ui.layout.BackgroundDesign", thisLib.BackgroundDesign);
	 DataType.registerEnum("sap.ui.layout.BlockBackgroundType", thisLib.BlockBackgroundType);
	 DataType.registerEnum("sap.ui.layout.BlockLayoutCellColorSet", thisLib.BlockLayoutCellColorSet);
	 DataType.registerEnum("sap.ui.layout.BlockLayoutCellColorShade", thisLib.BlockLayoutCellColorShade);
	 DataType.registerEnum("sap.ui.layout.BlockRowColorSets", thisLib.BlockRowColorSets);
	 DataType.registerEnum("sap.ui.layout.GridPosition", thisLib.GridPosition);
	 DataType.registerEnum("sap.ui.layout.SideContentFallDown", thisLib.SideContentFallDown);
	 DataType.registerEnum("sap.ui.layout.SideContentPosition", thisLib.SideContentPosition);
	 DataType.registerEnum("sap.ui.layout.SideContentVisibility", thisLib.SideContentVisibility);
	 DataType.registerEnum("sap.ui.layout.form.SimpleFormLayout", thisLib.form.SimpleFormLayout);
	 DataType.registerEnum("sap.ui.layout.cssgrid.CSSGridAutoFlow", thisLib.cssgrid.CSSGridAutoFlow);

	 return thisLib;
	});
