sap.ui.define([
	'sap/ui/base/ManagedObject'
], function(ManagedObject) {
	"use strict";

	return {
		listMetaContext: function(oContext) {
			var oBindingInfo = oContext.getModel().getProperty(oContext.getPath());
			if (typeof oBindingInfo === "string") {
				oBindingInfo = ManagedObject.bindingParser(oBindingInfo);
			}
			// if (jQuery.isArray(oBindingInfo)) {
			//     var oBinding = oContext.getModel().getProperty(oContext.getPath() + "/@binding");
			//     if (oBinding) {
			//         return oBinding.getModel().getMetaModel().getMetaContext(oBinding.getPath());
			//     } else {
			//         return undefined;
			//     }
			// }
			if (typeof oBindingInfo === "object") {
				oBindingInfo = ManagedObject.bindingParser("{" + oBindingInfo.path + "}");
                var oVisitor = oContext.getModel().getVisitor();
                var oJSONModel = oVisitor.getSettings().models[oBindingInfo.model];
				return oJSONModel.getContext(oBindingInfo.path);
			}
		}
	}
}, /* bExport= */true);
