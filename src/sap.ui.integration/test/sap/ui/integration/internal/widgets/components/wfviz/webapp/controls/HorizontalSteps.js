sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"./HorizontalStepsRenderer"
	], function(Core, Control, HSR) {
	"use strict";

	var HorizontalSteps = Control.extend("sap.dwp.workflow.controls.HorizontalSteps", {
		metadata: {
			properties: {
				selectedIndex: {
					type: "int",
					defaultValue: 0
				}
			},
			aggregations: {
				steps: {
					type: "sap.dwp.workflow.controls.Step",
					multiple: true
				}
			},
			events: {
				selectionChange : {
					index: {
						type: "int"
					},
					step: {
						type: "sap.dwp.workflow.controls.Step"
					}
				}
			},
			defaultAggregation: "steps"
		},
		renderer: HSR
	});

	HorizontalSteps.prototype._getLI = function(oEvent) {
		var oLI = oEvent.target,
			oRoot = this.getDomRef();
		while (oLI.tagName !== "LI" && oLI !== oRoot) {
			oLI = oLI.parentNode;
		}
		if (oLI !== oRoot) {
			return oLI;
		}
	};

	//apply colors to step
	HorizontalSteps.prototype.applyColors = function (oDomRef, colors) {
		if (oDomRef.classList.contains("begin")) {
			oDomRef.style.backgroundImage = "url('data:image/svg+xml;base64," + HSR.getSvg("begin", colors) + "')";
		}
		if (oDomRef.classList.contains("beginend")) {
			oDomRef.style.backgroundImage = "url('data:image/svg+xml;base64," + HSR.getSvg("beginEnd", colors) + "')";
		}
		if (oDomRef.classList.contains("middle")) {
			oDomRef.style.backgroundImage = "url('data:image/svg+xml;base64," + HSR.getSvg("middle", colors) + "')";
		}
		if (oDomRef.classList.contains("end")) {
			oDomRef.style.backgroundImage = "url('data:image/svg+xml;base64," + HSR.getSvg("end", colors) + "')";
		}
	};
	//hover items
	HorizontalSteps.prototype.onmouseover = function(oEvent) {
		var oLI = this._getLI(oEvent);
		if (oLI && oLI.tagName === "LI" && oLI.classList.contains("active")) {
			var oStep = Core.byId(oLI.id);
			var colors = HSR.getColors(oStep.getStatus(), this.indexOfAggregation("steps", oStep) === this.getSelectedIndex());
			colors.backgroundColor = HSR.hoverBackground;
			this.applyColors(oLI, colors);
		}
		if (oEvent.buttons === 1) {
			this.onmousedown(oEvent);
		}
	};
	HorizontalSteps.prototype.onmouseout = function(oEvent) {
		var oLI = this._getLI(oEvent);
		if (oLI && oLI.tagName === "LI" && oLI.classList.contains("active")) {
			var oStep = Core.byId(oLI.id);
			var colors = HSR.getColors(oStep.getStatus(), this.indexOfAggregation("steps", oStep) === this.getSelectedIndex());
			this.applyColors(oLI, colors);
		}
		if (oEvent.buttons === 1) {
			this.onmouseup(oEvent);
		}
	};
	//mouse down/up
	HorizontalSteps.prototype.onmousedown = function(oEvent) {
		var oLI = this._getLI(oEvent);
		if (oLI && oLI.tagName === "LI" && oLI.classList.contains("active")) {
			var oStep = Core.byId(oLI.id);
			var colors = HSR.getColors(oStep.getStatus(), this.indexOfAggregation("steps", oStep) === this.getSelectedIndex());
			colors.backgroundColor = HSR.activeBackground;
			this.applyColors(oLI, colors);
			oLI.classList.add("down");
		}
	};
	HorizontalSteps.prototype.onmouseup = function(oEvent) {
		var oLI = this._getLI(oEvent);
		if (oLI && oLI.tagName === "LI" && oLI.classList.contains("active")) {
			var oStep = Core.byId(oLI.id);
			var colors = HSR.getColors(oStep.getStatus(), this.indexOfAggregation("steps", oStep) === this.getSelectedIndex());
			this.applyColors(oLI, colors);
			oLI.classList.remove("down");
		}
	};
	//click
	HorizontalSteps.prototype.onclick = function(oEvent) {
		var oLI = this._getLI(oEvent);
		if (oLI && oLI.tagName === "LI" && oLI.classList.contains("active")) {
			var oStep = Core.byId(oLI.id);
			this.fireSelectionChange({
				index: this.indexOfAggregation("steps", oStep),
				step: oStep
			});
		}
	};
	return HorizontalSteps;
});