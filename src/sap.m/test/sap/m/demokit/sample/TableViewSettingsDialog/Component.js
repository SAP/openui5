sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TableViewSettingsDialog.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.TableViewSettingsDialog.SettingsDialogView",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"SettingsDialogView.view.xml",
						"SettingsDialogController.controller.js",
						"SortDialog.fragment.xml",
						"FilterDialog.fragment.xml",
						"GroupDialog.fragment.xml",
						"Formatter.js"
					]
				}
			}
		}
	});

	return Component;

});
