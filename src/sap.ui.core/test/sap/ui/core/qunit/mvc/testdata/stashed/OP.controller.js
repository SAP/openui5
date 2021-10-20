sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/core/StashedControlSupport'],
	function (Controller, StSu) {
	"use strict";

	var oMyController = Controller.extend("testdata.mvc.stashed.OP", {
		unstashAll: function() {
			var aAllControls = StSu.getStashedControls(this.getView().createId("ObjectPageLayout"));
			aAllControls.forEach(function(oSC, i) {
				setTimeout(function() {oSC.unstash();}, (250 * i));
			});
		},
		unstashSome: function() {
			var aAllControls = StSu.getStashedControls(this.getView().createId("ObjectPageLayout"));
			aAllControls.forEach(function(oSC, i) {
				if (i % 2 === 0) {
					setTimeout(function() {oSC.unstash();}, (250 * i));
				}
			});
		}
	});
	return oMyController;
});