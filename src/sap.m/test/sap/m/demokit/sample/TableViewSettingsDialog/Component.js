sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TableViewSettingsDialog.Component", {

		metadata : {
			rootView : "sap.m.sample.TableViewSettingsDialog.V",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"V.view.xml",
						"C.controller.js",
						"Dialog.fragment.xml",
						"Formatter.js"
					]
				}
			}
		}
	});

	return Component;

});
