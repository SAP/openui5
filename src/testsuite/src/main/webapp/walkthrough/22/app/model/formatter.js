sap.ui.define([
	"sap/ui/core/ValueState"
], function (ValueState) {
	"use strict";

	return {
		priceState : function (fPrice) {
			if (fPrice && fPrice > 50) {
				return ValueState.Error;
			} else {
				return ValueState.Success;
			}
		}
	};

}, /* bExport= */ true);
