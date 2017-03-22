/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/layout/HorizontalLayout',
	'sap/m/Button'],
	function(HorizontalLayout, Button) {
	"use strict";

	return {
		timeout : 1000,
		create : function() {
			return new HorizontalLayout({
				content : [new Button({text:"test"})]
			});
		}
	};

});