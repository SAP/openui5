jQuery.sap.declare("sap.m.sample.TableBreadcrumb.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TableBreadcrumb.Component", {

	metadata : {
		rootView :  "sap.m.sample.TableBreadcrumb.Page",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		includes : [ "TableBreadcrumb/style.css" ],
		config : {
			sample : {
				stretch : true,
				files : [
					"style.css",
					"Page.view.xml",
					"Page.controller.js",
					"Formatter.js",
					"Row.fragment.xml",
					"productHierarchy.json"
				]
			}
		}
	}
});