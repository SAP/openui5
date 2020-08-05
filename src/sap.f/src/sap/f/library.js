/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.f.
 */
sap.ui.define(["sap/ui/base/DataType",
	"sap/m/AvatarShape",
	"sap/m/AvatarSize",
	"sap/m/AvatarType",
	"sap/m/AvatarColor",
	"sap/m/AvatarImageFitType",
	"sap/m/library", // library dependency
	"sap/ui/Global",
	"sap/ui/core/library",
	"sap/ui/layout/library"], // library dependency
	function(DataType,
			 AvatarShape,
			 AvatarSize,
			 AvatarType,
			 AvatarColor,
			 AvatarImageFitType) {

	"use strict";

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.f",
		version: "${version}",
		dependencies : ["sap.ui.core", "sap.m", "sap.ui.layout"],
		designtime: "sap/f/designtime/library.designtime",
		interfaces: [
			"sap.f.cards.IHeader",
			"sap.f.ICard",
			"sap.f.IShellBar",
			"sap.f.IDynamicPageStickyContent",
			"sap.f.dnd.IGridDroppable"
		],
		types: [
			"sap.f.AvatarImageFitType",
			"sap.f.AvatarShape",
			"sap.f.AvatarSize",
			"sap.f.AvatarType",
			"sap.f.AvatarColor",
			"sap.f.AvatarGroupType",
			"sap.f.cards.HeaderPosition",
			"sap.f.DynamicPageTitleArea",
			"sap.f.DynamicPageTitleShrinkRatio",
			"sap.f.LayoutType"
		],
		controls: [
			"sap.f.Avatar",
			"sap.f.AvatarGroup",
			"sap.f.AvatarGroupItem",
			"sap.f.cards.Header",
			"sap.f.cards.NumericHeader",
			"sap.f.cards.NumericSideIndicator",
			"sap.f.Card",
			"sap.f.GridContainer",
			"sap.f.DynamicPage",
			"sap.f.DynamicPageHeader",
			"sap.f.DynamicPageTitle",
			"sap.f.FlexibleColumnLayout",
			"sap.f.semantic.SemanticPage",
			"sap.f.GridList",
			"sap.f.GridListItem",
			"sap.f.PlanningCalendarInCard",
			"sap.f.PlanningCalendarInCardLegend",
			"sap.f.ProductSwitch",
			"sap.f.ProductSwitchItem",
			"sap.f.ShellBar"
		],
		elements: [
			"sap.f.DynamicPageAccessibleLandmarkInfo",
			"sap.f.GridContainerItemLayoutData",
			"sap.f.PlanningCalendarInCardRow",
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
			"sap.f.semantic.MainAction",
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
			"sap.f.semantic.TitleMainAction",
			"sap.f.SearchManager"
		],
		extensions: {
			flChangeHandlers: {
				"sap.f.Avatar" : "sap/f/flexibility/Avatar",
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
	* Defines the areas within the <code>sap.f.DynamicPageTitle</code> control.
	*
	* @enum {string}
	* @public
	* @since 1.50
	* @deprecated Since version 1.54. Consumers of the {@link sap.f.DynamicPageTitle} control should now use
	*   the <code>areaShrinkRatio</code> property instead of the <code>primaryArea</code> property.
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
	 * @deprecated as of version 1.73. Use the {@link sap.m.AvatarShape} instead.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.AvatarShape = AvatarShape;

	/**
	 * Predefined sizes for the {@link sap.f.Avatar} control.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.73. Use the {@link sap.m.AvatarSize} instead.
	 * @since 1.46
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.AvatarSize = AvatarSize;

	/**
	 * Interface for controls suitable for the <code>stickySubheaderProvider</code>
	 * association of <code>{@link sap.f.DynamicPage}</code>.
	 *
	 * Controls that implemenet this interface should have the following methods:
	 * <ul>
	 * <li><code>_getStickyContent</code> - returns the content (control) used in the
	 * subheader</li>
	 * <li><code>_returnStickyContent</code> - ensures that the content (control) returned by <code>_getStickyContent</code>,
	 * is placed back in its place in the provider</li>
	 * <li><code>_getStickySubHeaderSticked</code> - returns boolean value that shows
	 * where the sticky content is placed (in its provider or in the
	 * <code>DynamicPage</code>)</li>
	 * <li><code>_setStickySubHeaderSticked</code> - accepts a boolean argument to notify
	 * the provider where its sticky content is placed</li>
	 * </ul>
	 *
	 * @since 1.65
	 * @name sap.f.IDynamicPageStickyContent
	 * @interface
	 * @public
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Types of {@link sap.f.Avatar} based on the displayed content.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.73. Use the {@link sap.m.AvatarType} instead.
	 * @since 1.46
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.AvatarType = AvatarType;

	/**
	 * Possible background color options for the {@link sap.f.Avatar} control.
	 *
	 * <b>Notes:</b>
	 * <ul>
	 * <li>Keep in mind that the colors are theme-dependent and can differ based
	 * on the currently used theme.</li>
	 * <li> If the <code>Random</code> value is assigned, a random color is
	 * chosen from the accent options (Accent1 to Accent10).</li>
	 * </ul>
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.73. Use the {@link sap.m.AvatarColor} instead.
	 * @since 1.69
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.AvatarColor = AvatarColor;

	/**
	 * Types of image size and position that determine how an image fits in the {@link sap.f.Avatar} control area.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.73. Use the {@link sap.m.AvatarImageFitType} instead.
	 * @since 1.46
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.AvatarImageFitType = AvatarImageFitType;

	/**
	 * Group modes for the {@link sap.f.AvatarGroup} control.
	 *
	 * @enum {string}
	 * @public
	 * @experimental Since 1.73.
	 * @since 1.73
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.AvatarGroupType = {
		/**
		 * The avatars are displayed as partially overlapped on top of each other and the entire group has one click/tap area.
		 *
		 * @public
		 */
		Group: "Group",

		/**
		 * The avatars are displayed side-by-side and each avatar has its own click/tap area.
		 *
		 * @public
		 */
		Individual: "Individual"
	};

	/**
	 * Interface that should be implemented by all card controls.
	 *
	 * @since 1.62
	 * @public
	 * @interface
	 * @name sap.f.ICard
	 */

	/**
	 * The function is used to allow for a common header renderer between different implementations of the {@link sap.f.ICard} interface.
	 *
	 * @returns {sap.f.cards.IHeader} The header of the card
	 * @since 1.62
	 * @public
	 * @function
	 * @name sap.f.ICard.getCardHeader
	 */

	/**
	 * The function is used to allow for a common content renderer between different implementations of the {@link sap.f.ICard} interface.
	 *
	 * @returns {sap.ui.core.Control} The content of the card
	 * @since 1.62
	 * @public
	 * @function
	 * @name sap.f.ICard.getCardContent
	 */

	/**
	 * Allows for a common header renderer between different implementations of the {@link sap.f.ICard} interface.
	 *
	 * @returns {sap.f.cards.HeaderPosition} The position of the header of the card
	 * @since 1.65
	 * @public
	 * @function
	 * @name sap.f.ICard.getCardHeaderPosition
	 */

	/**
	 * Marker interface for controls suitable as a header in controls that implement the {@link sap.f.ICard} interface.
	 *
	 * @since 1.62
	 * @public
	 * @interface
	 * @name sap.f.cards.IHeader
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Interface for controls suitable for the <code>additionalContent</code> aggregation of <code>{@link sap.f.ShellBar}</code>.
	 *
	 * @since 1.63
	 * @name sap.f.IShellBar
	 * @experimental Since 1.63, that provides only limited functionality. Also, it can be removed in future versions.
	 * @public
	 * @interface
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	 /**
	 * Interface that should be implemented by grid controls, if they are working with the <code>sap.f.dnd.GridDropInfo</code>.
	 *
	 * It is highly recommended that those grid controls have optimized <code>removeItem</code> and <code>insertItem</code> methods (if "items" is target drop aggregation).
	 * Meaning to override them in a way that they don't trigger invalidation.
	 *
	 * @since 1.68
	 * @public
	 * @interface
	 * @name sap.f.dnd.IGridDroppable
	 */

	 /**
	 * Different options for the position of the header in controls that implement the {@link sap.f.ICard} interface.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.65
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.cards.HeaderPosition = {
		/**
		 * The Header is over the content.
		 *
		 * @public
		 */
		Top: "Top",
		/**
		 * The Header is under the content.
		 *
		 * @public
		 */
		Bottom: "Bottom"
	};

	return thisLib;

});
