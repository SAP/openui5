/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.DropdownBox
sap.ui.define(['jquery.sap.global', './ComboBoxRenderer'],
	function(jQuery, ComboBoxRenderer) {
	"use strict";


	/**
	 * DropdownBox renderer.
	 * @namespace
	 */
	var DropdownBoxRenderer = sap.ui.core.Renderer.extend(ComboBoxRenderer);

	/**
	 * Renders additional HTML for the DropdownBox to the TextField before the INPUT element (sets the icon).
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oDdb An object representation of the control that should be rendered
	 */
	DropdownBoxRenderer.renderOuterContentBefore = function(rm, oDdb){

		this.renderExpander(rm, oDdb);

	};

	/**
	 * Renders additional HTML for the DropdownBox to the TextField after the INPUT element (sets the select box).
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oDdb An object representation of the control that should be rendered
	 */
	DropdownBoxRenderer.renderOuterContent = function(rm, oDdb){

		this.renderSelectBox(rm, oDdb, '0');

		if (oDdb.getDisplaySecondaryValues()) {
			rm.write("<span id=\"" + oDdb.getId() + "-SecVal\" style=\"display: none;\"></span>");
		}

	};

	/**
	 * Used to set the tabindex of the dropdownbox to -1.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oDdb An object representation of the control that should be rendered
	 */
	DropdownBoxRenderer.renderTextFieldEnabled = function(rm, oDdb) {

		if (oDdb.mobile) {
			rm.writeAttribute('tabindex', '-1');
		} else if (!oDdb.getEnabled()) {
			rm.writeAttribute('disabled', 'disabled');
			rm.writeAttribute('tabindex', '-1');
		} else if (!oDdb.getEditable()) {
			rm.writeAttribute('tabindex', '0');
		} else {
			rm.writeAttribute('tabindex', '0');
		}

	};

	/*
	 * Renders ARIA information for the dropdownbox (outer &lt;div&gt;)
	 * @param {sap.ui.fw.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.fw.Control} oControl an object representation of the control that should be rendered
	 * @private
	 */
	DropdownBoxRenderer.renderARIAInfo = function(rm, oDdb) {

		var iPosInSet = -1;
		if (oDdb.getSelectedItemId()) {
			for ( var i = 0; i < oDdb.getItems().length; i++) {
				var oItem = oDdb.getItems()[i];
				if (oItem.getId() == oDdb.getSelectedItemId()) {
					iPosInSet =  i + 1;
					break;
				}
			}
		}

		var mProps = {
				autocomplete: "list",
				live: "polite",
				setsize: oDdb.getItems().length,
				posinset: (iPosInSet >= 0) ? iPosInSet : undefined
			};

		if (oDdb.getValueState() == sap.ui.core.ValueState.Error) {
			mProps["invalid"] = true;
		}

		if (oDdb.getDisplaySecondaryValues()) {
			mProps["describedby"] = {
				value: oDdb.getId() + "-SecVal",
				append: true
			};
		}

		rm.writeAccessibilityState(oDdb, mProps);

	};

	return DropdownBoxRenderer;

}, /* bExport= */ true);
