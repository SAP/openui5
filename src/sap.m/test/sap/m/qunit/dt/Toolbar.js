/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/Toolbar',
	'sap/m/Button'],
	function(Toolbar, Button) {
	"use strict";

	return {
		timeout : 1000,
		create : function() {
			return new Toolbar({
				content : [new Button({text:"test"})]
			});
		}
	};

});
