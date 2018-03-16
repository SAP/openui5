/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', './FormLayoutRenderer'],
	function(Renderer, FormLayoutRenderer) {
	"use strict";


	/**
	 * form/ResponsiveGridLayout renderer.
	 * @namespace
	 */
	var ResponsiveGridLayoutRenderer = Renderer.extend(FormLayoutRenderer);

	ResponsiveGridLayoutRenderer.getMainClass = function(){
		return "sapUiFormResGrid";
	};

	ResponsiveGridLayoutRenderer.renderContainers = function(rm, oLayout, oForm){

		var aVisibleContainers = oForm.getVisibleFormContainers();
		var iLength = aVisibleContainers.length;

		if (iLength > 0) {
			// special case: only one container -> do not render an outer Grid
			if (iLength > 1 || !oLayout.getSingleContainerFullSize()) {
				//render Grid
				rm.renderControl(oLayout._mainGrid);
			} else if (oLayout.mContainers[aVisibleContainers[0].getId()][0]) {
				// render panel
				rm.renderControl(oLayout.mContainers[aVisibleContainers[0].getId()][0]);
			} else {
				// render Grid of container
				rm.renderControl(oLayout.mContainers[aVisibleContainers[0].getId()][1]);
			}
		}

	};

	return ResponsiveGridLayoutRenderer;

}, /* bExport= */ true);
