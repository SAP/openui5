/**
 * Control which contains many aggregations
 */
sap.ui.define(['sap/ui/core/Control'], function(Control){
	var ManyAggregationsControl = Control.extend("sap.ui.core.qunit.mvc.viewprocessing.ManyAggregationsControl", {
		library: "sap.ui.core.qunit.mvc.viewprocessing",
		metadata: {
			defaultAggregation: "bottomControls",
			aggregations: {

				alternativeContent: {type: "sap.ui.core.Control", multiple: true},

				footerToolbar: {type: "sap.m.Toolbar", multiple: false},

				content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"},

				secondaryContent: {type: "sap.ui.core.Control", multiple: true},

				headerToolbar: {type: "sap.m.Toolbar", multiple: false},

				infoToolbar: {type: "sap.m.Toolbar", multiple: false},

				// two aggregations, but they will end up in only one
				bottomControls: {type: "sap.ui.core.Control", multiple: true, singularName: "bottomControl"},
				groundControls: {type: "sap.ui.core.Control", multiple: true, singularName: "groundControl"}
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
			renderCtrls(oControl.getAggregation("content"));
			renderCtrls(oControl.getAggregation("secondaryContent"));
			oRM.write("</div>");
		}
	});

	ManyAggregationsControl.prototype.toString = function() {
		return "ManyAggregationsControl";
	};

	return ManyAggregationsControl;
});