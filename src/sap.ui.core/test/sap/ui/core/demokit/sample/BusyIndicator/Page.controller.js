sap.ui.define(['sap/ui/core/BusyIndicator', 'sap/ui/core/mvc/Controller'],
	function(BusyIndicator, Controller) {
	"use strict";

	var PageController = Controller.extend("sap.ui.core.sample.BusyIndicator.Page", {

		hideBusyIndicator : function() {
			BusyIndicator.hide();
		},

		showBusyIndicator : function (iDuration, iDelay) {
			BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					clearTimeout(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = setTimeout(function() {
					this.hideBusyIndicator();
				}.bind(this), iDuration);
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
