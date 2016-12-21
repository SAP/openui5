/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.form.FormElement
sap.ui.define(['sap/ui/layout/form/Form', 'sap/ui/layout/form/FormContainer', 'sap/ui/layout/form/ResponsiveGridLayout'],
	function(Form, FormContainer, ResponsiveGridLayout) {
	"use strict";

	return {
		domRef : function(oFormElement) {
			var oParent = oFormElement.getParent();
			if (oParent instanceof FormContainer) {
				oParent = oParent.getParent();
				if (oParent instanceof Form) {
					var oLayout = oParent.getLayout();
					// formLayout, responsiveLayout and GridLayout are implementing getRenderedDomFor
					// method thus don't need design-time dom ref definition
					if (oLayout instanceof ResponsiveGridLayout) {
						var aFields = oFormElement.getFields();
						var oLabel = oFormElement.getLabel();
						if (typeof (oLabel) === "string"){
							if (oFormElement.getLabelControl){
								oLabel = oFormElement.getLabelControl();
							} else { // can't retrieve label object
								oLabel = null;
							}
						}
						if (oLabel) {
							aFields.unshift(oLabel);
						}

						return aFields.filter(function(oElement) {
							return oElement.getDomRef && oElement.getDomRef();
						}).map(function(oElement) {
							var oDomRef = oElement.getDomRef();
							return oDomRef.parentNode;
						});
					}
				}
			}
		}
	};

}, /* bExport= */ false);
