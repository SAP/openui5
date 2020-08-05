sap.ui.define(['sap/ui/commons/Button', 'sap/ui/core/Fragment'],
	function(Button, Fragment) {
	"use strict";

	sap.ui.jsfragment("samples.components.ext.customer.MultiRootFragment", {

		createContent : function(oController) {
			var aContent = [ new Button(this.createId("customerButton1"),{
				text : "Hello World"

			}), new Button(this.createId("customerButton2"),{
				text : "Hello Button"
			}) ];
			return aContent;
		}

	});

});
