/*!
 * ${copyright}
 */

// Provides control sap.f.shellBar.ContentButton
sap.ui.define(['sap/f/library', 'sap/m/Button', 'sap/f/shellBar/ContentButtonRenderer'],
function(library, Button, ContentButtonRenderer) {
	"use strict";

	// shortcut for sap.f.AvatarSize
	var AvatarSize = library.AvatarSize;

	/**
	 * Constructor for a new <code>ContentButton</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Private control used by the ShellBar control
	 *
	 * @extends sap.m.Button
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.63
	 * @alias sap.f.shallBar.ContentButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var oContentButton = Button.extend("sap.f.shallBar.ContentButton", /** @lends sap.f.shallBar.ContentButton.prototype */ {
		metadata : {
			library : "sap.f",
			aggregations: {
				avatar: {type: "sap.f.Avatar", multiple: false}
			}
		},
		renderer: ContentButtonRenderer
	});

	oContentButton.prototype.setAvatar = function (oAvatar) {
		oAvatar.setDisplaySize(AvatarSize.XS);
		return this.setAggregation("avatar", oAvatar);
	};

	oContentButton.prototype._getText = function() {
		if (this._bInOverflow) {
			return Button.prototype._getText.call(this);
		}

		return "";
	};

	return oContentButton;

});
