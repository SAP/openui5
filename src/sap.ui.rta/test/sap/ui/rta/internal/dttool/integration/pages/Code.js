sap.ui.define([
	"sap/ui/test/Opa5"
],
function (
	Opa5
) {
	"use strict";

	return {
		assertions: {
			theViewsXMLFileShouldBeDisplayed: function (filename) {
				return this._checkFile(filename);
			},
			theElementsDesigntimeShouldBeDisplayed: function (filename) {
				return this._checkFile(filename);
			},
			theElementsComputedPropertiesShouldBeDisplayed: function (filenamePart) {
				return this._checkFile(filenamePart, "properties.json", true);
			},
			_checkFile: function (filename, fileExtension, doPartialCheck) {
				return this.waitFor({
					id: "tabHead",
					viewName: "Code",
					matchers: function (oTabHead) {
						var aFiles = oTabHead.getAggregation("items");
						return !!aFiles.find(function (oFile) {
							var fname = oFile.getProperty("key");
							return (doPartialCheck ?
									fname.indexOf(filename) >= 0 : fname === filename)
								&& (fileExtension ?
									fname.endsWith(fileExtension) : true);
						});
					},
					success: function () {
						Opa5.assert.ok(true, (fileExtension ? "The " + fileExtension + " file " : "") + filename + (doPartialCheck ? "(...)" : "") + " is displayed in the code editor");
					},
					errorMessage: filename + " is not displayed in the code editor"
				});
			}
		}
	};
});