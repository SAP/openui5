/*global sinon*/
sap.ui.define(["./OutputText"], function (OutputText) {
    "use strict";

    return {
        doSomething: function () {
            if (this.isA("sap.ui.core.mvc.Controller")) {
                sinon.assert.pass("btn_1: Event handler is called with correct context (sap.ui.core.mvc.Controller).");
            } else {
                sinon.assert.fail("btn_1: Event handler is called with wrong context.");
            }
        },
        formatter: function (text) {
            if (this.isA?.("sap.m.Button")) {
                sinon.assert.pass("btn_1: formatter is called with correct context (sap.m.Button).");
                return `${this.getBinding("text").getModel().getProperty("/alternativeText")} (formatted)`;
            } else {
                sinon.assert.fail("btn_1: formatter is called with wrong context.");
                return `${text} (formatted)`;
            }
		},
		formatter2: function(text) {
			if (this === OutputText) {
				sinon.assert.pass("btn_3: formatter is called with correct context (testdata/xml-require/helper/OutputText).");
			} else {
				sinon.assert.fail("btn_3: formatter is called with wrong context.");
			}
			return `${text} (formatted2)`;
		}
    };
});