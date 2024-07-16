// Note: the HTML page 'HTMLControl.html' loads this module via data-sap-ui-on-init

sap.ui.define(["sap/ui/core/Element", "sap/ui/commons/layout/MatrixLayout", "sap/m/Button", "sap/ui/layout/VerticalLayout", "sap/ui/layout/HorizontalLayout", "sap/m/Input", "sap/ui/core/HTML", "sap/m/Dialog", "sap/ui/thirdparty/jquery"], function(Element, MatrixLayout, Button, VerticalLayout, HorizontalLayout, Input, HTML, Dialog, jQuery) {
	"use strict";
	// create the controls in the head
	var oLayout = new MatrixLayout();
	oLayout.setLayoutFixed(false);
	var oButton1 = new Button({
		text: "Wrap With SAPUI5 Controls",
		tooltip : "Creates a Control Tree around the existing HTML and places it at the 'target1' div below",
		press: createOuterControlTree
	});
	var oButton2 = new Button({
		text: "Create Nested Control",
		tooltip : "Creates a Control and places it within the HTML Container",
		press: createNestedControlTree
	});
	oLayout.createRow(oButton1, oButton2);
	oLayout.placeAt("controls");

	jQuery(document).ready(
		function() {
			jQuery("#embedded span").on("click", {
					function(event) {
						var sColor = event.target && jQuery.css(event.target, "background-color").toLowerCase();
						var bRed = sColor == "#ff0000" || sColor == "rgb(255, 0, 0)";
						if ( bRed ) {
							jQuery("<span>red clicked" + new Date() + "</span><br>").appendTo(jQuery("#log"));
						} else {
							jQuery("<span>yellow clicked" + new Date() + "</span><br>").appendTo(jQuery("#log"));
						}
					}
			});
			animate();
		}
	);

	function createOuterControlTree() {
		var oTextField;
		var oLayout = new VerticalLayout({
			content: [
				new HorizontalLayout({
					content: [
						new Button({
							text: "Some Button",
							tooltip : "Just a sample for a SAPUI5 Control",
							press: function() {
								oTextField.setValue("" + new Date().getTime());
							}
						}),
						oTextField = new Input({
							value : "Some Initial Value"
						})
					]
				}),
				new HTML({ id : "embedded" })
			]
		});

		var oDialog = new Dialog({
			title : "A SAPUI5 Dialog",
			content: oLayout,
			buttons : [
				new Button({
					text:"OK",
					press: () => oDialog.destroy()
				})
			]
		});
		oDialog.open();

	}

	var delta = 10;

	function createNestedControlTree() {
		var oButton = new Button({
			text: "Inner Button", tooltip : "Just a sample for a SAPUI5 Control",
			press: function() {
				delta = delta <= 2 ? 2 : delta - 1;
			}});
		oButton.placeAt(jQuery(".x").get(0));
	}

	var d;

	function animate() {
		var html5 = jQuery("#embedded");
		html5.css("-webkit-perspective", 500);
		d = 0.0;
		setTimeout(step, 50);
	}

	function step() {
		var html5 = jQuery("#embedded > div");
		html5.css("-webkit-transform", "rotateY(" + d + "deg)");
		d = d + delta;
		if ( d >= 360 ) {
			d = 0;
		}
		setTimeout(step, 50);
	}

	new HTML("myhtml", {content : ""}).placeAt("empty-content");
	new Button({text:"Set Content As String (red)", press: function() {
		Element.getElementById("myhtml").setContent("<div style='background-color:red;width:16px;height:16px;'></div>");
	}}).placeAt("empty-content");
	new Button({text:"Set Content as DOM (green)", press: function() {
		Element.getElementById("myhtml").setDOMContent(jQuery("<div style='background-color:green;width:16px;height:16px;'></div>").get(0));
	}}).placeAt("empty-content");
});