/*!
 * ${copyright}
 */
/**
 * Initialization Code and shared classes of library sap.ui.integration.
 */
sap.ui.define([
	"sap/ui/base/DataType",
	"sap/ui/core/Lib",
	// library dependency
	"sap/ui/core/library",
	"sap/m/library",
	"sap/f/library",
	"sap/ui/unified/library",
	"sap/ui/layout/library",
	"sap/ui/table/library"
], function (DataType, Library) {
	"use strict";

	/**
	 * SAPUI5 library with controls specialized for SAP Fiori apps.
	 *
	 * @namespace
	 * @alias sap.ui.integration
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.62
	 * @public
	 */
	var thisLib = Library.init({
		apiVersion: 2,
		name: "sap.ui.integration",
		version: "${version}",
		dependencies: [
			"sap.ui.core",
			"sap.f",
			"sap.m",
			"sap.ui.unified",
			"sap.ui.layout",
			"sap.ui.table"
		],
		types: [
			"sap.ui.integration.CardActionType",
			"sap.ui.integration.CardDataMode",
			"sap.ui.integration.CardMenuAction",
			"sap.ui.integration.CardDesign",
			"sap.ui.integration.CardDisplayVariant",
			"sap.ui.integration.CardBlockingMessageType",
			"sap.ui.integration.CardPreviewMode",
			"sap.ui.integration.AttributesLayoutType"
		],
		controls: [
			"sap.ui.integration.widgets.Card",
			"sap.ui.integration.cards.filters.FilterBar",
			"sap.ui.integration.cards.Header",
			"sap.ui.integration.cards.NumericHeader",
			"sap.ui.integration.controls.ListContentItem",
			"sap.ui.integration.controls.BlockingMessage",
			"sap.ui.integration.controls.ImageWithOverlay"
		],
		elements: [
			"sap.ui.integration.ActionDefinition",
			"sap.ui.integration.Host",
			"sap.ui.integration.Extension"
		],
		extensions: {
			"sap.ui.integration": {
				// define the custom elements that can be used in this library
				customElements: {
					"card": "sap/ui/integration/customElements/CustomElementCard"
				}
			}
		}
	});

	/**
	 * Enumeration of possible card action types.
	 *
	 * @enum {string}
	 * @experimental since 1.64
	 * Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 * @public
	 */
	thisLib.CardActionType = {
		/**
		 * Used for navigation actions.
		 * @public
		 */
		Navigation: "Navigation",

		/**
		 * Used for submit actions.
		 * @public
		 */
		Submit: "Submit",

		/**
		 * Used for custom actions.
		 * @public
		 * @experimental Since 1.76
		 */
		Custom: "Custom",

		/**
		 * Date selection. Available only for Calendar cards.
		 * @public
		 * @experimental Since 1.87
		 */
		DateChange: "DateChange",

		/**
		 * Month selection. Available only for Calendar cards.
		 * @public
		 * @experimental Since 1.87
		 */
		MonthChange: "MonthChange",

		/**
		 * Used for showing more details about the card.
		 * @public
		 * @experimental Since 1.100
		 */
		ShowCard: "ShowCard",

		/**
		 * Used for hiding the appeared details about the card.
		 * @public
		 * @experimental Since 1.100
		 */
		HideCard: "HideCard"
	};

	/**
	 * Possible data modes for <code>{@link sap.ui.integration.widgets.Card}</code>.
	 *
	 * @enum {string}
	 * @experimental since 1.65
	 * @public
	 * @since 1.65
	 */
	thisLib.CardDataMode = {
		/**
		 * When in this mode, the card can make requests.
		 * @public
		 */
		Active: "Active",
		/**
		 * When in this mode, the card cannot make requests.
		 * @public
		 */
		Inactive: "Inactive",
		/**
		 * When in this mode, the card starts processing the manifest when the card is in the viewport.
		 * @public
		 */
		Auto: "Auto"
	};

	/**
	 * Possible designs for <code>{@link sap.ui.integration.widgets.Card}</code>.
	 *
	 * @enum {string}
	 * @experimental since 1.109
	 * @public
	 * @since 1.109
	 */
	thisLib.CardDesign = {
		/**
		 * When in this mode, the card has a solid background.
		 * @public
		 */
		Solid: "Solid",
		/**
		 * When in this mode, the card background is transparent.
		 * @public
		 */
		Transparent: "Transparent"
	};

	/**
	 * Possible variants for <code>{@link sap.ui.integration.widgets.Card}</code> rendering and behavior.
	 *
	 * @enum {string}
	 * @public
	 * @experimental Since 1.118. For usage only by Work Zone.
	 * @since 1.118
	 */
	thisLib.CardDisplayVariant = {
		/**
		 * The CompactHeader card variant.
		 * @public
		 */
		CompactHeader: "CompactHeader",
		/**
		 * The SmallHeader card variant.
		 * @public
		 */
		SmallHeader: "SmallHeader",
		/**
		 * The SmallHeader card variant.
		 * @public
		 */
		StandardHeader: "StandardHeader",
		/**
		 * The small card variant.
		 * @public
		 */
		Small: "Small",
		/**
		 * The standard card variant.
		 * @public
		 */
		Standard: "Standard",
		/**
		 * The large card variant.
		 * @public
		 */
		Large: "Large",
		/**
		 * Card renders and behaves like a tile of size 2x2.
		 * @public
		 */
		TileStandard: "TileStandard",
		/**
		 * Card renders and behaves like a tile of size 4x2.
		 * @public
		 */
		TileStandardWide: "TileStandardWide",
		/**
		 * Card renders and behaves like a tile of size 2x1.
		 * @public
		 */
		TileFlat: "TileFlat",
		/**
		 * Card renders and behaves like a tile of size 4x1.
		 * @public
		 */
		TileFlatWide: "TileFlatWide"
	};

	/**
	 * Specifies different areas of a card where actions can be attached.
	 *
	 * @private
	 */
	thisLib.CardActionArea = {
		None: "None",
		Content: "Content",
		ContentItem: "ContentItem",
		ActionsStrip: "ActionsStrip",
		ContentItemDetail: "ContentItemDetail",
		Header: "Header"
	};

	/**
	 * Card blocking message types.
	 *
	 * @enum {string}
	 * @public
	 * @experimental since 1.114
	 */
	thisLib.CardBlockingMessageType = {
		/**
		 * An error ocurred in the card.
		 * @public
		 */
		Error: "Error",

		/**
		 * There is no data to be displayed.
		 * @public
		 */
		NoData: "NoData",

		/**
		 * Information message.
		 * @public
		 */
		Information: "Information"
	};

	/**
	 * Defines the areas in a card.
	 * @enum {string}
	 * @public
	 * @since 1.86
	 */
	thisLib.CardArea = {
		/**
		 * The header.
		 * @public
		 */
		Header: "Header",
		/**
		 * The filters area.
		 * @public
		 */
		Filters: "Filters",
		/**
		 * The content area.
		 * @public
		 */
		Content: "Content"
	};

	/**
	 * Preview modes for <code>{@link sap.ui.integration.widgets.Card}</code>.
	 * Helpful in scenarios when the end user is choosing or configuring a card.
	 *
	 * @enum {string}
	 * @public
	 * @experimental since 1.112
	 * @since 1.112
	 */
	thisLib.CardPreviewMode = {
		/**
		 * Card displays real data.
		 * @public
		 */
		Off: "Off",

		/**
		 * Card displays mocked data, loaded using a data request as configured in the manifest.
		 * @public
		 */
		MockData: "MockData",

		/**
		 * Card displays abstract preview. No data requests are made.
		 * @public
		 */
		Abstract: "Abstract"
	};

	/**
	 * Defines the layout type of the List card attributes.
	 * @enum {string}
	 * @public
	 * @since 1.96
	 */
	thisLib.AttributesLayoutType = {
		/**
		 * One column.
		 * @public
		 */
		OneColumn: "OneColumn",
		/**
		 * Two columns.
		 * @public
		 */
		TwoColumns: "TwoColumns"
	};

	/**
	 * An object type that represents card menu action properties.
	 * @typedef {object}
	 * @public
	 * @experimental since 1.79
	 * @property {sap.ui.integration.CardActionType} type The type of the action.
	 * @property {string} text The text of the action button.
	 * @property {sap.ui.core.URI} icon The icon of the action button.
	 * @property {string} tooltip The tooltip of the action button.
	 * @property {sap.m.ButtonType} buttonType The type of the action button.
	 * @property {boolean|function} enabled If the action is enabled. Default value is <code>true</code>.
	 * @property {boolean|function} visible If the action is visible. Default value is <code>true</code>.
	 * @property {function} action The action function.
	 * @property {object} parameters The parameters of the action.
	 */
	thisLib.CardMenuAction = DataType.createType("sap.ui.integration.CardMenuAction", {
		isValid: function (oValue) {
			var aPossibleKeys = [
				"type", "text", "icon", "tooltip", "buttonType", "enabled", "visible", "action", "parameters",
				"target", "url" // do not document these as they should not be used
			];
			return Object.keys(oValue).every(function (sKey) {
				return aPossibleKeys.indexOf(sKey) !== -1;
			});
		}
	}, "object");


	/**
	 * Register all of the above defined enums.
	 */
	DataType.registerEnum("sap.ui.integration.CardActionType", thisLib.CardActionType);
	DataType.registerEnum("sap.ui.integration.CardDataMode", thisLib.CardDataMode);
	DataType.registerEnum("sap.ui.integration.CardDesign", thisLib.CardDesign);
	DataType.registerEnum("sap.ui.integration.CardDisplayVariant", thisLib.CardDisplayVariant);
	DataType.registerEnum("sap.ui.integration.CardBlockingMessageType", thisLib.CardBlockingMessageType);
	DataType.registerEnum("sap.ui.integration.CardPreviewMode", thisLib.CardPreviewMode);
	DataType.registerEnum("sap.ui.integration.AttributesLayoutType", thisLib.AttributesLayoutType);

	return thisLib;
});
