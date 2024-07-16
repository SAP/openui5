/*!
 * ${copyright}
 */

// Provides helper sap.ui.core.LabelEnablement
sap.ui.define(['../base/ManagedObject', "sap/base/assert"], function(ManagedObject, assert) {
"use strict";

// Mapping between controls and labels
var CONTROL_TO_LABELS_MAPPING = {};

// Mapping between the outer control and the inner control when outer control overwrites 'getIdForLabel'
const CONTROL_TO_INNERCONTROL_MAPPING = {};

// The controls which should not be referenced by a "for" attribute (Specified in the HTML standard).
// Extend when needed.
var NON_LABELABLE_CONTROLS = [
	"sap.ui.comp.navpopover.SmartLink",
	"sap.m.Link",
	"sap.m.Label",
	"sap.m.Text",
	"sap.m.Select",
	"sap.ui.webc.main.Label",
	"sap.ui.webc.main.Link"
];

var Element;

// Returns the control for the given id (if available) and invalidates it if desired
function toControl(sId, bInvalidate) {
	if (!sId) {
		return null;
	}

	Element ??= sap.ui.require("sap/ui/core/Element");
	var oControl = Element.getElementById(sId);
	// a control must only be invalidated if there is already a DOM Ref. If there is no DOM Ref yet, it will get
	// rendered later in any case. Elements must always be invalidated because they have no own renderer.
	if (oControl && bInvalidate && (!oControl.isA('sap.ui.core.Control') || oControl.getDomRef())) {
		oControl.invalidate();
	}

	return oControl;
}

function findLabelForControl(oLabel, fnOnAfterRendering) {
	const sId = oLabel.getLabelFor() || oLabel._sAlternativeId || '';
	const oRes = { controlId: sId };

	Element ??= sap.ui.require("sap/ui/core/Element");

	const oControl = Element.getElementById(sId);

	if (oControl && typeof oControl.getIdForLabel === "function") {
		const sDomIdForLabel = oControl.getIdForLabel();

		if (sDomIdForLabel !== oControl.getId()) {
			const oDomForLabel = document.getElementById(sDomIdForLabel);

			if (!oDomForLabel) {
				// The inner control based on 'getIdForLabel' isn't rendered yet
				// Wait for the next rendering and call the given callback
				const oDelegate = {
					onAfterRendering: function(oLabel) {
						this.removeEventDelegate(oDelegate);
						if (typeof fnOnAfterRendering === "function") {
							fnOnAfterRendering(oLabel);
						}
					}.bind(oControl, oLabel)
				};
				oControl.addEventDelegate(oDelegate);
			} else {
				const oControlForLabel = Element.closestTo(oDomForLabel);
				const sInnerControlId = oControlForLabel.getId();
				if (sInnerControlId !== sId) {
					oRes.innerControlId = sInnerControlId;
				}
			}
		}
	}

	return oRes;
}

// Updates the mapping tables for the given label, in destroy case only a cleanup is done
function refreshMapping(oLabel, bDestroy, bAfterRendering){
	var sLabelId = oLabel.getId();
	var sOldId = oLabel.__sLabeledControl;
	var oNewIdInfo = bDestroy ? null : findLabelForControl(oLabel, (oLabel) => {
		if (!bAfterRendering) {
			refreshMapping(oLabel, false /* bDestroy */, true /* bAfterRendering */);
		}
	});

	if (oNewIdInfo &&
		sOldId === oNewIdInfo.controlId &&
		oNewIdInfo.innerControlId === CONTROL_TO_INNERCONTROL_MAPPING[oNewIdInfo.controlId]) {
		return;
	}

	//Invalidate the label itself (see setLabelFor, setAlternativeLabelFor)
	if (!bDestroy) {
		oLabel.invalidate();
	}

	//Update the label to control mapping (1-1 mapping)
	if (oNewIdInfo?.controlId) {
		oLabel.__sLabeledControl = oNewIdInfo.controlId;
	} else {
		delete oLabel.__sLabeledControl;
	}

	//Update the control to label mapping (1-n mapping)
	var aLabelsOfControl;
	if (sOldId) {
		aLabelsOfControl = CONTROL_TO_LABELS_MAPPING[sOldId];
		if (aLabelsOfControl) {
			const sInnerControlId = CONTROL_TO_INNERCONTROL_MAPPING[sOldId];
			aLabelsOfControl = aLabelsOfControl.filter(function(sCurrentLabelId) {
				  return sCurrentLabelId != sLabelId;
			});
			if (aLabelsOfControl.length) {
				CONTROL_TO_LABELS_MAPPING[sOldId] = aLabelsOfControl;
				if (sInnerControlId) {
					CONTROL_TO_LABELS_MAPPING[sInnerControlId] = aLabelsOfControl;
				}
			} else {
				delete CONTROL_TO_LABELS_MAPPING[sOldId];
				if (sInnerControlId) {
					delete CONTROL_TO_LABELS_MAPPING[sInnerControlId];
					delete CONTROL_TO_INNERCONTROL_MAPPING[sOldId];
				}
			}
		}
	}
	if (oNewIdInfo?.controlId) {
		aLabelsOfControl = CONTROL_TO_LABELS_MAPPING[oNewIdInfo.controlId] || [];
		aLabelsOfControl.push(sLabelId);
		CONTROL_TO_LABELS_MAPPING[oNewIdInfo.controlId] = aLabelsOfControl;

		if (oNewIdInfo.innerControlId) {
			CONTROL_TO_LABELS_MAPPING[oNewIdInfo.innerControlId] = aLabelsOfControl;
			CONTROL_TO_INNERCONTROL_MAPPING[oNewIdInfo.controlId] = oNewIdInfo.innerControlId;
		} else {
			const sExistingInnerControl = CONTROL_TO_INNERCONTROL_MAPPING[oNewIdInfo.controlId];
			if (sExistingInnerControl) {
				delete CONTROL_TO_LABELS_MAPPING[sExistingInnerControl];
				delete CONTROL_TO_INNERCONTROL_MAPPING[oNewIdInfo.controlId];
			}
		}
	}

	//Invalidate related controls
	var oOldControl = toControl(sOldId, true);
	var oNewControl = toControl(oNewIdInfo?.controlId, true);

	if (oOldControl) {
		oLabel.detachRequiredChange(oOldControl);
	}

	if (oNewControl) {
		oLabel.attachRequiredChange(oNewControl);
	}

}

// Checks whether enrich function can be applied on the given control or prototype.
function checkLabelEnablementPreconditions(oControl) {
	if (!oControl) {
		throw new Error("sap.ui.core.LabelEnablement cannot enrich null");
	}
	var oMetadata = oControl.getMetadata();
	if (!oMetadata.isInstanceOf("sap.ui.core.Label")) {
		throw new Error("sap.ui.core.LabelEnablement only supports Controls with interface sap.ui.core.Label");
	}
	var oLabelForAssociation = oMetadata.getAssociation("labelFor");
	if (!oLabelForAssociation || oLabelForAssociation.multiple) {
		throw new Error("sap.ui.core.LabelEnablement only supports Controls with a to-1 association 'labelFor'");
	}
	//Add more detailed checks here ?
}

// Checks if the control is labelable according to the HTML standard
// The labelable HTML elements are: button, input, keygen, meter, output, progress, select, textarea
// Related incident 1770049251
function isLabelableControl(oControl) {
	if (!oControl) {
		return true;
	}

	if (oControl.isA("sap.ui.core.ILabelable")) {
		return oControl.hasLabelableHTMLElement();
	}

	var sName = oControl.getMetadata().getName();
	return NON_LABELABLE_CONTROLS.indexOf(sName) < 0;
}

/**
 * Helper functionality for enhancement of a <code>Label</code> with common label functionality.
 *
 * @see sap.ui.core.LabelEnablement#enrich
 *
 * @author SAP SE
 * @version ${version}
 * @protected
 * @alias sap.ui.core.LabelEnablement
 * @namespace
 * @since 1.28.0
 */
var LabelEnablement = {};

/**
 * Helper function for the <code>Label</code> control to render the HTML 'for' attribute.
 *
 * This function should be called at the desired location in the renderer code of the <code>Label</code> control.
 * It can be used with both rendering APIs, with the new semantic rendering API (<code>apiVersion 2</code>)
 * as well as with the old, string-based API.
 *
 * As this method renders an attribute, it can only be called while a start tag is open. For the new semantic
 * rendering API, this means it can only be called between an <code>openStart/voidStart</code> call and the
 * corresponding <code>openEnd/voidEnd</code> call. In the context of the old rendering API, it can be called
 * only after the prefix of a start tag has been written (e.g. after <code>rm.write("&lt;span id=\"foo\"");</code>),
 * but before the start tag ended, e.g before the right-angle ">" of the start tag has been written.
 *
 * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager that can be used for rendering.
 * @param {sap.ui.core.Label} oLabel The <code>Label</code> for which the 'for' HTML attribute should be rendered.
 * @protected
 */
LabelEnablement.writeLabelForAttribute = function(oRenderManager, oLabel) {
	if (!oLabel) {
		return;
	}

	const oControlInfo = findLabelForControl(oLabel, (oLabel) => {
		oLabel.invalidate();
	});

	if (!oControlInfo.controlId) {
		return;
	}

	Element ??= sap.ui.require("sap/ui/core/Element");
	const oControl = Element.getElementById(oControlInfo.innerControlId || oControlInfo.controlId);
	// The "for" attribute should only reference labelable HTML elements.
	if (oControl && typeof oControl.getIdForLabel === "function" && isLabelableControl(oControl)) {
		oRenderManager.attr("for", oControl.getIdForLabel());
	}
};

/**
 * Returns an array of IDs of the labels referencing the given element.
 *
 * @param {sap.ui.core.Element} oElement The element whose referencing labels should be returned
 * @returns {string[]} an array of ids of the labels referencing the given element
 * @public
 */
LabelEnablement.getReferencingLabels = function(oElement){
	var sId = oElement ? oElement.getId() : null;
	if (!sId) {
		return [];
	}
	return CONTROL_TO_LABELS_MAPPING[sId] || [];
};

/**
 * Collect the label texts for the given UI5 Element from the following sources:
 *  * The label returned from the function "getFieldHelpInfo"
 *  * The ids of label controls from labelling controls in LabelEnablement
 *  * The ids of label controls from "ariaLabelledBy" Association
 *  * The label and ids of label controls is enhanced by calling "enhanceAccessibilityState" of the parent control
 *
 * @param {sap.ui.core.Element} oElement The UI5 element for which the label texts are collected
 * @return {string[]} An array of label texts for the given UI5 element
 * @ui5-restricted sap.ui.core
 */
LabelEnablement._getLabelTexts = function(oElement) {
	// gather labels and labelledby ids
	const mLabelInfo = {};

	const oInfo = oElement.getFieldHelpInfo?.();
	if (oInfo?.label) {
		mLabelInfo.label = oInfo.label;
	}

	let aLabelIds = LabelEnablement.getReferencingLabels(oElement);
	if (aLabelIds.length) {
		mLabelInfo.labelledby = aLabelIds;
	}

	if (oElement.getMetadata().getAssociation("ariaLabelledBy")) {
		aLabelIds = oElement.getAriaLabelledBy();

		if (aLabelIds.length) {
			mLabelInfo.labelledby ??= [];

			aLabelIds.forEach((sLabelId) => {
				if (!mLabelInfo.labelledby.includes(sLabelId)) {
					mLabelInfo.labelledby.push(sLabelId);
				}
			});
		}
	}

	if (mLabelInfo.labelledby?.length) {
		mLabelInfo.labelledby = mLabelInfo.labelledby.join(" ");
	}

	// enhance it with parent control
	oElement.getParent()?.enhanceAccessibilityState?.(oElement, mLabelInfo);

	// merge the labels
	const aLabels = mLabelInfo.label ? [mLabelInfo.label] : [];

	if (mLabelInfo.labelledby) {
		mLabelInfo.labelledby.split(" ")
			.forEach((sLabelId) => {
				const oLabelControl = Element.getElementById(sLabelId);
				if (oLabelControl) {
					const sLabelText = oLabelControl.getText?.() || oLabelControl.getDomRef()?.innerText;
					if (sLabelText) {
						aLabels.push(sLabelText);
					}
				}
			});
	}

	return aLabels;
};

/**
 * Returns <code>true</code> when the given control is required (property 'required') or one of its referencing labels, <code>false</code> otherwise.
 *
 * @param {sap.ui.core.Element} oElement The element which should be checked for its required state
 * @returns {boolean} <code>true</code> when the given control is required (property 'required') or one of its referencing labels, <code>false</code> otherwise
 * @public
 * @since 1.29.0
 */
LabelEnablement.isRequired = function(oElement){

	if (checkRequired(oElement)) {
		return true;
	}

	var aLabelIds = LabelEnablement.getReferencingLabels(oElement),
		oLabel;

	Element ??= sap.ui.require("sap/ui/core/Element");

	for (var i = 0; i < aLabelIds.length; i++) {
		oLabel = Element.getElementById(aLabelIds[i]);
		if (checkRequired(oLabel)) {
			return true;
		}
	}

	return false;
};

function checkRequired(oElem) {
	return !!(oElem && oElem.getRequired && oElem.getRequired());
}

/**
 * This function should be called on a label control to enrich its functionality.
 *
 * <b>Usage:</b>
 * The function can be called with a control prototype:
 * <code>
 * sap.ui.core.LabelEnablement.enrich(my.Label.prototype);
 * </code>
 * Or the function can be called on instance level in the init function of a label control:
 * <code>
 * my.Label.prototype.init: function(){
 *    sap.ui.core.LabelEnablement.enrich(this);
 * }
 * </code>
 *
 * <b>Preconditions:</b>
 * The given control must implement the interface sap.ui.core.Label and have an association 'labelFor' with cardinality 0..1.
 * This function extends existing API functions. Ensure not to override these extensions AFTER calling this function.
 *
 * <b>What does this function do?</b>
 *
 * A mechanism is added that ensures that a bidirectional reference between the label and its labeled control is established:
 * The label references the labeled control via the HTML 'for' attribute (see {@link sap.ui.core.LabelEnablement#writeLabelForAttribute}).
 * If the labeled control supports the aria-labelledby attribute, a reference to the label is added automatically.
 *
 * In addition an alternative to apply a 'for' reference without influencing the labelFor association of the API is applied (e.g. used by Form).
 * For this purpose the functions setAlternativeLabelFor and getLabelForRendering are added.
 *
 * @param {sap.ui.core.Control} oControl the label control which should be enriched with further label functionality.
 * @throws Error if the given control cannot be enriched to violated preconditions (see above)
 * @protected
 */
LabelEnablement.enrich = function(oControl) {
	//Ensure that enhancement possible
	checkLabelEnablementPreconditions(oControl);

	oControl.__orig_setLabelFor = oControl.setLabelFor;
	oControl.setLabelFor = function(sId) {
		var res = this.__orig_setLabelFor.apply(this, arguments);
		refreshMapping(this);
		return res;
	};

	oControl.__orig_exit = oControl.exit;
	oControl.exit = function() {
		this._sAlternativeId = null;
		refreshMapping(this, true);
		if (oControl.__orig_exit) {
			oControl.__orig_exit.apply(this, arguments);
		}
	};

	// Alternative to apply a for reference without influencing the labelFor association of the API (see e.g. FormElement)
	oControl.setAlternativeLabelFor = function(sId) {
		if (sId instanceof ManagedObject) {
			sId = sId.getId();
		} else if (sId != null && typeof sId !== "string") {
			assert(false, "setAlternativeLabelFor(): sId must be a string, an instance of sap.ui.base.ManagedObject or null");
			return this;
		}

		this._sAlternativeId = sId;
		refreshMapping(this);

		return this;
	};

	// Returns id of the labelled control. The labelFor association is preferred before AlternativeLabelFor.
	oControl.getLabelForRendering = function() {
		var sId = this.getLabelFor() || this._sAlternativeId;
		var oControl = toControl(sId);
		var oLabelForControl;

		Element ??= sap.ui.require("sap/ui/core/Element");

		if (oControl &&
			!oControl.isA("sap.ui.core.ILabelable") &&
			oControl.getIdForLabel
			&& oControl.getIdForLabel()) {
			oLabelForControl = Element.getElementById(oControl.getIdForLabel());
			if (oLabelForControl) {
				oControl = oLabelForControl;
			}
		}

		return isLabelableControl(oControl) ? sId : "";
	};

	oControl.isLabelFor = function(oControl) {
		var sId = oControl.getId();
		var aLabels = CONTROL_TO_LABELS_MAPPING[sId];
		return aLabels && aLabels.indexOf(this.getId()) > -1;
	};

	if (!oControl.getMetadata().getProperty("required")) {
		return;
	}

	oControl.__orig_setRequired = oControl.setRequired;
	oControl.setRequired = function(bRequired) {
		var bOldRequired = this.getRequired(),
			oReturn = this.__orig_setRequired.apply(this, arguments);

		// invalidate the related control only when needed
		if (this.getRequired() !== bOldRequired) {
			toControl(this.__sLabeledControl, true);
		}

		return oReturn;
	};

	/**
	 * Checks whether the <code>Label</code> itself or the associated control is marked as required (they are mutually exclusive).
	 *
	 * @protected
	 * @returns {boolean} Returns if the Label or the labeled control are required
	 */
	oControl.isRequired = function(){
		// the value of the local required flag is ORed with the result of a "getRequired"
		// method of the associated "labelFor" control. If the associated control doesn't
		// have a getRequired method, this is treated like a return value of "false".
		var oFor = toControl(this.getLabelForRendering(), false);
		return checkRequired(this) || checkRequired(oFor);

	};

	/**
	 * Checks whether the <code>Label</code> should be rendered in display only mode.
	 *
	 * In the standard case it just uses the DisplayOnly property of the <code>Label</code>.
	 *
	 * In the Form another type of logic is used.
	 * Maybe later on also the labeled controls might be used to determine the rendering.
	 *
	 * @protected
	 * @returns {boolean} Returns if the Label should be rendered in display only mode
	 */
	oControl.isDisplayOnly = function(){

		if (this.getDisplayOnly) {
			return this.getDisplayOnly();
		} else {
			return false;
		}

	};

	/**
	 * Checks whether the <code>Label</code> should be rendered wrapped instead of trucated.
	 *
	 * In the standard case it just uses the <code>Wrapping</code> property of the <code>Label</code>.
	 *
	 * In the Form another type of logic is used.
	 *
	 * @protected
	 * @returns {boolean} Returns if the Label should be rendered in display only mode
	 */
	oControl.isWrapping = function(){

		if (this.getWrapping) {
			return this.getWrapping();
		} else {
			return false;
		}

	};

	// as in the Form the required change is checked, it'd not needed here
	oControl.disableRequiredChangeCheck = function(bNoCheck){

		this._bNoRequiredChangeCheck = bNoCheck;

	};

	oControl.attachRequiredChange = function(oFor){

		if (oFor && !this._bNoRequiredChangeCheck) {
			if (oFor.getMetadata().getProperty("required")) {
				oFor.attachEvent("_change", _handleControlChange, this);
			}
			this._bRequiredAttached = true; // to do not check again if control has no required property
		}

	};

	oControl.detachRequiredChange = function(oFor){

		if (oFor && !this._bNoRequiredChangeCheck) {
			if (oFor.getMetadata().getProperty("required")) {
				oFor.detachEvent("_change", _handleControlChange, this);
			}
			this._bRequiredAttached = false; // to do not check again if control has no required property
		}

	};

	function _handleControlChange(oEvent) {

		if (oEvent.getParameter("name") == "required") {
			this.invalidate();
		}

	}

	oControl.__orig_onAfterRendering = oControl.onAfterRendering;
	oControl.onAfterRendering = function(oEvent) {
		var res;

		if (this.__orig_onAfterRendering) {
			res = this.__orig_onAfterRendering.apply(this, arguments);
		}

		if (!this._bNoRequiredChangeCheck && !this._bRequiredAttached && this.__sLabeledControl) {
			var oFor = toControl(this.__sLabeledControl, false);
			this.attachRequiredChange(oFor);
		}

		return res;
	};

};

return LabelEnablement;

});
