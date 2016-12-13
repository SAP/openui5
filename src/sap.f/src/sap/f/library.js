/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.f.
 */
sap.ui.define(["jquery.sap.global",
	"sap/ui/core/library", "sap/m/library"], // library dependency
	function() {

	"use strict";

	/**
	 * SAPUI5 library with controls specialized for Fiori applications.
	 *
	 * @namespace
	 * @name sap.f
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.f",
		version: "${version}",
		dependencies : ["sap.ui.core", "sap.m"],
		types: [
			"sap.f.LayoutType"
		],
		controls: [
			"sap.f.Avatar",
			"sap.f.DynamicPage",
			"sap.f.DynamicPageHeader",
			"sap.f.DynamicPageTitle",
			"sap.f.FlexibleColumnLayout",
			"sap.f.semantic.SemanticPage"
		],
		elements: [
			"sap.f.semantic.AddAction",
			"sap.f.semantic.CloseAction",
			"sap.f.semantic.CopyAction",
			"sap.f.semantic.DeleteAction",
			"sap.f.semantic.DiscussInJamAction",
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
		]
	});

	/**
	 * Types of layout for the sap.f.FlexibleColumnLayout control.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.46
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.f.LayoutType = {

		/**
		 * Description
		 * @public
		 */
		OneColumn: "OneColumn",

		/**
		 * Description
		 * @public
		 */
		TwoColumnsBeginExpanded: "TwoColumnsBeginExpanded",

		/**
		 * Description
		 * @public
		 */
		TwoColumnsMidExpanded: "TwoColumnsMidExpanded",

		/**
		 * Description
		 * @public
		 */
		MidColumnFullScreen: "MidColumnFullScreen",

		/**
		 * Description
		 * @public
		 */
		ThreeColumnsMidExpanded: "ThreeColumnsMidExpanded",

		/**
		 * Description
		 * @public
		 */
		ThreeColumnsEndExpanded: "ThreeColumnsEndExpanded",

		/**
		 * Description
		 * @public
		 */
		ThreeColumnsMidExpandedEndHidden: "ThreeColumnsMidExpandedEndHidden",

		/**
		 * Description
		 * @public
		 */
		ThreeColumnsBeginExpandedEndHidden: "ThreeColumnsBeginExpandedEndHidden",

		/**
		 * Description
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
	sap.f.AvatarShape = {
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
	sap.f.AvatarSize = {
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
	sap.f.AvatarType = {
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
	sap.f.AvatarImageFitType = {
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

	return sap.f;

});
