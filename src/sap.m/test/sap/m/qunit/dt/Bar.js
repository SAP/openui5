/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/Bar',
	'sap/m/Button'],
	function(Bar, Button) {
	"use strict";

	return {
		timeout : 1000,
		create : function() {
			return new Bar({
				contentLeft : [new Button({text:"test"})],
				contentMiddle : [new Button({text:"test"})],
				contentRight : [new Button({text:"test"})]
			});
		}
	};

});
