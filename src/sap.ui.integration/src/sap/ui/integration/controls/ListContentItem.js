/*!
* ${copyright}
*/

sap.ui.define([
	"sap/ui/integration/library",
	"./ListContentItemRenderer",
	"sap/m/Avatar",
	"sap/m/AvatarShape",
	"sap/m/AvatarSize",
	"sap/m/StandardListItem"
], function (
	library,
	ListContentItemRenderer,
	Avatar,
	AvatarShape,
	AvatarSize,
	StandardListItem
) {
	"use strict";

	var AttributesLayoutType = library.AttributesLayoutType;

	/**
	 * Constructor for a new ListContentItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.m.StandardListItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.controls.ListContentItem
	 */
	var ListContentItem = StandardListItem.extend("sap.ui.integration.controls.ListContentItem", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * Defines an alt text for the avatar or icon.
				 * @since 1.82
				 */
				iconAlt: { type: "string", defaultValue: "" },

				/**
				 * Defines the shape of the icon.
				 * @since 1.82
				 */
				iconDisplayShape: { type: "sap.m.AvatarShape", defaultValue: AvatarShape.Square },

				/**
				 * Defines the initials of the icon.
				 * @since 1.82
				 */
				iconInitials: { type: "string", defaultValue: "" },

				/**
				 * Defines the size of the icon.
				 * @since 1.82
				 */
				iconSize: { type: "sap.m.AvatarSize", defaultValue: AvatarSize.XS },

				/**
				 * Defines the background color of the icon.
				 * @since 1.83
				 */
				iconBackgroundColor: { type: "sap.m.AvatarColor" },

				/**
				 * Defines the layout type of the attributes.
				 */
				attributesLayoutType: { type: "sap.ui.integration.AttributesLayoutType", defaultValue: AttributesLayoutType.TwoColumns }
			},
			aggregations: {
				microchart: { type: "sap.ui.integration.controls.Microchart", multiple: false },

				actionsStrip: { type: "sap.ui.integration.controls.ActionsStrip", multiple: false },

				attributes: { type: "sap.m.ObjectStatus", multiple: true },

				/**
				 * Defines the inner avatar control.
				 */
				_avatar: { type: "sap.m.Avatar", multiple: false, visibility: "hidden" }
			}
		},
		renderer: ListContentItemRenderer
	});

	ListContentItem.prototype._getAvatar = function () {
		var oAvatar = this.getAggregation("_avatar");

		if (!oAvatar) {
			oAvatar = new Avatar().addStyleClass("sapFCardIcon");
			this.setAggregation("_avatar", oAvatar);
		}

		oAvatar
			.setSrc(this.getIcon())
			.setDisplayShape(this.getIconDisplayShape())
			.setTooltip(this.getIconAlt())
			.setInitials(this.getIconInitials())
			.setDisplaySize(this.getIconSize())
			.setBackgroundColor(this.getIconBackgroundColor());

		return oAvatar;
	};

	ListContentItem.prototype._getVisibleAttributes = function () {
		return this.getAttributes().filter(function (oAttribute) {
			return oAttribute.getVisible();
		});
	};

	return ListContentItem;
});