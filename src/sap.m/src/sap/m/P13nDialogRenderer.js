/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './DialogRenderer'],
	function(jQuery, DialogRenderer) {
	"use strict";


	/**
	 * @class P13nDialog renderer.
	 *
	 * @static
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
