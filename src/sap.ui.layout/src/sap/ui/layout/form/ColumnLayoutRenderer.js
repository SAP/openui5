/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Renderer',
	'sap/ui/Device',
	'./FormLayoutRenderer'
	], function(Renderer, Device, FormLayoutRenderer) {
	"use strict";

	/**
	 * form/ColumnLayout renderer.
	 * @namespace
	 */
	var ColumnLayoutRenderer = Renderer.extend(FormLayoutRenderer);

	ColumnLayoutRenderer.getMainClass = function(){

		return "sapUiFormCL";

	};

	ColumnLayoutRenderer.renderContainers = function(oRm, oLayout, oForm){

		var iColumnsM = oLayout.getColumnsM();
		var iColumnsL = oLayout.getColumnsL();
		var iColumnsXL = oLayout.getColumnsXL();
		var aContainers = oForm.getVisibleFormContainers();
		var iContainers = aContainers.length;

		if (iContainers > 0) {
			// if more that one container render a DIV around containers
			if (iContainers > 1 || oLayout.getLayoutDataForElement(aContainers[0], "sap.ui.layout.form.ColumnContainerData")) {
				oRm.write("<div");
				oRm.addClass("sapUiFormCLContent");
				oRm.addClass("sapUiFormCLColumnsM" + iColumnsM);
				oRm.addClass("sapUiFormCLColumnsL" + iColumnsL);
				oRm.addClass("sapUiFormCLColumnsXL" + iColumnsXL);
				oRm.writeClasses();
				oRm.write(">");
			}

			for (var i = 0; i < iContainers; i++) {
				var oContainer = aContainers[i];
				this.renderContainer(oRm, oLayout, oContainer);
			}

			if (iContainers > 1) {
				oRm.write("</div>");
			}
		}

	};

	ColumnLayoutRenderer.renderContainer = function(oRm, oLayout, oContainer){

		var bExpandable = oContainer.getExpandable();
		var oToolbar = oContainer.getToolbar();
		var oTitle = oContainer.getTitle();
		var oOptions = oLayout._getContainerSize(oContainer);

		oContainer._checkProperties();

		oRm.write("<section");
		oRm.writeElementData(oContainer);
		oRm.addClass("sapUiFormCLContainer");
		oRm.addClass("sapUiFormCLContainerS" + oOptions.S.Size);
		oRm.addClass("sapUiFormCLContainerM" + oOptions.M.Size);
		oRm.addClass("sapUiFormCLContainerL" + oOptions.L.Size);
		oRm.addClass("sapUiFormCLContainerXL" + oOptions.XL.Size);
		// S-Break not needed as there is no float possible
		if (oOptions.M.Break) {
			oRm.addClass("sapUiFormCLContainerMBreak");
		}
		if (oOptions.L.Break) {
			oRm.addClass("sapUiFormCLContainerLBreak");
		}
		if (oOptions.XL.Break) {
			oRm.addClass("sapUiFormCLContainerXLBreak");
		}
		if (oOptions.S.FirstRow) {
			oRm.addClass("sapUiFormCLContainerSFirstRow");
		}
		if (oOptions.M.FirstRow) {
			oRm.addClass("sapUiFormCLContainerMFirstRow");
		}
		if (oOptions.L.FirstRow) {
			oRm.addClass("sapUiFormCLContainerLFirstRow");
		}
		if (oOptions.XL.FirstRow) {
			oRm.addClass("sapUiFormCLContainerXLFirstRow");
		}

		if (oToolbar) {
			oRm.addClass("sapUiFormContainerToolbar");
		} else if (oTitle) {
			oRm.addClass("sapUiFormContainerTitle");
		}

		if (!oContainer.getExpanded()) {
			oRm.addClass("sapUiFormCLContainerColl");
		}

		if (oContainer.getTooltip_AsString()) {
			oRm.writeAttributeEscaped('title', oContainer.getTooltip_AsString());
		}
		oRm.writeClasses();

		this.writeAccessibilityStateContainer(oRm, oContainer);

		oRm.write(">");

		this.renderHeader(oRm, oToolbar, oTitle, oContainer._oExpandButton, bExpandable, false, oContainer.getId());

		oRm.write("<div id=\"" + oContainer.getId() + "-content\" class=\"sapUiFormCLContainerCont\">");

		var aElements = oContainer.getVisibleFormElements();
		for (var i = 0; i < aElements.length; i++) {
			var oElement = aElements[i];
			this.renderElement(oRm, oLayout, oElement);

			if (Device.browser.chrome && i < oOptions.XL.Size && aElements.length > 1 && aElements.length <= oOptions.XL.Size) {
				// in Chrome columns are not filled properly for less elements -> an invisible dummy DIV helps
				// with this logic the result is near to the other browsers
				// this "work around" don't work for other browsers
				oRm.write("<div class=\"sapUiFormCLElementDummy\"></div>");
			}
		}

		oRm.write("</div>");
		oRm.write("</section>");

	};

	ColumnLayoutRenderer.renderElement = function(oRm, oLayout, oElement){

		var oLabel = oElement.getLabelControl();
		var oOptions;

		oRm.write("<div");
		oRm.writeElementData(oElement);
		oRm.addClass("sapUiFormCLElement");
		if (oElement.getTooltip_AsString()) {
			oRm.writeAttributeEscaped('title', oElement.getTooltip_AsString());
		}
		oRm.writeClasses();
		oRm.write(">");

		if (oLabel) {
			oOptions = oLayout._getFieldSize(oLabel);
			oRm.write("<div");
			oRm.addClass("sapUiFormElementLbl");
			oRm.addClass("sapUiFormCLCellsS" + oOptions.S.Size);
			oRm.addClass("sapUiFormCLCellsL" + oOptions.L.Size);
			oRm.writeClasses();
			oRm.write(">");

			oRm.renderControl(oLabel);

			oRm.write("</div>");
		}

		var aFields = oElement.getFieldsForRendering();
		if (aFields && aFields.length > 0) {
			for (var k = 0, kl = aFields.length; k < kl; k++) {
				var oField = aFields[k];
				if (!oField.isA("sap.ui.core.IFormContent")) {
					throw new Error(oField + " is not a valid Form content! Only use valid content in " + oLayout);
				}
				oOptions = oLayout._getFieldSize(oField);
				oRm.write("<div");
				oRm.addClass("sapUiFormCLCellsS" + oOptions.S.Size);
				oRm.addClass("sapUiFormCLCellsL" + oOptions.L.Size);
				if (oOptions.S.Break) {
					oRm.addClass("sapUiFormCLCellSBreak");
				}
				if (oOptions.L.Break) {
					oRm.addClass("sapUiFormCLCellLBreak");
				}
				if (oOptions.S.Space) {
					oRm.addClass("sapUiFormCLCellSSpace" + oOptions.S.Space);
				}
				if (oOptions.L.Space) {
					oRm.addClass("sapUiFormCLCellLSpace" + oOptions.L.Space);
				}
				oRm.writeClasses();
				oRm.write(">");

				oRm.renderControl(oField);

				oRm.write("</div>");
			}
		}
		oRm.write("</div>");

	};

	return ColumnLayoutRenderer;

}, /* bExport= */ true);
