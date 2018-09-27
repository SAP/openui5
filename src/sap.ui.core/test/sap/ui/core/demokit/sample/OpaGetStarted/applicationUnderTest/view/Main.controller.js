sap.ui.define(['sap/ui/thirdparty/jquery', 'sap/ui/core/mvc/Controller'],
function(jQuery, Controller) {
	"use strict";

	return Controller.extend("appUnderTest.view.Main", {

		onButtonPress : function () {
			this.byId("myPage").setBusy(true);
			jQuery.ajax({
				url: "/some/remote/service/"
			}).done(
				function (sResult) {
					this.byId("myPage").setTitle(sResult);
				}.bind(this)
			).always(
				function () {
					this.byId("myPage").setBusy(false);
				}.bind(this)
			);
		}

	});

});
