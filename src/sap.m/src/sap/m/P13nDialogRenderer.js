/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './DialogRenderer'],
	function(jQuery, DialogRenderer) {
	"use strict";


	/**
	 * P13nDialog renderer.
	 *
	 * @namespace
	 */
	var P13nDialogRenderer = sap.ui.core.Renderer.extend(DialogRenderer);
	
	/**
	 * CSS class to be applied to the root element of the ComboBoxBase.
	 *
	 * @readonly
	 * @const {string}
	 */
	P13nDialogRenderer.CSS_CLASS = "sapMPersoDialog";
	

	return P13nDialogRenderer;

}, /* bExport= */ true);
