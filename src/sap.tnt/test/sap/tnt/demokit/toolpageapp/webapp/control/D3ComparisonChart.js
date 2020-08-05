sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./D3Chart",
	"sap/ui/thirdparty/d3",
	"sap/ui/core/theming/Parameters"
], function($, D3Chart, d3, Parameters) {
	"use strict";

	return D3Chart.extend("sap.ui.demo.toolpageapp.control.D3ComparisonChart", {

		init: function () {
			D3Chart.prototype.init.call(this);
			this.setType("Radial");
		},

		_updateSVG: function (iWidth) {
			var aData = this.getBinding("data").getCurrentContexts().map(function (oContext) {
				return oContext.getObject();
			});

			var iHighestValue = aData[Object.keys(aData).sort(function(a, b){return aData[a].v - aData[b].v;}).pop()].v;
			var iLowestValue = Math.abs(aData[Object.keys(aData).sort(function(a, b){return aData[b].v - aData[a].v;}).pop()].v);

			var iNumDataPoints = aData.length,
				iNumSpaces = iNumDataPoints - 1,
				iSpaceRelativeDoDataPoint = 0.25,
				iBarWidth = this._iHeight / (iNumDataPoints + iNumSpaces * iSpaceRelativeDoDataPoint),
				iSpaceWidth = iBarWidth * iSpaceRelativeDoDataPoint;

			var selContainer = d3.select("#" + this._sContainerId);
			var selRects = selContainer.selectAll("rect").data(aData);

			selRects.enter().append("rect");
			selContainer.select("rect:nth-child(1)").style("fill", Parameters.get("sapUiChart1"));
			selContainer.select("rect:nth-child(2)").style("fill", Parameters.get("sapUiChart2"));
			selContainer.select("rect:nth-child(3)").style("fill", Parameters.get("sapUiChart3"));
			selContainer.select("rect:nth-child(4)").style("fill", Parameters.get("sapUiChart4"));
			selContainer.select("rect:nth-child(5)").style("fill", Parameters.get("sapUiChart5"));

			selContainer.selectAll("text").each(function (d) {
				var bVisible = Math.abs(d.v) > 50 && $(this).parent().width() > 150;
				$(this).css("display", bVisible ? "block" : "none");
			});

			selRects
				.attr("height", iBarWidth)
				.attr("width", function (d) {
					return Math.abs(d.v) * iWidth / (iLowestValue + iHighestValue);
				})
				.attr("y", function (d, i) {
					return i * (iSpaceWidth + iBarWidth);
				})

				.attr("x", function (d, i) {
					var iNegativeModifier = (d.v < 0 ? d.v : 0);
					return (iNegativeModifier + iLowestValue) * iWidth / (iLowestValue + iHighestValue);
				});

			var selTexts = selContainer.selectAll("text")
				.data(aData);

			selTexts.enter()
				.append("text").text(function (d) {
				return d.v;
			}).attr("font-size", "0.875rem")
				.attr("fill", Parameters.get("sapUiTextInverted"));

			selTexts.attr("y", function (d, i) {
				return i * (iSpaceWidth + iBarWidth) + iBarWidth * 0.5 + 5;
			}).attr("x", function (d, i) {
				var iNegativeModifier = 0;
				var iTextWidth = $(this).width();
				var iSpace = 5;
				if (d.v < 0) {
					iNegativeModifier = iTextWidth * -1.5;
					iSpace *= -1;
				}
				return iLowestValue * iWidth / (iLowestValue + iHighestValue) + iSpace + iNegativeModifier;
			});
		},

		renderer: function () {
			D3Chart.prototype.getRenderer().render.apply(this, arguments);
		}
	});
});