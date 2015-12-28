/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject'],
	function (jQuery, ManagedObject) {
		'use strict';
		var TimelineOverview = ManagedObject.extend("sap.ui.core.support.controls.TimelineOverview", {});

		TimelineOverview.prototype.setInteractions = function (interactions) {

			this.interactions = (JSON.parse(JSON.stringify(interactions)));

			if (!interactions || !interactions.length) {
				return;
			}

			this.actualStartTime = interactions[0].start;
			this.actualEndTime = interactions[interactions.length - 1].end;

			this.timeRange = this.actualEndTime - this.actualStartTime;
			this.maxDuration = 0;
			var that = this;
			this.interactions.forEach(function(interaction){
				interaction.start = parseFloat((interaction.start - that.actualStartTime).toFixed(2));
				interaction.end = parseFloat((interaction.end - that.actualStartTime).toFixed(2));
				interaction.calculatedDuration = interaction.end - interaction.start;
				if (interaction.calculatedDuration > that.maxDuration) {
					that.maxDuration = interaction.calculatedDuration;
				}
			});

			//this.allDurationSum = interactions.map(function (item) {
			//	return item.duration;
			//}).reduce(function (sum, b) {
			//	return sum + b;
			//});
		};

		TimelineOverview.prototype.render = function (rm) {
			rm.write('<div id="sapUiInteractionTimelineOverview"><ol id="' + this.getId() + '"');

			rm.addClass("InteractionTimeline");

			rm.writeClasses();

			rm.write(">");


			var interaction,
				interactions = this.interactions;

			if (!interactions || !interactions.length) {
				return;
			}

			//get the data to be rendered
			var stepsData = this._getTimelineOverviewData(interactions);

			//render the data ==========================================================================================

			for (var i = 0; i < stepsData.length; i++) {
				interaction = stepsData[i];

				this.renderInteractionStep(rm, interaction);
			}

			rm.write("</ol></div>");
		};

		TimelineOverview.prototype.renderInteractionStep = function (rm, interaction) {
			var stepDurationInPercent = Math.ceil((interaction.duration._total / this.maxDuration) * 100);

			var stepDurationInPercentInlineStyle = 'height: ' + stepDurationInPercent + '%;';
			if (stepDurationInPercent > 0) {
				stepDurationInPercentInlineStyle += ' min-height: 1px;';
			}

			rm.write('<li>');
			rm.write('<div class="bars-wrapper" title="Duration: ' + interaction.duration._total + 'ms">');
			rm.write('<div class="duration" style="' + stepDurationInPercentInlineStyle + '">');
			// write step duration
			rm.write('<div class="requestType" style="height: 100%;"></div>');
			rm.write('</div>');
			rm.write('</div>');
			rm.write('<div class="sapUiInteractionTimelineStepRight"></div>');
			rm.write('</li>');
		};
		TimelineOverview.prototype._getTimelineOverviewData = function(copiedData) {
			var stepCount = 50;
			var stepTime = this.timeRange / stepCount;
			var stepsData = [];

			for (var i = 0; i < stepCount; i++) {
				var stepStart = stepTime * i;
				var stepEnd = stepStart + stepTime;
				var selectedStepsByTime = this._filterByTime({start: stepStart, end: stepEnd}, copiedData);

				/* eslint-disable no-loop-func */
				var stepSumDuration = selectedStepsByTime.map(function (item) {
					return {
						duration: item.calculatedDuration
					};
				});

				var _resultsDuration = {_total: 0};
				stepSumDuration.map(function (itemData) {
					_resultsDuration._total = itemData.duration;
				});



				/* eslint-enable no-loop-func */
				// ====================================================================================================

				stepsData.push({
					duration: _resultsDuration
				});
			}

			return stepsData;
		};

		TimelineOverview.prototype._filterByTime = function (options, filteredData) {
			return filteredData.filter(function (item) {
				//filter bars in time start/end
				return !(item.end <= options.start || item.start >= options.end);
			}).map(function (item) {


				var leftDurationOffset = Math.max(options.start - item.start, 0);
				var rightDurationOffset = Math.max((item.start + item.duration) - options.end, 0);
				item.duration = item.duration - leftDurationOffset - rightDurationOffset;

				//cut the start and end of bars
				item.start = Math.max(item.start, options.start);
				item.end = Math.min(item.end, options.end);
				return item;
			});
		};

		return TimelineOverview;
	});
