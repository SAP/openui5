/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Tab.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"./thirdparty/Tab"
], function(WebComponent, library, EnabledPropagator) {
	"use strict";

	var SemanticColor = library.SemanticColor;

	/**
	 * Constructor for a new <code>Tab</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * The <code>sap.ui.webc.main.Tab</code> represents a selectable item inside a <code>sap.ui.webc.main.TabContainer</code>. It defines both the item in the tab strip (top part of the <code>sap.ui.webc.main.TabContainer</code>) and the content that is presented to the user once the tab is selected.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Tab
	 * @implements sap.ui.webc.main.ITab
	 */
	var Tab = WebComponent.extend("sap.ui.webc.main.Tab", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-tab-ui5",
			interfaces: [
				"sap.ui.webc.main.ITab"
			],
			properties: {

				/**
				 * Represents the "additionalText" text, which is displayed in the tab.
				 */
				additionalText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the component's design color. <br>
				 * <br>
				 * The design is applied to:
				 * <ul>
				 *     <li>the component icon</li>
				 *     <li>the <code>text</code> when the component overflows</li>
				 *     <li>the tab selection line</li>
				 * </ul>
				 *
				 * <br>
				 * <br>
				 * Available designs are: <code>"Default"</code>, <code>"Neutral"</code>, <code>"Positive"</code>, <code>"Critical"</code> and <code>"Negative"</code>.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> The design depends on the current theme.
				 */
				design: {
					type: "sap.ui.webc.main.SemanticColor",
					defaultValue: SemanticColor.Default
				},

				/**
				 * Defines whether the control is enabled. A disabled control can't be interacted with, and it is not in the tab chain.
				 */
				enabled: {
					type: "boolean",
					defaultValue: true,
					mapping: {
						type: "attribute",
						to: "disabled",
						formatter: "_mapEnabled"
					}
				},

				/**
				 * Defines the icon source URI to be displayed as graphical element within the component. The SAP-icons font provides numerous built-in icons. See all the available icons in the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Specifies if the component is selected.
				 */
				selected: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * The text to be displayed for the item.
				 */
				text: {
					type: "string",
					defaultValue: ""
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Holds the content associated with this tab.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Defines hierarchies with nested sub tabs. <br>
				 * <br>
				 * <b>Note:</b> Use <code>sap.ui.webc.main.Tab</code> and <code>sap.ui.webc.main.TabSeparator</code> for the intended design.
				 */
				subTabs: {
					type: "sap.ui.webc.main.ITab",
					multiple: true,
					slot: "subTabs"
				}
			},
			methods: ["getTabInStripDomRef"],
			designtime: "sap/ui/webc/main/designtime/Tab.designtime"
		}
	});

	/**
	 * Returns the DOM reference of the tab that is placed in the header. <b>Note:</b> If you need a DOM ref to the tab content please use the <code>getDomRef</code> method.
	 * @public
	 * @name sap.ui.webc.main.Tab#getTabInStripDomRef
	 * @function
	 */

	EnabledPropagator.call(Tab.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Tab;
});