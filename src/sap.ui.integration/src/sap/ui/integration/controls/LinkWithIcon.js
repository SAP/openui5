/*!
* ${copyright}
*/

// Provides control sap.ui.integration.controls.ActionsToolbar
sap.ui.define([
	"./LinkWithIconRenderer",
	"sap/ui/integration/library",
	"sap/m/Link",
	"sap/ui/core/Icon"
], function (
	LinkWithIconRenderer,
	library,
	Link,
	Icon
) {
	"use strict";

	/**
	 * Constructor for a new LinkWithIcon.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.m.Link
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.controls.LinkWithIcon
	 */
	var LinkWithIcon = Link.extend("sap.ui.integration.controls.LinkWithIcon", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * Defines the icon to be displayed as graphical element within the <code>Link</code>.
				 */
				icon: {type : "sap.ui.core.URI", group : "Appearance", defaultValue: "" }
			},
			aggregations: {
				_icon: { type: "sap.ui.core.Icon", multiple: false, visibility: "hidden" }
			}
		},

		renderer: LinkWithIconRenderer
	});

	/**
	 * Called before the control is rendered.
	 * @private
	 */
	LinkWithIcon.prototype.onBeforeRendering = function () {
		Link.prototype.onBeforeRendering.apply(this, arguments);

		if (this.getIcon()) {
			this._getIcon().setSrc(this.getIcon());
		}

		this.addStyleClass("sapUiIntCardLinkWithIcon");
	};

	LinkWithIcon.prototype._getIcon = function () {
		var oIcon = this.getAggregation("_icon");
		if (!oIcon) {
			oIcon = new Icon();
			this.setAggregation("_icon", oIcon);
		}
		return oIcon;
	};

	return LinkWithIcon;
});
