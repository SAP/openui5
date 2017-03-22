/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/Page',
	'sap/m/Toolbar',
	'sap/m/Button',
	'sap/ui/layout/VerticalLayout'],
	function(Page, Toolbar, Button, VerticalLayout) {
	"use strict";

	return {
		create : function() {
			return new Page({
				headerContent : [new Button({text:"test"})],
				subHeader : new Toolbar(),
				footer : new Toolbar()
			});
		}
	};

});
