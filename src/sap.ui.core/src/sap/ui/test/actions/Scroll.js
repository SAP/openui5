/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/actions/Action"
], function (Action) {
	"use strict";

	/**
	 * @class
	 * The <code>Scroll</code> action is used to simulate a scroll interaction with a control.
	 * The control should be scrollable and use a {@link sap.ui.core.delegate.ScrollEnablement} delegate.
	 * Supported controls include: sap.uxap.ObjectPageLayout, sap.m.Dialog, sap.m.Page, sap.f.DynamicPage
	 *
	 * @param {string}
	 *            [sId] Optional ID for the new instance; generated automatically if
	 *            no non-empty ID is given. Note: this can be omitted, no matter
	 *            whether <code>mSettings</code> are given or not!
	 * @param {object}
	 *            [mSettings] Optional object with initial settings for the new instance
	 * @extends sap.ui.test.actions.Action
	 * @public
	 * @alias sap.ui.test.actions.Scroll
	 * @author SAP SE
	 * @since 1.90
	 */
	var Scroll = Action.extend("sap.ui.test.actions.Scroll", /** @lends sap.ui.test.actions.Scroll.prototype */ {

		metadata : {
			properties: {
				x: {
					type: "int",
					defaultValue: 0
				},
				y: {
					type: "int",
					defaultValue: 0
				}
			}
		},

		init: function () {
			Action.prototype.init.apply(this, arguments);
		},

		executeOn : function (oControl) {
			var oActionDomRef;
			if (oControl.getScrollDelegate) {
				oActionDomRef = oControl.getScrollDelegate().getContainerDomRef();
			}
			if (!oActionDomRef) {
				oActionDomRef = this.$(oControl)[0];
			}

			this.oLogger.timestamp("opa.actions.scroll");
			this.oLogger.debug("Scroll in the control " + oControl);

			if (oActionDomRef) {
				this._createAndDispatchScrollEvent(oActionDomRef, {
					x: this.getX(),
					y: this.getY()
				});
			}
		}
	});

	return Scroll;

});
