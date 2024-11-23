sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./D3Chart",
	"sap/ui/thirdparty/d3"
], function($, D3Chart, d3) {
	"use strict";

	return D3Chart.extend("sap.ui.demo.toolpageapp.control.D3ColumnChart", {

		init: function () {
			D3Chart.prototype.init.call(this);
			this.setType("Column");
		},

		_updateSVG: function (iWidth) {
			var aData = this.getBinding("data").getCurrentContexts().map(function (oContext) {
				return oContext.getObject();
			});

			var selContainer = d3.select("#" + this._sContainerId);
			var selRects = selContainer.selectAll("rect").data(aData);

			// sort the data by "v" parameter and extract the highest value
			var iHightestValue = aData[Object.keys(aData).sort(function(a, b){return aData[a].v - aData[b].v;}).pop()].v;

			selRects.enter().append("rect");
			selContainer.select("rect:nth-child(1)").style("fill", "var(--sapChart_OrderedColor_1)");
			selContainer.select("rect:nth-child(2)").style("fill", "var(--sapChart_OrderedColor_2)");
			selContainer.select("rect:nth-child(3)").style("fill", "var(--sapChart_OrderedColor_3)");
			selContainer.select("rect:nth-child(4)").style("fill", "var(--sapChart_OrderedColor_4)");
			selContainer.select("rect:nth-child(5)").style("fill", "var(--sapChart_OrderedColor_5)");

			selContainer.selectAll("text").each(function (d) {
				var bVisible = d.v > 50 && $(this).parent().width() > 150;
				$(this).css("display", bVisible ? "block" : "none");
			});

			var iNumDataPoints = aData.length;
			var iNumSpaces = iNumDataPoints - 1;
			var iSpaceRelativeDoDataPoint = 0.25;
			var iBarWidth = iWidth / (iNumDataPoints + iNumSpaces * iSpaceRelativeDoDataPoint);
			var iSpaceWidth = iBarWidth * iSpaceRelativeDoDataPoint;
			selRects
				.attr("width", iBarWidth)
				.attr("height", function (d) {
					return d.v / iHightestValue * this._iHeight;
				}.bind(this))
				.attr("x", function (d, i) {
					return i * (iSpaceWidth + iBarWidth);
				})
				.attr("y", function (d, i) {
					return this._iHeight - d.v / iHightestValue * this._iHeight;
				}.bind(this));

			var selTexts = selContainer.selectAll("text")
				.data(aData);

			selTexts.enter()
				.append("text").text(function (d) {
					return d.v;
				}).attr("font-size", "0.875rem")
				.attr("fill", "var(--sapChart_Sequence_1_TextColor)");

			selTexts.attr("x", function (d, i) {
				var fTextWidth = this.getBoundingClientRect().width;

				return i * (iSpaceWidth + iBarWidth) + (iBarWidth - fTextWidth) / 2;
			}).attr("y", function () {
				return this._iHeight - 5;
			}.bind(this));
		},

		renderer: function () {
			D3Chart.prototype.getRenderer().render.apply(this, arguments);
		}
	});
});