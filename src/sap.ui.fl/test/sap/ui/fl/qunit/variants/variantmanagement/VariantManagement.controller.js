sap.ui.define([
	'sap/ui/core/mvc/Controller', 'sap/m/MessageToast'
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.fl.sample.variantmanagement.VariantManagement", {

		onMarkAsChanged: function(oEvent) {
			var oVM = this.getView().byId("idVariantManagementCtrl");
			if (oVM) {
				oVM.setModified(true);
			}
		},
		onSave: function(oEvent) {
			var params = oEvent.getParameters();

			var sMode = params.overwrite ? "Update" : "New";

			var sMessage = sMode + "Name: " + params.name + "\nDefault: " + params.def + "\nOverwrite:" + params.overwrite + "\nSelected Item Key: " + params.key + "\nExe:" + params.exe;
			MessageToast.show(sMessage);
			jQuery.sap.log.error("\n" + sMessage);
		},
		onManage: function(oEvent) {
			var params = oEvent.getParameters();
			var renamed = params.renamed;
			var deleted = params.deleted;
			var exe = params.exe;
			var sMessage = "renamed: \n";
			for (var h = 0; h < renamed.length; h++) {
				sMessage += renamed[h].key + "=" + renamed[h].name + "\n";
			}
			sMessage += "\n\ndeleted: ";
			for (var f = 0; f < deleted.length; f++) {
				sMessage += deleted[f] + ",";
			}
			sMessage += "\n\nexe: ";
			for (var f = 0; f < exe.length; f++) {
				sMessage += '(' + exe[f].key + ' selected:' + exe[f].exe + "),";
			}

			if (params.def) {
				sMessage += "\n\ndef: " + params.def;
			}

			MessageToast.show(sMessage);
			jQuery.sap.log.error(sMessage);
		},
		onSelect: function(oEvent) {
			var params = oEvent.getParameters();
			var sMessage = "New Variant Selected: " + params.key;
			MessageToast.show(sMessage);
			jQuery.sap.log.error(sMessage);
		}
	});
});
