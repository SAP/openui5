/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.f.
 */
sap.ui.define(["sap/ui/base/DataType",
	"sap/ui/Global",
	"sap/ui/core/library",
	"sap/m/library"], // library dependency
	function(DataType) {

	"use strict";

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.f",
		version: "${version}",
		dependencies : ["sap.ui.core", "sap.m", "sap.ui.layout"],
		designtime: "sap/f/designtime/library.designtime",
		types: [
			"sap.f.LayoutType",
			"sap.f.DynamicPageTitleArea",
			"sap.f.DynamicPageTitleShrinkRatio"
		],
		controls: [
			"sap.f.Avatar",
			"sap.f.Card",
			"sap.f.DynamicPage",
			"sap.f.DynamicPageHeader",
			"sap.f.DynamicPageTitle",
			"sap.f.FlexibleColumnLayout",
			"sap.f.semantic.SemanticPage",
			"sap.f.GridList"
		],
		elements: [
			"sap.f.semantic.AddAction",
			"sap.f.semantic.CloseAction",
			"sap.f.semantic.CopyAction",
			"sap.f.semantic.DeleteAction",
			"sap.f.semantic.DiscussInJamAction",
			"sap.f.semantic.EditAction",
			"sap.f.semantic.ExitFullScreenAction",
			"sap.f.semantic.FavoriteAction",
			"sap.f.semantic.FlagAction",
			"sap.f.semantic.FooterMainAction",
			"sap.f.semantic.FullScreenAction",
			"sap.f.semantic.MessagesIndicator",
			"sap.f.semantic.NegativeAction",
			"sap.f.semantic.PositiveAction",
			"sap.f.semantic.PrintAction",
			"sap.f.semantic.SemanticButton",
			"sap.f.semantic.SemanticControl",
			"sap.f.semantic.SemanticToggleButton",
			"sap.f.semantic.SendEmailAction",
			"sap.f.semantic.SendMessageAction",
			"sap.f.semantic.ShareInJamAction",
			"sap.f.semantic.TitleMainAction"
		],
		extensions: {
			flChangeHandlers: {
				"sap.f.Avatar" : {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.f.DynamicPageHeader" : {
					"hideControl": "default",
					"unhideControl": "default",
					"moveControls": "default"
				},
				"sap.f.DynamicPageTitle" : "sap/f/flexibility/DynamicPageTitle",
				"sap.f.semantic.SemanticPage" : {
					"moveControls": "default"
				}
			},
			//Configuration used for rule loading of Support Assistant
			"sap.ui.support": {
				publicRules: true,
				internalRules:true
			}
		}
	});

	/**
	 * SAPUI5 library with controls specialized for SAP Fiori apps.
	 *
	 * @namespace
	 * @alias sap.f
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	var thisLib = sap.f;

	/**
	* Defines the areas within the <code>sap.f.DynamicPageTitle</code>.
	*
	* @enum {string}
	* @public
	* @since 1.50
	* @deprecated Since version 1.54
	* @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	*/
	thisLib.DynamicPageTitleArea = {
		/**
		* The area includes the <code>heading</code>, <code>expandedContent</code> and <code>snappedContent</code> aggregations,
		* positioned in the beginning area of the {@link sap.f.DynamicPageTitle}.
		*
		* @public
		*/
		Begin: "Begin",

		/**
		* The area includes the <code>content</code> aggregation,
		* positioned in the middle part of the {@link sap.f.DynamicPageTitle}.
		*
		* @public
		*/
		Middle: "Middle"
	};

	/**
	* @classdesc A string type that represents the shrink ratios of the areas within the <code>sap.f.DynamicPageTitle</code>.
	*
	* @namespace
	* @public
	* @since 1.54
	* @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	*/
	thisLib.DynamicPageTitleShrinkRatio = DataType.createType('sap.f.DynamicPageTitleShrinkRatio', {
		isValid : function(vValue) {
			return /^(([0-9]\d*)(\.\d)?:([0-9]\d*)(\.\d)?:([0-9]\d*)(\.\d)?)$/.test(vValue);
		}

	}, DataType.getType('string'));

	/**
	 * Layouts, representing the number of columns to be displayed and their relative widths for a {@link sap.f.FlexibleColumnLayout} control.
	 *
	 * Each layout has a predefined ratio for the three columns, depending on device size. Based on the device and layout, some columns are hidden.
	 * For more information, refer to the ratios (in %) for each value, listed below: (dash "-" means non-accessible columns).
	 *
	 * <b>Note:</b> Please note that on a phone device, due to the limited screen size, only one column can be displayed at a time.
	 * For all two-column layouts, this column is the <code>Mid</code> column, and for all three-column layouts - the <code>End</code> column,
	 * even though the respective column may be hidden on desktop and tablet for that particular layout. Therefore some of the names
	 * (such as <code>ThreeColumnsMidExpandedEndHidden</code> for example) are representative of the desktop scenario only.
	 *
	 * For more information, see {@link topic:3b9f760da5b64adf8db7f95247879086 Types of Layout} in the documentation.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.46
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.LayoutType = {

		/**
		 * Desktop: 100/-/-  only the Begin column is displayed
		 *
		 * Tablet:  100/-/-  only the Begin column is displayed
		 *
		 * Phone:   100/-/-  only the Begin column is displayed
		 *
		 * Use to start with a master page.
		 *
		 * @public
		 */
		OneColumn: "OneColumn",

		/**
		 * Desktop: 67/33/-  Begin (expanded) and Mid columns are displayed
		 *
		 * Tablet:  67/33/-  Begin (expanded) and Mid columns are displayed
		 *
		 * Phone:   -/100/-  only the Mid column is displayed
		 *
		 * Use to display both a master and a detail page when the user should focus on the master page.
		 *
		 * @public
		 */
		TwoColumnsBeginExpanded: "TwoColumnsBeginExpanded",

		/**
		 * Desktop: 33/67/-  Begin and Mid (expanded) columns are displayed
		 *
		 * Tablet:  33/67/-  Begin and Mid (expanded) columns are displayed
		 *
		 * Phone:   -/100/-  only the Mid column is displayed
		 *
		 * Use to display both a master and a detail page when the user should focus on the detail page.
		 *
		 * @public
		 */
		TwoColumnsMidExpanded: "TwoColumnsMidExpanded",

		/**
		 * Desktop: -/100/-  only the Mid column is displayed
		 *
		 * Tablet:  -/100/-  only the Mid column is displayed
		 *
		 * Phone:   -/100/-  only the Mid column is displayed
		 *
		 * Use to display a detail page only, when the user should focus entirely on it.
		 *
		 * @public
		 */
		MidColumnFullScreen: "MidColumnFullScreen",

		/**
		 * Desktop: 25/50/25 Begin, Mid (expanded) and End columns are displayed
		 *
		 * Tablet:  0/67/33  Mid (expanded) and End columns are displayed, Begin is accessible by a layout arrow
		 *
		 * Phone:   -/-/100  only the End column is displayed
		 *
		 * Use to display all three pages (master, detail, detail-detail) when the user should focus on the detail.
		 *
		 * @public
		 */
		ThreeColumnsMidExpanded: "ThreeColumnsMidExpanded",

		/**
		 * Desktop: 25/25/50 Begin, Mid and End (expanded) columns are displayed
		 *
		 * Tablet:  0/33/67  Mid and End (expanded) columns are displayed, Begin is accessible by layout arrows
		 *
		 * Phone:   -/-/100  (only the End column is displayed)
		 *
		 * Use to display all three pages (master, detail, detail-detail) when the user should focus on the detail-detail.
		 *
		 * @public
		 */
		ThreeColumnsEndExpanded: "ThreeColumnsEndExpanded",

		/**
		 * Desktop: 33/67/0  Begin and Mid (expanded) columns are displayed, End is accessible by a layout arrow
		 *
		 * Tablet:  33/67/0  Begin and Mid (expanded) columns are displayed, End is accessible by a layout arrow
		 *
		 * Phone:   -/-/100  only the End column is displayed
		 *
		 * Use to display the master and detail pages when the user should focus on the detail.
		 * The detail-detail is still loaded and easily accessible with a layout arrow.
		 *
		 * @public
		 */
		ThreeColumnsMidExpandedEndHidden: "ThreeColumnsMidExpandedEndHidden",

		/**
		 * Desktop: 67/33/0  Begin (expanded) and Mid columns are displayed, End is accessible by layout arrows
		 *
		 * Tablet:  67/33/0  Begin (expanded) and Mid columns are displayed, End is accessible by layout arrows
		 *
		 * Phone:   -/-/100  only the End column is displayed
		 *
		 * Use to display the master and detail pages when the user should focus on the master.
		 * The detail-detail is still loaded and easily accessible with layout arrows.
		 *
		 * @public
		 */
		ThreeColumnsBeginExpandedEndHidden: "ThreeColumnsBeginExpandedEndHidden",

		/**
		 * Desktop: -/-/100  only the End column is displayed
		 *
		 * Tablet:  -/-/100  only the End column is displayed
		 *
		 * Phone:   -/-/100  only the End column is displayed
		 *
		 * Use to display a detail-detail page only, when the user should focus entirely on it.
		 *
		 * @public
		 */
		EndColumnFullScreen: "EndColumnFullScreen"
	};

	sap.ui.lazyRequire("sap.f.routing.Router");
	sap.ui.lazyRequire("sap.f.routing.Target");
	sap.ui.lazyRequire("sap.f.routing.TargetHandler");
	sap.ui.lazyRequire("sap.f.routing.Targets");

	/**
	 * Types of shape for the {@link sap.f.Avatar} control.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.46
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.AvatarShape = {
		/**
		 * Circular shape.
		 * @public
		 */
		Circle: "Circle",

		/**
		 * Square shape.
		 * @public
		 */
		Square: "Square"
	};

	/**
	 * Predefined sizes for the {@link sap.f.Avatar} control.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.46
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.AvatarSize = {
		/**
		 * Control size - 2rem
		 * Font size - 0.75rem
		 * @public
		 */
		XS: "XS",

		/**
		 * Control size - 3rem
		 * Font size - 1.125rem
		 * @public
		 */
		S: "S",

		/**
		 * Control size - 4rem
		 * Font size - 1.625rem
		 * @public
		 */
		M: "M",

		/**
		 * Control size - 5rem
		 * Font size - 2rem
		 * @public
		 */
		L: "L",

		/**
		 * Control size - 7rem
		 * Font size - 2.75rem
		 * @public
		 */
		XL: "XL",

		/**
		 * Custom size
		 * @public
		 */
		Custom: "Custom"
	};

	/**
	 * Types of {@link sap.f.Avatar} based on the displayed content.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.46
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.AvatarType = {
		/**
		 * The displayed content is an icon.
		 * @public
		 */
		Icon: "Icon",
		/**
		 * The displayed content is an image.
		 * @public
		 */
		Image: "Image",
		/**
		 * The displayed content is initials.
		 * @public
		 */
		Initials: "Initials"
	};
	/**
	 * Types of image size and position that determine how an image fits in the {@link sap.f.Avatar} control area.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.46
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.AvatarImageFitType = {
		/**
		 * The image is scaled to be large enough so that the control area is completely covered.
		 * @public
		 */
		Cover: "Cover",
		/**
		 * The image is scaled to the largest size so that both its width and height can fit in the control area.
		 * @public
		 */
		Contain: "Contain"
	};

	return thisLib;

});
