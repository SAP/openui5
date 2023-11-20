sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlue = BlockBase.extend("testdata.mvc.stashed.SomeBlock", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "testdata.mvc.stashed.SomeBlock",
						type: "XML"
					},
					Expanded: {
						viewName: "testdata.mvc.stashed.SomeBlock",
						type: "XML"
					}
				}
			},
			renderer: {}
		});

		return BlockBlue;

	});
