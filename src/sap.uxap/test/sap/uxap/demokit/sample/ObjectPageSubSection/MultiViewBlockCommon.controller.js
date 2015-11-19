(function () {
	'use strict';
	jQuery.sap.declare({modName: "sap.uxap.sample.ObjectPageSubSection.MultiViewBlockCommon", "type": "controller"});

	sap.ui.core.mvc.Controller.extend("sap.uxap.sample.ObjectPageSubSection.MultiViewBlockCommon", {
		handlePress: function () {
			var sNewMode = this.oParentBlock.getMode() == sap.uxap.ObjectPageSubSectionMode.Collapsed ? sap.uxap.ObjectPageSubSectionMode.Expanded : sap.uxap.ObjectPageSubSectionMode.Collapsed;
			this.oParentBlock.setMode(sNewMode);
		}
	});
}());

