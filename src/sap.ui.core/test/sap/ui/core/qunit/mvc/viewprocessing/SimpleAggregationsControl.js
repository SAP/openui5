/**
 * Control which contains Simple aggregations
 */
sap.ui.define(['sap/ui/core/Control'], function(Control){
	var SimpleAggregationsControl = Control.extend("sap.ui.core.qunit.mvc.viewprocessing.SimpleAggregationsControl", {
		library: "sap.ui.core.qunit.mvc.viewprocessing",
		metadata: {
			defaultAggregation: "bottomControls",
			aggregations: {

				alternativeContent: {type: "sap.ui.core.Control", multiple: true}
			}
		},
		renderer: function (oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("myTestAggrs");
			oRM.writeClasses();
			oRM.write(">");

			var renderCtrls = function(aCtrls){
				if (aCtrls){
					aCtrls.forEach(function(oCtrl) {
						oRM.renderControl(oCtrl);
					});
				}
			};

			renderCtrls(oControl.getAggregation("alternativeContent"));
			oRM.write("</div>");
		}
	});

	SimpleAggregationsControl.prototype.toString = function() {
		return "SimpleAggregationsControl";
	};

	return SimpleAggregationsControl;
});