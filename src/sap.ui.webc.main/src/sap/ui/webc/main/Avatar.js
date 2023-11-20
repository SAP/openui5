/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Avatar.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"./thirdparty/Avatar"
], function(WebComponent, library, EnabledPropagator) {
	"use strict";

	var AvatarColorScheme = library.AvatarColorScheme;
	var AvatarShape = library.AvatarShape;
	var AvatarSize = library.AvatarSize;

	/**
	 * Constructor for a new <code>Avatar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * An image-like component that has different display options for representing images and icons in different shapes and sizes, depending on the use case.
	 *
	 * The shape can be circular or square. There are several predefined sizes, as well as an option to set a custom size.
	 *
	 * <br>
	 * <br>
	 * <h3>Keyboard Handling</h3>
	 *
	 *
	 * <ul>
	 *     <li>[SPACE, ENTER, RETURN] - Fires the <code>click</code> event if the <code>interactive</code> property is set to true.</li>
	 *     <li>[SHIFT] - If [SPACE] is pressed, pressing [SHIFT] releases the component without triggering the click event.</li>
	 * </ul> <br>
	 * <br>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Avatar
	 * @implements sap.ui.webc.main.IAvatar
	 */
	var Avatar = WebComponent.extend("sap.ui.webc.main.Avatar", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-avatar-ui5",
			interfaces: [
				"sap.ui.webc.main.IAvatar"
			],
			properties: {

				/**
				 * Defines the text alternative of the component. If not provided a default text alternative will be set, if present.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the background color of the desired image. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Accent1</code></li>
				 *     <li><code>Accent2</code></li>
				 *     <li><code>Accent3</code></li>
				 *     <li><code>Accent4</code></li>
				 *     <li><code>Accent5</code></li>
				 *     <li><code>Accent6</code></li>
				 *     <li><code>Accent7</code></li>
				 *     <li><code>Accent8</code></li>
				 *     <li><code>Accent9</code></li>
				 *     <li><code>Accent10</code></li>
				 *     <li><code>Placeholder</code></li>
				 * </ul>
				 */
				colorScheme: {
					type: "sap.ui.webc.main.AvatarColorScheme",
					defaultValue: AvatarColorScheme.Accent6
				},

				/**
				 * Defines whether the control is enabled. A disabled control can't be interacted with, and it is not in the tab chain.
				 */
				enabled: {
					type: "boolean",
					defaultValue: true,
					mapping: {
						type: "property",
						to: "disabled",
						formatter: "_mapEnabled"
					}
				},

				/**
				 * Defines the name of the fallback icon, which should be displayed in the following cases:
				 * <ul>
				 *     <li>If the initials are not valid (more than 3 letters, unsupported languages or empty initials).</li>
				 *     <li>If there are three initials and they do not fit in the shape (e.g. WWW for some of the sizes).</li>
				 *     <li>If the image src is wrong.</li>
				 * </ul>
				 *
				 * <br>
				 * <b>Note:</b> If not set, a default fallback icon "employee" is displayed. <br>
				 * <b>Note:</b> You should import the desired icon first, then use its name as "fallback-icon". <br>
				 * <br>
				 * import "@ui5/webcomponents-icons/dist/{icon_name}.js" <br>
				 * <pre>&lt;ui5-avatar fallback-icon="alert"></pre> <br>
				 *
				 *
				 * See all the available icons in the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				fallbackIcon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the name of the UI5 Icon, that will be displayed. <br>
				 * <b>Note:</b> If <code>image</code> slot is provided, the property will be ignored. <br>
				 * <b>Note:</b> You should import the desired icon first, then use its name as "icon". <br>
				 * <br>
				 * import "@ui5/webcomponents-icons/dist/{icon_name}.js" <br>
				 * <pre>&lt;ui5-avatar icon="employee"></pre> <br>
				 * <b>Note:</b> If no icon or an empty one is provided, by default the "employee" icon should be displayed.
				 *
				 * See all the available icons in the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the displayed initials. <br>
				 * Up to three Latin letters can be displayed as initials.
				 */
				initials: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines if the avatar is interactive (focusable and pressable). <b>Note:</b> This property won't have effect if the <code>disabled</code> property is set to <code>true</code>.
				 */
				interactive: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the shape of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Circle</code></li>
				 *     <li><code>Square</code></li>
				 * </ul>
				 */
				shape: {
					type: "sap.ui.webc.main.AvatarShape",
					defaultValue: AvatarShape.Circle
				},

				/**
				 * Defines predefined size of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>XS</code></li>
				 *     <li><code>S</code></li>
				 *     <li><code>M</code></li>
				 *     <li><code>L</code></li>
				 *     <li><code>XL</code></li>
				 * </ul>
				 */
				size: {
					type: "sap.ui.webc.main.AvatarSize",
					defaultValue: AvatarSize.S
				}
			},
			defaultAggregation: "image",
			aggregations: {

				/**
				 * Defines the optional badge that will be used for visual affordance. <b>Note:</b> While the slot allows for custom badges, to achieve the Fiori design, please use <code>sap.ui.webc.main.Badge</code> with <code>sap.ui.webc.main.Icon</code> in the corresponding <code>icon</code> slot, without text nodes. <br>
				 * <br>
				 * Example: <br>
				 * <br>
				 * &lt;ui5-avatar><br>
				 * &lt;ui5-badge slot="badge"><br>
				 * &lt;ui5-icon slot="icon" name="employee">&lt;/ui5-icon><br>
				 * &lt;/ui5-badge><br>
				 * &lt;/ui5-avatar> <br>
				 * <br>
				 * <ui5-avatar initials="AB" color-scheme="Accent1"> <ui5-badge slot="badge"> <ui5-icon slot="icon" name="accelerated"></ui5-icon> </ui5-badge> </ui5-avatar>
				 */
				badge: {
					type: "sap.ui.core.Control",
					multiple: false,
					slot: "badge"
				},

				/**
				 * Receives the desired <code>&lt;img&gt;</code> tag
				 *
				 * <b>Note:</b> If you experience flickering of the provided image, you can hide the component until it is being defined with the following CSS: <br /> <br /> <code> ui5-avatar:not(:defined) { <br /> visibility: hidden; <br /> } <br /> </code>
				 */
				image: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {

				/**
				 * Fired when the user clicks the control
				 */
				click: {
					parameters: {}
				}
			},
			designtime: "sap/ui/webc/main/designtime/Avatar.designtime"
		}
	});

	EnabledPropagator.call(Avatar.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Avatar;
});
