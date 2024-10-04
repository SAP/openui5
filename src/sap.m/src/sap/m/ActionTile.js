/*!
* ${copyright}
*/

sap.ui.define([
	"./library",
	"sap/m/GenericTile",
	"sap/m/Avatar",
	"sap/m/ToDoCardRenderer",
	"sap/m/GenericTileRenderer",
	"sap/ui/core/library"
], function (
	library,
	GenericTile,
	Avatar,
	ToDoCardRenderer,
	GenericTileRenderer,
	coreLibrary
) {
		"use strict";

	var FrameType = library.FrameType,
		GenericTileMode = library.GenericTileMode,
		LoadState = library.LoadState,
		Priority = library.Priority,
		AvatarSize = library.AvatarSize,
		AvatarShape = library.AvatarShape,
		AvatarColor = library.AvatarColor,
		ValueState = coreLibrary.ValueState;

	/**
	* Constructor for a new sap.m.ActionTile control.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] initial settings for the new control
	*
	* @class
	*Used to create a customizable tile for your todos and situations within the new My Home in SAP S/4HANA cloud
	* @extends sap.m.GenericTile
	*
	* @author SAP SE
	* @version ${version}
	*
	* @public
	* @since 1.122
	* @alias sap.m.ActionTile
	*/

	var ActionTile = GenericTile.extend("sap.m.ActionTile", /** @lends sap.m.ActionTile.prototype */{
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * The height of the tile changes dynamically to accommodate the content inside it
				 *
				 * @since 1.124
				 */
				enableDynamicHeight: { type: "boolean", group: "Appearance", defaultValue: false },
				/**
				 * Decides whether the headerImage should have a frame or not.
				 *
				 * @since 1.124
				 */
				enableIconFrame: { type: "boolean", group: "Appearance", defaultValue: false },
				/**
				 * Adds a priority indicator for the Action Tile.
				 *
				 * @since 1.124
				 */
				priority: { type: "sap.m.Priority", group: "Data", defaultValue: Priority.None },
				/**
				 * Sets the text inside the priority indicator for the Action Tile.
				 *
				 * @since 1.124
				 */
				priorityText: { type: "string", group: "Data", defaultValue: null },
				/**
				 * Defines what type of icon is displayed as visual affordance for the icon frame badge.
				 *
				 * @since 1.124
				 */
				badgeIcon: { type: "sap.ui.core.URI", group: "Appearance", defaultValue: "" },
				/**
				 * Visualizes the validation state of the icon frame badge, e.g. <code>Error</code>, <code>Warning</code>,
				 * <code>Success</code>, <code>Information</code>.
				 *
				 * @since 1.124
				 */
				badgeValueState: {
					type: "sap.ui.core.ValueState",
					group: "Appearance",
					defaultValue: ValueState.None
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				if (oControl.getState() === LoadState.Loading) {
					ToDoCardRenderer.render(oRm, oControl);
				} else {
					GenericTileRenderer.render(oRm, oControl);
				}
			}
		}
	});

	/* --- Lifecycle Handling --- */

	ActionTile.prototype.init = function() {
		this.addStyleClass("sapMAT");
		this.setMode(GenericTileMode.ActionMode);
		this.setFrameType(FrameType.TwoByOne);
		GenericTile.prototype.init.apply(this, arguments);
	};

	ActionTile.prototype.onBeforeRendering = function() {
		if (this.getHeaderImage()) {
			this.addStyleClass("sapMATHeaderImage");
		}
		this.toggleStyleClass("sapMATDynamicHeight", this.getEnableDynamicHeight());
		this.toggleStyleClass("sapMATHideActionButton", !this.getEnableNavigationButton());
		GenericTile.prototype.onBeforeRendering.apply(this, arguments);
	};

	ActionTile.prototype.onAfterRendering = function() {
		if (this.getDomRef()) {
			this._removeStyleClasses();
		}
		GenericTile.prototype.onAfterRendering.apply(this, arguments);
	};

	/**
	* Removes the style classes inherited from the parent control
	* @private
	*/
	ActionTile.prototype._removeStyleClasses = function() {
		this.getDomRef().classList.remove("sapMGT");
		this.getDomRef().classList.remove("TwoByOne");
		this.getDomRef().classList.remove("sapMGTActionMode");
	};

	/**
	 * Returns the size description of the tile that is announced by the screen reader
	 *
	 * @returns {string} Text for the size description
	 * @private
	 */
	ActionTile.prototype._getSizeDescription = function () {
		return this._oRb.getText("ACTION_TILE_SIZE");
	};
	/**
	 * Below function would be called from the GenericTile onAfterRendering method, so that the tile size would be changed according to the screen size.
	 * But in current ActionTile scenario, its not needed
	 */

	ActionTile.prototype._setupResizeClassHandler = function() {};

	/**
	 * Sets the enableIconFrame property of the ActionTile.
	 *
	 * @public
	 * @param {boolean} bValue - Determines whether the icon frame should be enabled or not.
	 * @returns {sap.m.ActionTile} The reference to the ActionTile instance.
	 */
	ActionTile.prototype.setEnableIconFrame = function(bValue) {
		if (!this._oAvatar && bValue) {
			this._oAvatar = new Avatar(this.getId() + "-icon-frame", {
				displaySize: AvatarSize.Custom,
				customDisplaySize: "3.25rem",
				displayShape: AvatarShape.Square,
				backgroundColor: AvatarColor.Placeholder
			}).addStyleClass("sapMATIconFrame");
			this.addDependent(this._oAvatar);

			var sHeaderImage = this.getHeaderImage();
			if (sHeaderImage) {
				this._oAvatar.setSrc(sHeaderImage);
			}
		}

		this.setProperty("enableIconFrame", bValue);
		return this;
	};

	/**
	 * Sets the badgeIcon property of the ActionTile.
	 *
	 * @public
	 * @param {string} sIcon - The URI of the icon to be displayed as a badge.
	 * @returns	{sap.m.ActionTile} The reference to the ActionTile instance.
	 */
	ActionTile.prototype.setBadgeIcon = function(sIcon) {
		if (this._oAvatar) {
			this._oAvatar.setBadgeIcon(sIcon);
		}

		this.setProperty("badgeIcon", sIcon);
		return this;
	};

	/**
	 * Sets the badgeValueState property of the ActionTile.
	 *
	 * @public
	 * @param {sap.ui.core.ValueState} sValueState The value state of the badge.
	 * @returns {sap.m.ActionTile} The reference to the ActionTile instance.
	 */
	ActionTile.prototype.setBadgeValueState = function(sValueState) {
		if (this._oAvatar) {
			this._oAvatar.setBadgeValueState(sValueState);
		}

		this.setProperty("badgeValueState", sValueState);
		return this;
	};

	/**
	 * Returns the icon frame (Avatar) instance associated with the ActionTile.
	 *
	 * @return {sap.m.Avatar} The Avatar instance representing the icon frame.
	 */
	ActionTile.prototype._getIconFrame = function() {
		return this._oAvatar;
	};

	/**
	 * Exit lifecycle method for the ActionTile.
	 *
	 */
	ActionTile.prototype.exit = function() {
		GenericTile.prototype.exit.apply(this, arguments);

		if (this._oAvatar) {
			this._oAvatar.destroy();
		}
	};

	return ActionTile;
});
