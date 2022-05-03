sap.ui["define"]("sap/ui/core/CommandExecution", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/core/ExtensionPoint", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/core/Shortcut", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/performance/trace/Interaction", [], function() {
	return {
		notifyAsyncStep: function() { return function(){};},
		setStepComponent: function() {},
		notifyStepStart: function() {},
		getActive: function() {return false;}
	};
});
sap.ui["define"]("sap/ui/performance/trace/Measurement", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/core/LocaleData", [], function() { return undefined; });

sap.ui.require([
	"sap/ui/core/Core"
], function(Core) {
	"use strict";
		Core.boot();
		sap.ui.require([
			"sap/ui/core/ComponentContainer"
		], function(ComponentContainer) {
			// oPH = new Placeholder({
			// 	html:"sap/ui/demo/todo/view/ph.fragment.html"
			// })
			Core.attachInit(function() {
				new ComponentContainer({
					id: "compCont",
					name: "sap.ui.demo.todo",
					async: true,
					manifest: true
				}).placeAt("content");
				// oCompCont.showPlaceholder({placeholder: oPH});
			});
		},function(oError) {console.log(oError);});
},function(oError) {console.log(oError);});
