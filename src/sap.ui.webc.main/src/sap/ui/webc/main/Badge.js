/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Badge.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Badge"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>Badge</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Badge</code> is a small non-interactive component which contains text information and color chosen from a list of predefined color schemes. It serves the purpose to attract the user attention to some piece of information (state, quantity, condition, etc.).
	 *
	 * <h3>Usage Guidelines</h3>
	 * <ul>
	 *     <li>If the text is longer than the width of the component, it doesn’t wrap, it shows ellipsis.</li>
	 *     <li>When truncated, the full text is not visible, therefore, it’s recommended to make more space for longer texts to be fully displayed.</li>
	 *     <li>Colors are not semantic and have no visual representation in High Contrast Black (sap_belize_hcb) theme.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Badge
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Badge = WebComponent.extend("sap.ui.webc.main.Badge", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-badge-ui5",
			properties: {

				/**
				 * Defines the color scheme of the component. There are 10 predefined schemes. Each scheme applies different values for the <code>background-color</code> and <code>border-color</code>. To use one you can set a number from <code>"1"</code> to <code>"10"</code>. The <code>colorScheme</code> <code>"1"</code> will be set by default. <br>
				 * <br>
				 * <b>Note:</b> Color schemes have no visual representation in High Contrast Black (sap_belize_hcb) theme.
				 */
				colorScheme: {
					type: "string",
					defaultValue: "1"
				},

				/**
				 * Defines the content of the control
				 */
				text: {
					type: "string",
					defaultValue: "",
					mapping: "textContent"
				}
			},
			aggregations: {

				/**
				 * Defines the icon to be displayed in the component.
				 */
				icon: {
					type: "sap.ui.webc.main.IIcon",
					multiple: false,
					slot: "icon"
				}
			},
			designtime: "sap/ui/webc/main/designtime/Badge.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Badge;
});