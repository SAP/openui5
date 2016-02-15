sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', 'jquery.sap.script'],
	function(jQuery, Controller/*, jQuerySapScript*/) {
	"use strict";

	var PageController = Controller.extend("sap.ui.core.sample.BusyIndicator.Page", {

		hideBusyIndicator : function() {
			sap.ui.core.BusyIndicator.hide();
		},

		showBusyIndicator : function (iDuration, iDelay) {
			sap.ui.core.BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					jQuery.sap.clearDelayedCall(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = jQuery.sap.delayedCall(iDuration, this, function() {
					this.hideBusyIndicator();
				});
			}
		},

		show4000 : function() {
			this.showBusyIndicator(4000);
		},

		show4000_0 : function() {
			this.showBusyIndicator(4000, 0);
		},

		show1000_2000 : function() {
			this.showBusyIndicator(1000, 2000);
		}

	});

	return PageController;

});
