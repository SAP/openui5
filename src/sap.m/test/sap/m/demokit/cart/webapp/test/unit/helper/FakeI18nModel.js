sap.ui.define([
	"sap/ui/model/Model",
	"sap/base/strings/formatMessage"
], function (
	Model,
	formatMessage) {
	"use strict";


	return Model.extend("test.unit.helper.FakeI18nModel", {

		constructor : function (mTexts) {
			Model.call(this);
			this.mTexts = mTexts || {};
		},

		getResourceBundle : function () {
			return {
				getText : (sTextName, aArgs) => {
					return formatMessage(this.mTexts[sTextName], aArgs);
				}
			};
		}

	});

});
