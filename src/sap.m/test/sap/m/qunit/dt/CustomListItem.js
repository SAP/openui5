/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/CustomListItem',
	'sap/m/Button'],
	function(CustomListItem, Button) {
	"use strict";

	return {
		create : function() {
			return new CustomListItem({
				content : [new Button({text:"test"})]
			});
		}
	};

});
