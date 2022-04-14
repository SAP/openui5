/*!
 * ${copyright}
 */
/**
 * Initialization Code and shared classes of library sap.ui.integration.
 */
sap.ui.define([
	"sap/ui/base/DataType",
	"sap/ui/Global",
	// library dependency
	"sap/ui/core/library",
	"sap/m/library",
	"sap/f/library"
], function (DataType) {
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
	var thisLib = sap.ui.getCore().initLibrary({
		name: "sap.ui.integration",
		version: "${version}",
		dependencies: ["sap.ui.core", "sap.f", "sap.m"],
		types: [
			"sap.ui.integration.CardActionType",
			"sap.ui.integration.CardDataMode",
			"sap.ui.integration.CardMenuAction"
		],
		controls: [
			"sap.ui.integration.widgets.Card",
			"sap.ui.integration.cards.filters.FilterBar",
			"sap.ui.integration.cards.Header",
			"sap.ui.integration.cards.NumericHeader",
			"sap.ui.integration.controls.ListContentItem"
		],
		elements: [
			"sap.ui.integration.ActionDefinition",
			"sap.ui.integration.Host"
		],
		// define the custom elements that can be used in this library
		customElements: {
			"card": "sap/ui/integration/customElements/CustomElementCard"
		}
	});

	/**
	 * Enumeration of possible card action types.
	 *
	 * @enum {string}
	 * @experimental since 1.64
	 * Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
	 * Specifies different areas of a card where actions can be attached.
	 *
	 * @private
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
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
	 * Defines the areas in a card.
	 * @enum {string}
	 * @public
	 * @since 1.86
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
	 * Defines the layout type of the List card attributes.
	 * @enum {string}
	 * @public
	 * @since 1.96
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
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

	return thisLib;
});
