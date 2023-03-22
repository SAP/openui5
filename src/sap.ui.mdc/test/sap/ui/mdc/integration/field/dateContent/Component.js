/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/type/Date", // to have it loaded
	"sap/ui/model/type/DateTime", // to have it loaded
	"sap/ui/model/type/Time" // to have it loaded
], function (
	UIComponent,
	DateType,
	DateTimeType,
	TimeType
	) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.integration.field.dateContent.Component", {
		metadata : {
			manifest: "json"
		}
	});
});
