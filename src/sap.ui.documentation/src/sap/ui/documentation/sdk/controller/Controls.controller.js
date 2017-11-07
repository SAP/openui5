/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/Device"
	], function (jQuery, BaseController, Device) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.Controls", {

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit: function () {
				BaseController.prototype.onInit.call(this);

				// manually call the handler once at startup as device API won't do this for us
				this._onOrientationChange({
					landscape: Device.orientation.landscape
				});
			},

			/**
			 * Called before the view is rendered.
			 * @public
			 */
			onBeforeRendering: function() {
				this._deregisterOrientationChange();
			},

			/**
			 * Called after the view is rendered.
			 * @public
			 */
			onAfterRendering: function() {
				this._registerOrientationChange();
			},

			/**
			 * Called when the controller is destroyed.
			 * @public
			 */
			onExit: function() {
				this._deregisterOrientationChange();
			},

			/**
			 * Filter for controls in the master search field when the title of a control section was pressed
			 */
			onPress: function(oEvent) {
				var sFilter = oEvent.oSource.getFilter(),
					oSearchField = this.getOwnerComponent().byId("controlsMaster").byId("searchField");

				// Apply the value and fire a live change event so the list will be filtered
				oSearchField.setValue(sFilter).fireLiveChange({
					newValue: sFilter
				});
				// Show master page: this call will show the master page only on small screen sizes but not on phone
				jQuery.sap.delayedCall(0, this, function () {
					this.getSplitApp().showMaster();
				});
			}
		});
	}
);