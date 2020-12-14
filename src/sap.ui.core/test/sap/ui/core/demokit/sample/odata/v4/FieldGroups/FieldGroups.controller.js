/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.FieldGroups.FieldGroups", {
		onValidateFieldGroup : function (oEvent) {
			this.byId("contact").getBindingContext().requestSideEffects([
				{$PropertyPath : "FirstName"},
				{$PropertyPath : "LastName"}
			]);
		}
	});
});
