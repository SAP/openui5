sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListBoxContainer.C", {
		onInit: function () {
			var model = new sap.ui.model.json.JSONModel();
			var data = [
				{ title: "Box title 1", subtitle: "Subtitle 1", group: "Group A" },
				{ title: "Box title 2", subtitle: "Subtitle 2", group: "Group A" },
				{ title: "Box title 3", subtitle: "Subtitle 3", group: "Group A" },
				{ title: "Box title 4", subtitle: "Subtitle 4", group: "Group A" },
				{ title: "Box title 5", subtitle: "Subtitle 5", group: "Group A" },
				{ title: "Box title 6 Box title Box title Box title Box title Box title", subtitle: "Subtitle 6", group: "Group A" },
				{ title: "Very long Box title that should wrap 7", subtitle: "This is a long subtitle 7" },
				{ title: "Box title B 8", subtitle: "Subtitle 8", group: "Group B" },
				{ title: "Box title B 9 Box title B  Box title B 9 Box title B 9Box title B 9title B 9 Box title B 9Box title B", subtitle: "Subtitle 9", group: "Group B" },
				{ title: "Box title B 10", subtitle: "Subtitle 10", group: "Group B" },
				{ title: "Box title B 11", subtitle: "Subtitle 11", group: "Group B" },
				{ title: "Box title B 12", subtitle: "Subtitle 12", group: "Group B" },
				{ title: "Box title 13", subtitle: "Subtitle 13", group: "Group A" },
				{ title: "Box title 14", subtitle: "Subtitle 14", group: "Group A" },
				{ title: "Box title 15", subtitle: "Subtitle 15", group: "Group A" },
				{ title: "Box title 16", subtitle: "Subtitle 16", group: "Group A" },
				{ title: "Box title 17", subtitle: "Subtitle 17", group: "Group A" },
				{ title: "Box title 18", subtitle: "Subtitle 18", group: "Group A" },
				{ title: "Very long Box title that should wrap 19", subtitle: "This is a long subtitle 19" },
				{ title: "Box title B 20", subtitle: "Subtitle 20", group: "Group B" },
				{ title: "Box title B 21", subtitle: "Subtitle 21", group: "Group B" },
				{ title: "Box title B 22", subtitle: "Subtitle 22", group: "Group B" },
				{ title: "Box title B 23", subtitle: "Subtitle 23", group: "Group B" },
				{ title: "Box title B 24", subtitle: "Subtitle 24", group: "Group B" },
				{ title: "Box title B 21", subtitle: "Subtitle 21", group: "Group B" },
				{ title: "Box title B 22", subtitle: "Subtitle 22", group: "Group B" },
				{ title: "Box title B 23", subtitle: "Subtitle 23", group: "Group B" }
			];
			model.setData(data);

			this.getView().setModel(model);
		},
		onSliderMoved: function (oEvent) {
			var value = oEvent.getParameter("value");
			this.byId("gridList").setWidth(value + "%");
		}
	});

});

