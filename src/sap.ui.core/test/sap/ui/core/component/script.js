function main() {
	"use strict";
	sap.ui.loader.config({paths: {
		"test1/Component": "./Component1",
		"test1":  "./",
		"test2/Component": "./Component2",
		"test2": "./",
		"test3/Component": "./Component3",
		"test3": "./"
	}});
	sap.ui.require(['sap/ui/core/UIComponent'], function(UIComponent) {

		var oCompCont = new sap.ui.core.ComponentContainer({
			name: 'test1'
		});

		oCompCont.placeAt("target");

		// Emulate navigation after 3 seconds
		setTimeout(function() {

			// Destroy old component
			oCompCont.destroy();

			// expected: style1.css removed from DOM

			setTimeout(function() {
				// Create new component
				oCompCont = new sap.ui.core.ComponentContainer({
					name: 'test2'
				});
				oCompCont.placeAt("target");

				// expected: style1.css removed from DOM, style2.css added to DOM => #test is green
				// actual: style1.css NOT removed from DOM, style2.css added to DOM => #test is red

				// Emulate navigation after 3 seconds
				setTimeout(function() {

					// Destroy old component
					oCompCont.destroy();

					// expected: style1.css removed from DOM

					setTimeout(function() {
						// Create new component
						sap.ui.component({
							manifestUrl: "manifest.json",
							async: true
						}).then(function(oComponent) {
							oCompCont = new sap.ui.core.ComponentContainer({
								component: oComponent
							});
							oCompCont.placeAt("target");

							// Emulate navigation after 3 seconds
							setTimeout(function() {

								// Destroy old component
								oCompCont.destroy();

								// expected: style3.css removed from DOM

								setTimeout(function() {
									// Create new component
									sap.ui.component({
										manifestUrl: "manifest.appdescr",
										async: true
									}).then(function(oComponent) {
										oCompCont = new sap.ui.core.ComponentContainer({
											component: oComponent
										});
										oCompCont.placeAt("target");
									});

									// expected: style3.css removed from DOM, style4.css added to DOM => #test is blue

								}, 1000);

							}, 2000);

						});

						// expected: style2.css removed from DOM, style3.css added to DOM => #test is yellow
						// actual: style2.css NOT removed from DOM, style3.css added to DOM => #test is green

					}, 1000);

				}, 2000);

			}, 1000);

		}, 2000);

	});
}