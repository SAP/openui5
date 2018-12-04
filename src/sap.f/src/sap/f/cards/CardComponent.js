/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent'], function (jQuery, UIComponent) {
	"use strict";

	/**
	 * Constructor for a new <code>CardComponent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 *
	 * <h3>Usage</h3>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * @extends sap.ui.core.UIComponent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @experimental
	 * @since 1.60
	 * @see {@link TODO Card}
	 * @alias sap.f.cards.content.CardComponents
	 */
	var CardComponent = UIComponent.extend("sap.f.cards.CardComponent", {
		constructor: function (mSettings) {
			UIComponent.apply(this, arguments);
			this._mSettings = mSettings;
		},
		metadata: {}
	});
	CardComponent.prototype.applySettings = function () {
		UIComponent.prototype.applySettings.apply(this, arguments);
	};
	CardComponent.prototype.createContent = function () {
		return UIComponent.prototype.createContent.apply(this, arguments);
	};

	/**
	 * Renders the root control of the UIComponent.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager a RenderManager instance
	 * @public
	 */
	CardComponent.prototype.render = function (oRenderManager) {
		var oControl = this.getRootControl();
		if (oControl && oRenderManager) {
			oRenderManager.renderControl(oControl);
		}
	};
	return CardComponent;
});