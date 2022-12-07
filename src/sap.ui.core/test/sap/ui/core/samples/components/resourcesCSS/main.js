sap.ui.define(['sap/ui/core/ComponentContainer', 'sap/ui/core/Component'], function(ComponentContainer, Component) {
	"use strict";

	var oCompCont = new ComponentContainer({
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
			oCompCont = new ComponentContainer({
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
					Component.create({
						manifest: "manifest.json"
					}).then(function(oComponent) {
						oCompCont = new ComponentContainer({
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
								Component.create({
									manifest: "manifest.appdescr"
								}).then(function(oComponent) {
									oCompCont = new ComponentContainer({
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
