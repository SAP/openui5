sap.ui.jsview("sap.ui.core.sample.View.preprocessor.Sample", {

	createContent: function(oController) {

		// Define sample preprocessor functions
		var fnXmlPreprocessor = function(xml, info, settings) {
			return new Promise(function(resolve) {
				setTimeout(function() {
					// alert(info.name + ": " + settings.message);
					// Convert apples to oranges
					var sXml = new XMLSerializer().serializeToString(xml);
					sXml = sXml.replace("apple", "orange");
					resolve(new DOMParser().parseFromString(sXml, "application/xml").documentElement);
				}, 500); // Timeout just for the effect :)
			});
		},

		fnControlPreprocessor = function(controls, info, settings) {
			return new Promise(function(resolve) {
				setTimeout(function() {
					// alert(info.name + ": " + settings.message);
					// Some manipulation of the control tree
					var oPanel = controls.getContent()[0];
					oPanel.removeAllContent();
					oPanel.addContent(new sap.m.Button({
						text: "Apple View",
						icon: "sap-icon://nutrition-activity",
						press: function() {
							alert("Fruit alert!");
						}
					}));
					resolve(/*return value is irrelevant for 'controls'*/);
				}, 500); // Timeout just for the effect :)
			});
		};

		var that = this;
		// Create a normal view
		sap.ui.xmlview({
			viewName: "sap.ui.core.sample.View.preprocessor.Sample",
			async: true
		}).loaded()
		.then(function(oView) {
			that.addContent(
				new sap.m.Text({
					text: "XML view instantiated with XML string:"
				}).addStyleClass("sapUiSmallMargin")
			);
			that.addContent(oView);
			// Create a view with preprocessor for 'xml'
			sap.ui.xmlview({
				viewName: "sap.ui.core.sample.View.preprocessor.Sample",
				async: true,
				preprocessors: {
					xml: {
						preprocessor: fnXmlPreprocessor,
						message: "'xml' preprocessor running"
					}
				}
			}).loaded()
			.then(function(oView) {
				that.addContent(
					new sap.m.Text({
						text: "XML view with 'xml' preprocessor:"
					}).addStyleClass("sapUiSmallMargin")
				);
				that.addContent(oView);
				// Create a view with preprocessor for 'controls'
				sap.ui.xmlview({
					viewName: "sap.ui.core.sample.View.preprocessor.Sample",
					async: true,
					preprocessors: {
						controls: {
							preprocessor: fnControlPreprocessor,
							message: "XML view with 'controls' preprocessor:"
						}
					}
				}).loaded()
				.then(function(oView) {
					that.addContent(
						new sap.m.Text({
							text: "XML view instantiated with XML string:"
						}).addStyleClass("sapUiSmallMargin")
					);
					that.addContent(oView);
				});
			});
		});
	}
});
