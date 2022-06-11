sap.ui.getCore().attachInit(function () {
	"use strict";

	var oApp = new sap.m.App("myApp", {initialPage: "oPage1"});

	var oBigContent = new sap.ui.core.HTML({content: "<div id='cont1'><input type='text'>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br><input type='text'>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br></div>"});
	var oScrollContainer1 = new sap.m.ScrollContainer("oScrollContainer1", {
		horizontal: true,
		vertical: true,
		content: [oBigContent],
		height: "400px",
		width: "200px"
	});

	var oBigContent2 = new sap.ui.core.HTML({
		content: "<div id='cont1'><input type='text'><strong id='atTheBeginningOfALongLine'>atTheBeginningOfALongLine</strong>" +
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

	var oBigContent2he = new sap.ui.core.HTML({
		content: "<div id='cont1'>למ<input type='text'><strong id='atTheBeginningOfALongLine'>atTheBeginningOfALongLine</strong>" +
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

	var sContent = "";
	var sContentStyle = "";

	for (var i = 1; i <= 1200; i++) {
		sContentStyle = (i % 2) ? "contentStyling" : "contentStyling contentStylingOdd";
		sContent += "<div class=\"" + sContentStyle + "\" id=\"div-" + i + "\">" + i + "</div>";

		if (i % 20 == 0) {
			sContent += "<br>";
		}
	}

	var oScrollContainer3 = new sap.m.ScrollContainer({
		horizontal: true,
		vertical: true,
		content: [],
		height: "300px",
		width: "100%"
	});

	var oScrollContainer4 = new sap.m.ScrollContainer("oScrollContainer4", {
		horizontal: true,
		vertical: true,
		content: [],
		width: "400px",
		height: "300px"
	});

	var oHtmlContent = new sap.ui.core.HTML({
		content: sContent
	});

	oScrollContainer4.addContent(oHtmlContent);

	if (sap.ui.getCore().getConfiguration().getRTL()) {
		oScrollContainer3.addContent(oBigContent2he);
	} else {
		oScrollContainer3.addContent(oBigContent2);
	}

	var oHorizontalLayout = new sap.ui.layout.HorizontalLayout('oHorizontalLayout', {
		content: [
			oScrollContainer3,
			new sap.ui.layout.VerticalLayout({
				content: [
					new sap.m.Button({
						text: "Scroll to <span> element at very long line's end at top of scrolling area",
						press: function () {
							var oSpan = document.getElementById("atTheEndOfALongLine");
							oScrollContainer3.scrollToElement(oSpan);
							oSpan.style.color = "red";
						}
					}),
					new sap.m.Button({
						text: "Scroll to <span> element at very long line's beginning at top of scrolling area",
						press: function () {
							var oSpan = document.getElementById("atTheBeginningOfALongLine");
							oScrollContainer3.scrollToElement(oSpan);
							oSpan.style.color = "magenta";
						}
					}),
					new sap.m.Button({
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

	var oHorizontalLayout2 = new sap.ui.layout.HorizontalLayout({
		content: [
			oScrollContainer4,
			new sap.ui.layout.VerticalLayout({
				content: [
					new sap.m.Input("input", {
						width: "200px"
					}),
					new sap.m.Button({
						text: "Scroll to div number",
						press: function () {
							var sValue = sap.ui.getCore().byId("input").getValue();
							var oElement = document.getElementById("div-" + sValue);
							sap.ui.getCore().byId("oScrollContainer4").scrollToElement(oElement);
							oElement.style.backgroundColor = "white";
							oElement.style.border = "skyblue";
						}
					})
				]
			})
		]
	});

	var oPage1 = new sap.m.Page("oPage1", {
		title: "ScrollContainer Test",
		enableScrolling: true,
		content: [
			new sap.m.Button({
				text: "nop"
			}),
			oScrollContainer1,
			new sap.m.ScrollContainer("oScrollContainer2", {
				content: [
					new sap.m.Image({
						src: "images/SAPLogo.jpg", width: "150px"
					}),
					new sap.m.Image({
						src: "images/SAPUI5.png",
						width: "100px",
						height: "100px",
						densityAware: false
					}),
					new sap.m.Image({
						src: "images/SAPLogo.jpg", width: "150px"
					}),
					new sap.m.Image({
						src: "images/SAPUI5.png",
						width: "100px",
						height: "100px",
						densityAware: false
					}),
					new sap.m.Image({
						src: "images/SAPLogo.jpg", width: "150px"
					}),
					new sap.m.Image({
						src: "images/SAPUI5.png",
						width: "100px",
						height: "100px",
						densityAware: false
					}),
					new sap.m.Image({
						src: "images/SAPLogo.jpg", width: "150px"
					}),
					new sap.m.Image({
						src: "images/SAPUI5.png",
						width: "100px",
						height: "100px",
						densityAware: false
					})
				],
				height: "120px"
			}),
			new sap.m.Label({
				text: "X:"
			}),
			new sap.m.Input("xIn", {
				value: 50
			}),
			new sap.m.Label({
				text: "Time:"
			}),
			new sap.m.Input("tIn", {
				value: 500
			}),
			new sap.m.Button({
				text: "Scroll", press: function () {
					var oCore = sap.ui.getCore();
					var x = parseInt(oCore.byId("xIn").getValue());
					var t = parseInt(oCore.byId("tIn").getValue());
					oCore.byId("oScrollContainer2").scrollTo(x, 0, t);
				}
			}),
			new sap.m.Button({
				text: "Rerender Page", press: function () {
					oPage1.rerender();
				}
			}),
			oHorizontalLayout,
			oHorizontalLayout2
		]
	});

	sap.ui.getCore().byId("oScrollContainer2").attachEvent("scrollEnd", function (evt) {
		var x = evt.getParameter("x");
		var oPage1 = sap.ui.getCore().byId("oPage1");
		var oHtml = new sap.ui.core.HTML({content: "<div>" + new Date().getTime() + ": Rerender on scrollEnd at x=" + x + "</div>"});
		setTimeout(function () {
			oPage1.addContent(oHtml);
		}, 0);
	});

	oApp.addPage(oPage1);

	oApp.placeAt("body");
});