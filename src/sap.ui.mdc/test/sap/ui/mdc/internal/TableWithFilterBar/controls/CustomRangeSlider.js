sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/RangeSlider",
	"sap/ui/model/base/ManagedObjectModel"
], function (Control, RangeSlider, ManagedObjectModel) {
	"use strict";

	var CustomRangeSlider = Control.extend("sap.ui.v4demo.controls.CustomRangeSlider", {
		metadata: {
			interfaces : ["sap.ui.core.IFormContent"],
			properties: {
				min: { type: "float", group: "Data", defaultValue: 0 },
				max: { type: "float", group: "Data", defaultValue: 100 },
				width: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%" },
				value: { type: "string", group: "Data"}
			},
			aggregations: {
				_content: { type: "sap.m.RangeSlider", multiple: false, visibility: "hidden" }
			},
			events: {
				change: {
					parameters: {
						value: { type: "string" }
					}
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.renderControl(oControl.getContent());
			}
		},
		_oContent: null,
		_oManagedObjectModel: null});

	CustomRangeSlider.prototype.getContent = function() {
		if (!this._oContent) {
			this._oContent = new RangeSlider(this.getId() + "-slider", {
				range: [this.getMin() || 0, this.getMax() || 100],
				showAdvancedTooltip: true,
				showHandleTooltip: true,
				progress: true,
				step: 1,
				enableTickmarks: true,
				width: this.getWidth()
			});

			this._oManagedObjectModel = new ManagedObjectModel(this);

			this._oContent.setModel(this._oManagedObjectModel, "composite");
			this._oContent.bindProperty("min", "composite>/min");
			this._oContent.bindProperty("max", "composite>/max");

			this._oContent.attachEvent("change", {}, this._changeListener, this);
			this.setAggregation("_content", this._oContent);
		}
		return this._oContent;
	};

	CustomRangeSlider.prototype._changeListener = function (oEvent) {
		var sNextValue = oEvent.mParameters.range.join("...");
		if (sNextValue != this.getValue()) {
			this.setProperty("value", sNextValue, true);
			this.fireChange({value: sNextValue});
		}
	};

	CustomRangeSlider.prototype.setValue = function(oValue) {
		this.setProperty("value", oValue);
		if (oValue) {
			var aNextValues = oValue.indexOf("...") != -1 ? oValue.split("...") : [this.getMin() || 0, this.getMax() || 100];
			var iValue1 = parseInt(aNextValues[0]);
			var iValue2 = parseInt(aNextValues[1]);
			if (iValue1 !== this.getContent().getValue()) {
				this.getContent().setValue(iValue1);
			}
			if (iValue2 !== this.getContent().getValue2()) {
				this.getContent().setValue2(iValue2);
			}
		}
	};

	CustomRangeSlider.prototype.exit = function () {
		if (this._oContent) {
			this._oContent.detachEvent("change", this._changeListener);
			this._oContent = undefined;
		}

		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			this._oManagedObjectModel = undefined;
		}

	};

	CustomRangeSlider.prototype.getIdForLabel = function() {
		return this.getId() + "-slider";
	};

	CustomRangeSlider.prototype.getFocusDomRef = function() {
		if (this._oContent) {
			return this._oContent.getFocusDomRef();
		} else {
			return this.getDomRef();
		}
	};

	CustomRangeSlider.prototype.getDomRef = function() {
		if (this._oContent) {
			return this._oContent.getDomRef();
		} else {
			return Control.prototype.getDomRef.apply(this, arguments);
		}
	};

	CustomRangeSlider.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {
		var oParent = this.getParent();
		if (oParent && oParent.enhanceAccessibilityState) {
			// use CustomRangeSlider as control, but aria properties of rendered inner control.
			oParent.enhanceAccessibilityState(this, mAriaProps);
		}
	};

	return CustomRangeSlider;

});
