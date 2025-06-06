sap.ui.define([
	"sap/ui/model/Model",
	"sap/base/strings/formatMessage"
], (Model, formatMessage) => {
	"use strict";

	return Model.extend("test.unit.helper.FakeI18nModel", {
		constructor: function (mTexts) {
			Model.call(this);
			this.mTexts = mTexts || {};
		},

		getResourceBundle() {
			return {
				getText: (sTextName, aArgs) => formatMessage(this.mTexts[sTextName], aArgs)
			};
		}
	});
});