sap.ui.define(["sap/ui/core/Core", "sap/ui/core/Control", "./VerticalStepsRenderer"], function (Core, Control, VSR) {
	"use strict";
	var VerticalSteps = Control.extend("sap.dwp.workflow.controls.VerticalSteps", {
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
		renderer: VSR
	});

	VerticalSteps.prototype.onclick = function (oEvent) {
		var oTarget = oEvent.target,
			oRoot = this.getDomRef();
		while (!oTarget.classList.contains("clickable")) {
			oTarget = oTarget.parentNode;
			if (oTarget === oRoot) {
				return;
			}
		}
		if (oTarget.classList.contains("clickable")) {
			var oStep = Core.byId(oTarget.parentNode.id);
			this.fireSelectionChange({
				index: this.indexOfAggregation("steps", oStep),
				step: oStep
			});
		}

	};
	return VerticalSteps;
});