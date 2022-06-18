sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/ScrollContainer",
	"sap/ui/core/Core",
	"sap/ui/core/HTML",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout"
], function(App, Button, Image, Input, Label, Page, ScrollContainer, oCore, HTML, HorizontalLayout, VerticalLayout) {
	"use strict";

	var oApp = new App("myApp", {initialPage: "oPage1"});

	var oBigContent = new HTML({content: "<div><input type='text'>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br><input type='text'>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br></div>"});
	var oScrollContainer1 = new ScrollContainer("oScrollContainer1", {
		horizontal: true,
		vertical: true,
		content: [oBigContent],
		height: "400px",
		width: "200px"
	});

	var oBigContent2;
	if (oCore.getConfiguration().getRTL()) {
		oBigContent2 = new HTML({
			content: "<div>למ<input type='text'><strong id='atTheBeginningOfALongLine'>atTheBeginningOfALongLine</strong>" +
				"למחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקה" +
				"למחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקה" +
				"למחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקה" +
				"למחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקה" +
				"למחיקהלמחיקהלמחיקהלמחיקה<strong id='atTheEndOfALongLine'>atTheEndOfALongLine</strong>" +
				"<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br><input type='text'>" +
				"למחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקה<br>123<br>456<br>" +
				"789<br>1<br>2<br>3<br>4<br>למחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקה" +
				"<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>למחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקה" +
				"למחיקהלמחיקהלמחיקהלמחיקה<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>למחיקהלמחיקהלמחיקהלמחיקהלמחיקה" +
				"למחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקה<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>1<br>" +
				"2<br>3<br>4<br>למחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקה<br>123<br>456<br>" +
				"789<br>1<br>2<br>3<br>4<br>למחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקה" +
				"<strong id='inputDown'>inputDown</strong>למחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקהלמחיקה" +
				"</div>"
		});
	} else {
		oBigContent2 = new HTML({
			content: "<div><input type='text'><strong id='atTheBeginningOfALongLine'>atTheBeginningOfALongLine</strong>" +
				"abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmno" +
				"pqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefg" +
				"hijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz" +
				"abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstu" +
				"vwxyzabcdefghijklmnopqrstuvwxyz<strong id='atTheEndOfALongLine'>atTheEndOfALongLine</strong>" +
				"<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br><input type='text'>" +
				"abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>" +
				"789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz" +
				"<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijk" +
				"lmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyz" +
				"abcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>1<br>" +
				"2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>" +
				"789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmno" +
				"<input type='text' value='input down' id='inputDown'>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmno" +
				"</div>"
		});
	}

	var sContent = "<div>";
	var sContentStyle = "";

	for (var i = 1; i <= 1200; i++) {
		sContentStyle = (i % 2) ? "contentStyling" : "contentStyling contentStylingOdd";
		sContent += "<div class=\"" + sContentStyle + "\" id=\"div-" + i + "\">" + i + "</div>";

		if (i % 20 == 0) {
			sContent += "<br>";
		}
	}
	sContent += "</div>";

	var oScrollContainer3 = new ScrollContainer({
		horizontal: true,
		vertical: true,
		content: [],
		height: "300px",
		width: "100%"
	});

	var oScrollContainer4 = new ScrollContainer("oScrollContainer4", {
		horizontal: true,
		vertical: true,
		content: [],
		width: "400px",
		height: "300px"
	});

	var oHtmlContent = new HTML({
		content: sContent
	});

	oScrollContainer4.addContent(oHtmlContent);

	oScrollContainer3.addContent(oBigContent2);

	var oHorizontalLayout = new HorizontalLayout('oHorizontalLayout', {
		content: [
			oScrollContainer3,
			new VerticalLayout({
				content: [
					new Button({
						text: "Scroll to <span> element at very long line's end at top of scrolling area",
						press: function () {
							var oSpan = document.getElementById("atTheEndOfALongLine");
							oScrollContainer3.scrollToElement(oSpan);
							oSpan.style.color = "red";
						}
					}),
					new Button({
						text: "Scroll to <span> element at very long line's beginning at top of scrolling area",
						press: function () {
							var oSpan = document.getElementById("atTheBeginningOfALongLine");
							oScrollContainer3.scrollToElement(oSpan);
							oSpan.style.color = "magenta";
						}
					}),
					new Button({
						text: "Scroll to <input> element at beginning of a line at bottom of scrolling area",
						press: function () {
							var scrollToInput = document.getElementById("inputDown");
							oScrollContainer3.scrollToElement(scrollToInput);
							scrollToInput.style.color = "red";
						}
					})
				]
			})
		]
	});

	var oHorizontalLayout2 = new HorizontalLayout({
		content: [
			oScrollContainer4,
			new VerticalLayout({
				content: [
					new Input("input", {
						width: "200px"
					}),
					new Button({
						text: "Scroll to div number",
						press: function () {
							var sValue = oCore.byId("input").getValue();
							var oElement = document.getElementById("div-" + sValue);
							oCore.byId("oScrollContainer4").scrollToElement(oElement);
							oElement.style.backgroundColor = "white";
							oElement.style.border = "skyblue";
						}
					})
				]
			})
		]
	});

	var oPage1 = new Page("oPage1", {
		title: "ScrollContainer Test",
		enableScrolling: true,
		content: [
			new Button({
				text: "nop"
			}),
			oScrollContainer1,
			new ScrollContainer("oScrollContainer2", {
				content: [
					new Image({
						src: "images/SAPLogo.jpg", width: "150px"
					}),
					new Image({
						src: "images/SAPUI5.png",
						width: "100px",
						height: "100px",
						densityAware: false
					}),
					new Image({
						src: "images/SAPLogo.jpg", width: "150px"
					}),
					new Image({
						src: "images/SAPUI5.png",
						width: "100px",
						height: "100px",
						densityAware: false
					}),
					new Image({
						src: "images/SAPLogo.jpg", width: "150px"
					}),
					new Image({
						src: "images/SAPUI5.png",
						width: "100px",
						height: "100px",
						densityAware: false
					}),
					new Image({
						src: "images/SAPLogo.jpg", width: "150px"
					}),
					new Image({
						src: "images/SAPUI5.png",
						width: "100px",
						height: "100px",
						densityAware: false
					})
				],
				height: "120px"
			}),
			new Label({
				text: "X:"
			}),
			new Input("xIn", {
				value: 50
			}),
			new Label({
				text: "Time:"
			}),
			new Input("tIn", {
				value: 500
			}),
			new Button({
				text: "Scroll", press: function () {
					var oCore = sap.ui.getCore();
					var x = parseInt(oCore.byId("xIn").getValue());
					var t = parseInt(oCore.byId("tIn").getValue());
					oCore.byId("oScrollContainer2").scrollTo(x, 0, t);
				}
			}),
			new Button({
				text: "Rerender Page", press: function () {
					oPage1.rerender();
				}
			}),
			oHorizontalLayout,
			oHorizontalLayout2
		]
	});

	oCore.byId("oScrollContainer2").attachEvent("scrollEnd", function (evt) {
		var x = evt.getParameter("x");
		var oPage1 = oCore.byId("oPage1");
		var oHtml = new HTML({content: "<div>" + new Date().getTime() + ": Rerender on scrollEnd at x=" + x + "</div>"});
		setTimeout(function () {
			oPage1.addContent(oHtml);
		}, 0);
	});

	oApp.addPage(oPage1);

	oApp.placeAt("body");
});
