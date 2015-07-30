/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.layout.
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/base/DataType',
	'sap/ui/core/library'], // library dependency
	function(jQuery, DataType) {

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
		dependencies : ["sap.ui.core"],
		types: [
			"sap.ui.layout.GridIndent",
			"sap.ui.layout.GridPosition",
			"sap.ui.layout.GridSpan",
			"sap.ui.layout.form.GridElementCells",
			"sap.ui.layout.form.SimpleFormLayout"
		],
		interfaces: [],
		controls: [
			"sap.ui.layout.DynamicSideContent",
			"sap.ui.layout.FixFlex",
			"sap.ui.layout.Grid",
			"sap.ui.layout.HorizontalLayout",
			"sap.ui.layout.ResponsiveFlowLayout",
			"sap.ui.layout.Splitter",
			"sap.ui.layout.VerticalLayout",
			"sap.ui.layout.form.Form",
			"sap.ui.layout.form.FormLayout",
			"sap.ui.layout.form.GridLayout",
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
			"sap.ui.layout.form.GridElementData"
		]
	});


	/**
	 * @classdesc A string type that represents Grid's indent values for large, medium and small screens. Allowed values are separated by space Letters L, M or S followed by number of columns from 1 to 11 that the container has to take, for example: "L2 M4 S6", "M12", "s10" or "l4 m4". Note that the parameters has to be provided in the order large  medium  small.
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
	 * Position of the Grid. Can be "Left", "Center" or "Right". "Left" is default.
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
	 * @classdesc A string type that represents Grid's span values for large, medium and small screens. Allowed values are separated by space Letters L, M or S followed by number of columns from 1 to 12 that the container has to take, for example: "L2 M4 S6", "M12", "s10" or "l4 m4". Note that the parameters has to be provided in the order large  medium  small.
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


	sap.ui.layout.form = sap.ui.layout.form || {};

	/**
	 * @classdesc A string that defines the number of used cells in a GridLayout. This can be a number from 1 to 16, "auto" or "full".
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
	 * Available FormLayouts used for the SimpleForm.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.16.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.layout.form.SimpleFormLayout = {

		/**
		 * Uses the ResponsiveLayout for the SimpleForm
		 * @public
		 */
		ResponsiveLayout : "ResponsiveLayout",

		/**
		 * Uses the GridLayout for the SimpleForm
		 * @public
		 */
		GridLayout : "GridLayout",

		/**
		 * Uses the ResponsiveGridLayout for the SimpleForm
		 * @public
		 * @since 1.16.0
		 */
		ResponsiveGridLayout : "ResponsiveGridLayout"

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
		 * Don't Show the side content on any breakpoints
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

	// factory for Form to create labels an buttons to be overwritten by commons and mobile library
	if (!sap.ui.layout.form.FormHelper) {
		sap.ui.layout.form.FormHelper = {
			createLabel: function(sText){ throw new Error("no Label control available!"); }, /* must return a Label control */
			createButton: function(sId, fPressFunction, oThis){ throw new Error("no Button control available!"); }, /* must return a button control */
			setButtonContent: function(oButton, sText, sTooltip, sIcon, sIconHovered){ throw new Error("no Button control available!"); },
			addFormClass: function(){ return null; },
			bArrowKeySupport: true, /* enables the keyboard support for arrow keys */
			bFinal: false /* if true, the helper must not be overwritten by an other library */
		};
	}

	return sap.ui.layout;

});
