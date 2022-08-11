/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.AvatarGroup.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/AvatarGroup"
], function(WebComponent, library) {
	"use strict";

	var AvatarGroupType = library.AvatarGroupType;

	/**
	 * Constructor for a new <code>AvatarGroup</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * Displays a group of avatars arranged horizontally. It is useful to visually showcase a group of related avatars, such as, project team members or employees.
	 *
	 * The component allows you to display the avatars in different sizes, depending on your use case.
	 *
	 * The <code>AvatarGroup</code> component has two group types:
	 * <ul>
	 *     <li><code>Group</code> type: The avatars are displayed as partially overlapped on top of each other and the entire group has one click/tap area.</li>
	 *     <li><code>Individual</code> type: The avatars are displayed side-by-side and each avatar has its own click/tap area.</li>
	 * </ul>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * When the available space is less than the width required to display all avatars, an overflow visualization appears as a button placed at the end with the same shape and size as the avatars. The visualization displays the number of avatars that have overflowed and are not currently visible.
	 *
	 * <h3>Usage</h3>
	 *
	 * Use the <code>AvatarGroup</code> if:
	 * <ul>
	 *     <li>You want to display a group of avatars.</li>
	 *     <li>You want to display several avatars which have something in common.</li>
	 * </ul>
	 *
	 * Do not use the <code>AvatarGroup</code> if:
	 * <ul>
	 *     <li>You want to display a single avatar.</li>
	 *     <li>You want to display a gallery for simple images.</li>
	 *     <li>You want to use it for other visual content than avatars.</li>
	 * </ul>
	 *
	 * <h3>Keyboard Handling</h3> The component provides advanced keyboard handling. When focused, the user can use the following keyboard shortcuts in order to perform a navigation: <br>
	 * - <code>type</code> Individual: <br>
	 *
	 * <ul>
	 *     <li>[TAB] - Move focus to the overflow button</li>
	 *     <li>[LEFT] - Navigate one avatar to the left</li>
	 *     <li>[RIGHT] - Navigate one avatar to the right</li>
	 *     <li>[HOME] - Navigate to the first avatar</li>
	 *     <li>[END] - Navigate to the last avatar</li>
	 *     <li>[SPACE],[ENTER],[RETURN] - Trigger <code>ui5-click</code> event</li>
	 * </ul> <br>
	 * - <code>type</code> Group: <br>
	 *
	 * <ul>
	 *     <li>[TAB] - Move focus to the next interactive element after the component</li>
	 *     <li>[SPACE],[ENTER],[RETURN] - Trigger <code>ui5-click</code> event</li>
	 * </ul> <br>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.AvatarGroup
	 */
	var AvatarGroup = WebComponent.extend("sap.ui.webc.main.AvatarGroup", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-avatar-group-ui5",
			properties: {

				/**
				 * Defines the mode of the <code>AvatarGroup</code>. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Group</code></li>
				 *     <li><code>Individual</code></li>
				 * </ul>
				 */
				type: {
					type: "sap.ui.webc.main.AvatarGroupType",
					defaultValue: AvatarGroupType.Group
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the items of the component. Use the <code>sap.ui.webc.main.Avatar</code> component as an item. <br>
				 * <br>
				 * <b>Note:</b> The UX guidelines recommends using avatars with "Circle" shape. Moreover, if you use avatars with "Square" shape, there will be visual inconsistency as the built-in overflow action has "Circle" shape.
				 */
				items: {
					type: "sap.ui.webc.main.IAvatar",
					multiple: true
				},

				/**
				 * Defines the overflow button of the component. <b>Note:</b> We recommend using the <code>sap.ui.webc.main.Button</code> component. <br>
				 * <br>
				 * <b>Note:</b> If this slot is not used, the component will display the built-in overflow button.
				 */
				overflowButton: {
					type: "sap.ui.core.Control",
					multiple: false,
					slot: "overflowButton"
				}
			},
			events: {

				/**
				 * Fired when the component is activated either with a click/tap or by using the Enter or Space key.
				 */
				click: {
					parameters: {
						/**
						 * The DOM ref of the clicked item.
						 */
						targetRef: {
							type: "HTMLElement"
						},

						/**
						 * indicates if the overflow button is clicked
						 */
						overflowButtonClicked: {
							type: "boolean"
						}
					}
				},

				/**
				 * Fired when the count of visible <code>sap.ui.webc.main.Avatar</code> elements in the component has changed
				 */
				overflow: {
					parameters: {}
				}
			},
			getters: ["colorScheme", "hiddenItems"]
		}
	});

	/**
	 * Returns an array containing the <code>AvatarColorScheme</code> values that correspond to the avatars in the component.
	 * @public
	 * @name sap.ui.webc.main.AvatarGroup#getColorScheme
	 * @function
	 */

	/**
	 * Returns an array containing the <code>ui5-avatar</code> instances that are currently not displayed due to lack of space.
	 * @public
	 * @name sap.ui.webc.main.AvatarGroup#getHiddenItems
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return AvatarGroup;
});