sap.ui.define([
	"sap/ui/model/Model"
], function (Model) {
	"use strict";


	return Model.extend("test.unit.helper.FakeI18nModel", {

		constructor : function (mTexts) {
			Model.call(this);
			this.mTexts = mTexts || {};
		},

		getResourceBundle : function () {
			return {
				getText : function (sTextName) {
					return jQuery.sap.formatMessage.call(this, this.mTexts[sTextName], [].slice.call(arguments, 1));
				}.bind(this)
			};
		}

	});

});