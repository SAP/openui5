sap.ui.define([
	"sap/ui/model/Model"
], function(Model) {
	"use strict";

	return Model.extend("test.unit.helper.FakeI18nModel", {

		constructor: function(mTexts) {
			this.mTexts = mTexts || {};
		},

		getResourceBundle: function() {
			return {
				getText: function(sTextName) {
					return this.mTexts[sTextName];
				}.bind(this)
			};
		}

	});

});