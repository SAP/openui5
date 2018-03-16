/*!
 * ${copyright}
 */

// Provides helper sap.ui.core.LabelEnablement
sap.ui.define(['jquery.sap.global', '../base/ManagedObject'],
	function(jQuery, ManagedObject) {
	"use strict";

	function lazyInstanceof(o, sModule) {
		var FNClass = sap.ui.require(sModule);
		return typeof FNClass === 'function' && (o instanceof FNClass);
	}

	// Mapping between controls and labels
	var CONTROL_TO_LABELS_MAPPING = {};

	// The controls which should not be referenced by a "for" attribute (Specified in the HTML standard).
	// Extend when needed.
	var NON_LABELABLE_CONTROLS = ["sap.m.Link", "sap.m.Select", "sap.m.Label", "sap.m.Text"];

	// Returns the control for the given id (if available) and invalidates it if desired
	function toControl(sId, bInvalidate) {
		if (!sId) {
			return null;
		}

		var oControl = sap.ui.getCore().byId(sId);
		// a control must only be invalidated if there is already a DOM Ref. If there is no DOM Ref yet, it will get
		// rendered later in any case. Elements must always be invalidated because they have no own renderer.
		if (oControl && bInvalidate && (!lazyInstanceof(oControl, 'sap/ui/core/Control') || oControl.getDomRef())) {
			oControl.invalidate();
		}

		return oControl;
	}

	function findLabelForControl(label) {
		var sId = label.getLabelFor() || label._sAlternativeId || '';

		return sId;
	}

	// Updates the mapping tables for the given label, in destroy case only a cleanup is done
	function refreshMapping(oLabel, bDestroy){
		var sLabelId = oLabel.getId();
		var sOldId = oLabel.__sLabeledControl;
		var sNewId = bDestroy ? null : findLabelForControl(oLabel);

		if (sOldId == sNewId) {
			return;
		}

		//Invalidate the label itself (see setLabelFor, setAlternativeLabelFor)
		if (!bDestroy) {
			oLabel.invalidate();
		}

		//Update the label to control mapping (1-1 mapping)
		if (sNewId) {
			oLabel.__sLabeledControl = sNewId;
		} else {
			delete oLabel.__sLabeledControl;
		}

		//Update the control to label mapping (1-n mapping)
		var aLabelsOfControl;
		if (sOldId) {
			aLabelsOfControl = CONTROL_TO_LABELS_MAPPING[sOldId];
			if (aLabelsOfControl) {
				aLabelsOfControl = aLabelsOfControl.filter(function(sCurrentLabelId) {
					  return sCurrentLabelId != sLabelId;
				});
				if (aLabelsOfControl.length) {
					CONTROL_TO_LABELS_MAPPING[sOldId] = aLabelsOfControl;
				} else {
					delete CONTROL_TO_LABELS_MAPPING[sOldId];
				}
			}
		}
		if (sNewId) {
			aLabelsOfControl = CONTROL_TO_LABELS_MAPPING[sNewId] || [];
			aLabelsOfControl.push(sLabelId);
			CONTROL_TO_LABELS_MAPPING[sNewId] = aLabelsOfControl;
		}

		//Invalidate related controls
		var oOldControl = toControl(sOldId, true);
		var oNewControl = toControl(sNewId, true);

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
	 * Helper function for the <code>Label</code> control to render the HTML 'for' attribute. This function should be called
	 * at the desired location in the renderer code of the <code>Label</code> control.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager that can be used for writing to the render-output-buffer.
	 * @param {sap.ui.core.Label} oLabel The <code>Label</code> for which the 'for' HTML attribute should be written to the render-output-buffer.
	 * @protected
	 */
	LabelEnablement.writeLabelForAttribute = function(oRenderManager, oLabel) {
		if (!oLabel || !oLabel.getLabelForRendering) {
			return;
		}

		var sControlId = oLabel.getLabelForRendering();
		if (!sControlId) {
			return;
		}

		var oControl = toControl(sControlId);
		if (oControl && oControl.getIdForLabel) {
			// for some controls the label must point to a special HTML element, not the outer one.
			sControlId = oControl.getIdForLabel();
		}

		// The "for" attribute should only reference labelable HTML elements.
		if (sControlId && isLabelableControl(oControl)) {
			oRenderManager.writeAttributeEscaped("for", sControlId);
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

		for (var i = 0; i < aLabelIds.length; i++) {
			oLabel = sap.ui.getCore().byId(aLabelIds[i]);
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
	 * The label references the labeled control via the HTML 'for' attribute (@see sap.ui.core.LabelEnablement#writeLabelForAttribute).
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
				jQuery.sap.assert(false, "setAlternativeLabelFor(): sId must be a string, an instance of sap.ui.base.ManagedObject or null");
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

			return isLabelableControl(oControl) ? sId : "";
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

}, /* bExport= */ true);