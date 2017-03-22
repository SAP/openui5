/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/layout/VerticalLayout',
	'sap/m/Button'],
	function(VerticalLayout, Button) {
	"use strict";

	return {
		timeout : 1000,
		create : function() {
			return new VerticalLayout({
				content : [new Button({text:"test"})]
			});
		}
	};

});