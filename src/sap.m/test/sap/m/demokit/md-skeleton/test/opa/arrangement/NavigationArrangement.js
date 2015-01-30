sap.ui.define(['sap/ui/test/Opa5'],
	function(Opa5) {
		"use strict";

		return Opa5.extend("sap.ui.demo.mdskeleton.test.opa.arrangement.NavigationArrangement", {
			_getFrameUrl : function () {
				return jQuery.sap.getResourcePath("sap/ui/demo/app/index.", "html");
			},

			GivenIStartTheAppOnADesktopDevice : function () {
				this.iStartMyAppInAFrame(this._getFrameUrl() + "?responderOn=true");
			},

			GivenIStartTheAppOnAPhone : function () {
				this.iStartMyAppInAFrame(this._getFrameUrl() + "?responderOn=true&sap-ui-xx-fakeOS=ios");
			}
		});
	});
