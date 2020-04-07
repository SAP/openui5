/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/LocaleData",
	"sap/ui/core/sample/common/Controller"
], function (LocaleData, Controller) {
	"use strict";
	var oLocaleData = new LocaleData(sap.ui.getCore().getConfiguration().getLocale()),
		datePattern = oLocaleData.getDatePattern("medium"),
		dateTimePattern = oLocaleData.getCombinedDateTimePattern("medium", "medium"),
		timePattern = oLocaleData.getTimePattern("medium");

	return Controller.extend("sap.ui.core.sample.ViewTemplate.types.Template", {
		onInit : function () {
			var oView = this.getView();

			oView.byId("simpleForm").getContent().filter(function (oElement) {
				return oElement.getMetadata().getName() === "sap.m.Label";
			}).forEach(function (oLabel) {
				var oInput = oView.byId(oLabel.getLabelFor());

				switch (oLabel.getText()) {
					case "Date":
						oInput.setPlaceholder(datePattern);
						break;
					case "Duration":
						oInput.setPlaceholder("Datatype is not supported; no input possible");
						break;
					case "DateTime":
					case "DateTimeOffset":
					case "TimeStampLong":
					case "TimeStampShort":
						oInput.setPlaceholder(dateTimePattern);
						break;
					case "Time":
					case "TimeOfDay":
						oInput.setPlaceholder(timePattern);
						break;
					default:
						// nothing to do
				}
			});
		}
	});
});
