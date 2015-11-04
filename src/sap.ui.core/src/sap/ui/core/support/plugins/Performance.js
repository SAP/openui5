/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.plugins.Performance
sap.ui.define(['jquery.sap.global', 'sap/ui/core/support/Plugin'],
	function (jQuery, Plugin) {
		"use strict";

		var _rawdata = [];
		var _widthSingleUnit = 0; // how many px is 1 ms
		var _allTime = 0; //the time recorder in the rawdata
		var _SIDE_LIST_WIDTH = 250; // the width of the right side in the layout
		var _isRecordingActive = false;
		var _that;

		var _sliderVars = {
			selectedInterval: {
				start: 0,
				end: 0
			},
			nodes: {
				slider: null,
				handle: null,
				leftResizeHandle: null,
				rightResizeHandle: null
			},
			consts: {
				LEFT_HANDLE_ID: 'left',
				RIGHT_HANDLE_ID: 'right'
			},
			sizes: {
				width: 0,
				handleWidth: 0,
				handleMinWidth: 10
			},
			drag: {
				handleClickOffsetX: 0,
				handleOffsetLeft: 0,
				isResize: false,
				whichResizeHandle: ''
			}
		};

		/**
		 * Creates an instance of sap.ui.core.support.plugins.Performance.
		 * @class This class represents the plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
		 *
		 * With this plugIn the performance measurements are displayed
		 *
		 * @abstract
		 * @extends sap.ui.base.Object
		 * @version ${version}
		 * @constructor
		 * @private
		 * @alias sap.ui.core.support.plugins.Performance
		 */
		var Performance = Plugin.extend("sap.ui.core.support.plugins.Performance", {
			constructor: function (oSupportStub) {
				Plugin.apply(this, ["sapUiSupportPerf", "Performance", oSupportStub]);

				_that = this;

				this._oStub = oSupportStub;

				if (this.isToolPlugin()) {
					this._aEventIds = [
						this.getId() + "SetMeasurements",
						this.getId() + "SetActive"
					];
				} else {
					this._aEventIds = [
						this.getId() + "Refresh",
						this.getId() + "Clear",
						this.getId() + "Start",
						this.getId() + "End",
						this.getId() + "Activate"
					];
				}
			}
		});

		Performance.prototype.init = function (oSupportStub) {
			Plugin.prototype.init.apply(this, arguments);
			if (this.isToolPlugin()) {
				initInTools.call(this, oSupportStub);
			} else {
				initInApps.call(this, oSupportStub);
			}
		};

		Performance.prototype.exit = function (oSupportStub) {
			Plugin.prototype.exit.apply(this, arguments);
		};

		function initInTools(oSupportStub) {
			var rm = sap.ui.getCore().createRenderManager();

			//create the initial html for the performance tool
			rm.write(_getPerformanceToolHTML());
			rm.flush(this.$().get(0));
			rm.destroy();

			//create all event listeners
			_registerEventListeners();

			//initialize the slider
			_initSlider();
		}


		function initInApps(oSupportStub) {
			getPerformanceData.call(this);
		}

		function getPerformanceData(oSupportStub) {
			//var bActive = jQuery.sap.measure.getActive();
			var aMeasurements = jQuery.sap.measure.getAllMeasurements(true);

			this._oStub.sendEvent(this.getId() + "SetMeasurements", {"measurements": aMeasurements});
		}


		/**
		 * Handler for sapUiSupportPerfSetMeasurements event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfSetMeasurements = function (oEvent) {
			var aMeasurements = oEvent.getParameter("measurements");

			this.setData(aMeasurements);
		};

		/**
		 * Handler for sapUiSupportPerfRefresh event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfRefresh = function (oEvent) {
			getPerformanceData.call(this);
		};

		/**
		 * Handler for sapUiSupportPerfClear event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfClear = function (oEvent) {
			jQuery.sap.measure.clear();
			this._oStub.sendEvent(this.getId() + "SetMeasurements", {"measurements": []});
		};

		/**
		 * Handler for sapUiSupportPerfStart event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfStart = function (oEvent) {
			jQuery.sap.measure.start(this.getId() + "-perf", "Measurement by support tool");
		};

		/**
		 * Handler for sapUiSupportPerfEnd event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfEnd = function (oEvent) {
			jQuery.sap.measure.end(this.getId() + "-perf");
			getPerformanceData.call(this);
		};

		/**
		 * Handler for sapUiSupportPerfActivate event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Performance.prototype.onsapUiSupportPerfActivate = function (oEvent) {
			jQuery.sap.measure.setActive(true);
		};

		/* =============================================================================================================
		 * Set Data
		 ============================================================================================================= */

		Performance.prototype.setData = function (_data) {

			var sapUiSupportNoDataOverlay = document.querySelector('#sapUiSupportNoDataOverlay');
			var domSlider = document.querySelector('#slider');
			var domTimelineOverview = document.querySelector('#sapUiSupportPerfHeaderTimelineOverview .timeline');

			if (!_data || _data.length === 0) {
				//show "nodata overlay" if there is data
				sapUiSupportNoDataOverlay.style.display = 'block';
				domSlider.classList.add('sapUiSupportHidden');
				domTimelineOverview.innerHTML = '';
				return;
			} else {
				domSlider.classList.remove('sapUiSupportHidden');
			}

			//hide "nodata overlay" if there is data
			sapUiSupportNoDataOverlay.style.display = '';

			_rawdata = (JSON.parse(JSON.stringify(_data)));

			_rawdata = _rawdata.sort(function (a, b) {
				return a.start - b.start;
			});

			var initialTime = _data[0].start;

			_rawdata = _rawdata.map(function (item) {
				item.start = parseFloat((item.start - initialTime).toFixed(2));
				item.end = parseFloat((item.end - initialTime).toFixed(2));

				return item;
			});

			_allTime = _rawdata[_rawdata.length - 1].end - _rawdata[0].start;

			_sliderVars.selectedInterval.start = _rawdata[0].start;
			_sliderVars.selectedInterval.end = _rawdata[_rawdata.length - 1].end;

			_renderTimelineOverview(_rawdata);
			_render(_rawdata);
			_renderFilters();
		};

		/* =============================================================================================================
		 * Play/Stop Recording
		 ============================================================================================================= */

		var timeRecordingStep = 10; //ms
		var timeRecording = 0; //in 10 ms
		var timerTimeout;

		function _handlerTogglePlayButton(oEvent) {
			clearInterval(timerTimeout);

			if (_isRecordingActive) {
				_isRecordingActive = false;
				_that._oStub.sendEvent(_that.getId() + "End");
				oEvent.target.setAttribute('data-state', 'Start recording (' + (timeRecording / 1000).toFixed(2) + ' s)');
			} else {
				//reset the timeout
				timeRecording = 0;

				_isRecordingActive = true;

				_that._oStub.sendEvent(_that.getId() + "Activate");
				_that._oStub.sendEvent(_that.getId() + "Clear");
				_that._oStub.sendEvent(_that.getId() + "Start");
				oEvent.target.setAttribute('data-state', 'Stop recording (' + (timeRecording / 1000).toFixed(2) + ' s)');

				timerTimeout = setInterval(function () {
					timeRecording += timeRecordingStep;
					oEvent.target.setAttribute('data-state', 'Stop recording (' + (timeRecording / 1000).toFixed(2) + ' s)');
				}, timeRecordingStep);
			}
		}

		/* =============================================================================================================
		 * Performance HTML Structure
		 ============================================================================================================= */

		function _getPerformanceToolHTML() {
			return '' +
				'<section id="sapUiSupportPerf">' +
				'<section id="sapUiSupportNoDataOverlay"></section>' +
				'<section id="sapUiSupportPerfHeader">' +
				'<section class="sapUiSupportPerfHeaderFilters">' +
				'<div>' +
				'Order: ' +
				'<select id="sapUiSupportPerfHeaderFilterSort" name="orderBy">' +
				'<option value="chronologically">Chronologically</option>' +
				'<option value="time">By Time</option>' +
				'<option value="duration">By Duration</option>' +
				'</select>' +
				'</div>' +
				'<div>' +
				'<label>' +
				'Min. Duration: ' +
				'<input id="sapUiSupportPerfHeaderFilterMinDuration" type="number" min="0" value="0" /> ms.' +
				'</label>' +
				'</div>' +
				'<div class="flex-spacer"></div>' +
				'<div id="categories"></div>' +
				'</section>' +
				'<section id="sapUiSupportPerfHeaderTimelineOverview">' +
				'<div class="timeline"></div>' +
				'<button id="sapUiSupportPerfToggleRecordingBtn"></button>' +
				'<div id="slider">' +
				'<div id="slideHandle">' +
				'<span id="leftHandle"></span>' +
				'<span id="rightHandle"></span>' +
				'</div>' +
				'</div>' +
				'</section>' +
				'</section>' +
				'<section id="sapUiSupportPerfHeaderTimeline">' +
				'<div id="sapUiSupportPerfHeaderTimelineBarInfoWrapper"></div>' +
				'<div id="sapUiSupportPerfHeaderTimelineBarWrapper"></div>' +
				'</section>' +
				'</section>';
		}

		/* =============================================================================================================
		 * General
		 ============================================================================================================= */

		function _getUID() {
			return 'uID-' + (_getUID.id !== undefined ? _getUID.id++ : _getUID.id = 0);
		}

		function _registerEventListeners() {
			document.querySelector('#sapUiSupportPerfHeaderFilterSort').addEventListener('change', _render, false);
			document.querySelector('#sapUiSupportPerfHeaderFilterMinDuration').addEventListener('change', _render, false);

			document.querySelector('#categories').addEventListener('change', _render, false);

			document.querySelector('#sapUiSupportPerfHeaderTimelineBarWrapper').addEventListener('mouseover', _lineHover, false);
			document.querySelector('#sapUiSupportPerfHeaderTimelineBarInfoWrapper').addEventListener('mouseover', _lineHover, false);

			//TODO: optimise this render
			window.addEventListener('resize', function () {
				_render();
				_reSetSliderSize();
			}, false);

			jQuery("#sapUiSupportPerfToggleRecordingBtn").click(_handlerTogglePlayButton).attr('data-state', 'Start recording');
		}

		/* =============================================================================================================
		 * Timeline overview
		 ============================================================================================================= */

		function _getTimelineOverViewBarTitle(duration, time) {
			return 'Duration: ' + duration.toFixed(2) + ' ms.\nTime: ' + time.toFixed(2) + ' ms.';
		}

		function _renderTimelineOverview(data) {
			var domParent = document.querySelector('#sapUiSupportPerfHeaderTimelineOverview .timeline');

			var HTML = '<ol>';
			var stepCount = 100;
			var stepTime = _allTime / stepCount;

			var copiedData = (JSON.parse(JSON.stringify(data)));

			//TODO: optimise this logic to loop only once
			var allDurationSum = copiedData.map(function (item) {
				return item.duration;
			}).reduce(function (sum, b) {
				return sum + b;
			});

			var allTimeSum = copiedData.map(function (item) {
				return item.time;
			}).reduce(function (sum, b) {
				return sum + b;
			});

			for (var i = 0; i < stepCount; i++) {
				var stepStart = stepTime * i;
				var stepEnd = stepStart + stepTime;

				var stepSumDuration = _filterByTime({start: stepStart, end: stepEnd}, copiedData).map(function (item) {
					return item.duration;
				}).reduce(function (a, b) {
					return (a + b);
				}, 0);

				var stepSumTime = _filterByTime({start: stepStart, end: stepEnd}, copiedData).map(function (item) {
					return item.time;
				}).reduce(function (a, b) {
					return (a + b);
				}, 0);

				//use a magnifier to boost the visibility of the bars
				var MAGNIFIER = 5;

				var stepDurationInPercent = Math.ceil((stepSumDuration / allDurationSum) * MAGNIFIER * 100);
				var stepTimeInPercent = Math.ceil((stepSumTime / allTimeSum) * MAGNIFIER * 100);

				var stepDurationInPercentInlineStyle = 'height: ' + stepDurationInPercent + '%;';
				if (stepDurationInPercent > 0) {
					stepDurationInPercentInlineStyle += ' min-height: 1px;';
				}

				var stepTimeInPercentInlineStyle = 'height: ' + stepTimeInPercent + '%;';
				if (stepTimeInPercent > 0) {
					stepTimeInPercentInlineStyle += ' min-height: 1px;';
				}

				HTML += '<li>';
				HTML += '<div class="bars-wrapper" title="' + _getTimelineOverViewBarTitle(stepSumDuration, stepSumTime) + '">';
				HTML += '<div class="duration ' + _getOverviewBarColor(stepDurationInPercent) + '" style="' + stepDurationInPercentInlineStyle + '"></div>';
				HTML += '<div class="time ' + _getOverviewBarColor(stepTimeInPercent) + '" style="' + stepTimeInPercentInlineStyle + '"></div>';
				HTML += '</div></li>';
			}

			HTML += '</ol>';

			domParent.innerHTML = HTML;
		}

		/* =============================================================================================================
		 * Render and render helpers
		 ============================================================================================================= */

		function _render() {
			var HTML = '<ol>';
			var barInfoHTML = '<ol>';
			var uid = _getUID();

			var filterOptions = _getFilterOptions();
			var data = _applyFilters(_rawdata, filterOptions);

			//no data bar
			if (data.length === 0) {
				HTML += '<li class="line nodata" data-uid="' + uid + '"></li>';
				barInfoHTML += '<li class="line nodata" data-uid="' + uid + '"><div class="info line">No data</div></li>';
			}

			data.forEach(function (item) {
				var uid = _getUID();

				HTML += '<li data-uid="' + uid + '" class="line" title="' + _getBarTitle(item) + '"' + _getBarDataAttributes(item) + '  >';
				HTML += '<div class="bar ' + _getBarColor(item.duration) + '" style="width: ' + _calculateBarWidth(item.duration) + ' margin-left: ' + _calculateBarOffset(item, filterOptions.filterByTime.start) + '">';
				HTML += '<div class="sub-bar ' + _getBarColor(item.time) + '" style="width: ' + _calculateBarWidth(item.time) + '"></div>';
				HTML += '</div>';
				HTML += '</li>';

				//render bar info ==================================================================================
				barInfoHTML += '<li data-uid="' + uid + '" title="' + _getBarTitle(item) + '" class="line ' + _getBarClassType(item.categories[0]) + '" ' + _getBarDataAttributes(item) + '>';
				barInfoHTML += '<div class="info line">' + _formatInfo(item) + ' (' + (item.time).toFixed(0) + ' ms)</div>';
				barInfoHTML += '</li>';
			});

			HTML += '</ol>';
			barInfoHTML += '</ol>';

			document.querySelector('#sapUiSupportPerfHeaderTimelineBarWrapper').innerHTML = HTML;
			document.querySelector('#sapUiSupportPerfHeaderTimelineBarInfoWrapper').innerHTML = barInfoHTML;

			_createTimelineGrid(filterOptions);
			_filterByCategory(); // Don't change the order, this is applying css styles on the rendered content
		}


		function _calculateBarWidth(time) {
			var barWidthInPercent = (time * _widthSingleUnit);
			var width = Math.max(barWidthInPercent, 1);

			return width + 'px;';
		}

		function _calculateBarOffset(bar, startTime) {
			var offset = (bar.start - startTime) * _widthSingleUnit;

			return offset.toFixed(0) + 'px';
		}

		function _getBarTitle(bar) {
			return (bar.info + '\nduration: ' + bar.duration.toFixed(2) + ' ms. \ntime: ' + bar.time.toFixed(2) + ' ms. \nstart: ' + bar.start.toFixed(2) + ' ms.\nend: ' + bar.end.toFixed(2) + ' ms.');
		}

		function _formatInfo(bar) {
			var barInfo = bar.info;

			barInfo = barInfo.substring(barInfo.lastIndexOf('/') + 1, barInfo.length);
			barInfo = barInfo.substring(barInfo.lastIndexOf('sap.m.'), barInfo.length);
			barInfo = barInfo.replace('Rendering of ', '');

			return barInfo;
		}

		function _getBarClassType(category) {
			if (category.indexOf("require") !== -1) {
				return 'requireModuleType';
			} else if (category.indexOf("xmlhttprequest") !== -1) {
				return 'requestType';
			} else if (category.indexOf("javascript") !== -1) {
				return 'afterRenderingType';
			} else if (category.indexOf("rendering") !== -1) {
				return 'renderingType';
			}

			return 'unknownType';
		}

		function _getOverviewBarColor(percent) {
			var barColorClass = 'defaultTimeStyle';

			if (percent > 10) {
				barColorClass = 'oneTimeStyle';
			}

			if (percent > 20) {
				barColorClass = 'twoTimeStyle';
			}

			if (percent > 30) {
				barColorClass = 'threeTimeStyle';
			}

			if (percent > 40) {
				barColorClass = 'fourTimeStyle';
			}

			if (percent > 50) {
				barColorClass = 'fiveTimeStyle';
			}

			if (percent > 60) {
				barColorClass = 'sixTimeStyle';
			}

			return barColorClass;
		}

		function _getBarColor(time) {
			var barColorClass = '';

			if (time > 200) {
				barColorClass = 'oneTimeStyle';
			}

			if (time > 500) {
				barColorClass = 'twoTimeStyle';
			}

			if (time > 1000) {
				barColorClass = 'threeTimeStyle';
			}

			if (time > 2000) {
				barColorClass = 'fourTimeStyle';
			}

			if (time > 3000) {
				barColorClass = 'fiveTimeStyle';
			}

			if (time > 4000) {
				barColorClass = 'sixTimeStyle';
			}

			return barColorClass;
		}

		function _getBarCategories(data) {
			var categories = [];

			data.forEach(function (item) {
				if (categories.indexOf(item.categories[0]) === -1) {
					categories.push(item.categories[0]);
				}
			});

			return categories;
		}

		function _getBarDataAttributes(bar) {
			return 'data-item-category = ' + bar.categories[0];
		}

		function _lineHover(e) {
			var dom = e.srcElement;

			if (dom.nodeName === 'LI') {
				var uid = dom.getAttribute('data-uid');

				//clear the previously set hover classes
				var infoLIHovered = document.querySelector('#sapUiSupportPerfHeaderTimelineBarInfoWrapper li.hover');
				var barLIHovered = document.querySelector('#sapUiSupportPerfHeaderTimelineBarWrapper li.hover');

				if (infoLIHovered && barLIHovered) {
					infoLIHovered.classList.remove('hover');
					barLIHovered.classList.remove('hover');
				}

				var infoLI = document.querySelector('#sapUiSupportPerfHeaderTimelineBarInfoWrapper li[data-uid="' + uid + '"]');
				var barLI = document.querySelector('#sapUiSupportPerfHeaderTimelineBarWrapper li[data-uid="' + uid + '"]');

				if (infoLI && barLI) {
					infoLI.classList.add('hover');
					barLI.classList.add('hover');
				}
			}
		}

		/* =============================================================================================================
		 * Filters
		 ============================================================================================================= */

		function _applyFilters(rawdata, filterOptions) {
			var dataToWorkOn = (JSON.parse(JSON.stringify(rawdata)));
			var containerWidth = document.querySelector('#sapUiSupportPerfHeaderTimeline').offsetWidth - document.querySelector('#sapUiSupportPerfHeaderTimelineBarInfoWrapper').offsetWidth;
			var scrollWidth = 20;

			dataToWorkOn = _filterByTime(filterOptions.filterByTime, dataToWorkOn);
			dataToWorkOn = _sortBy(filterOptions.orderByValue, dataToWorkOn);

			dataToWorkOn = _filterMinValue(filterOptions.minValue, dataToWorkOn);

			if (dataToWorkOn.length) {
				var filteredTime = filterOptions.filterByTime.end - filterOptions.filterByTime.start;
			}

			_widthSingleUnit = ((containerWidth - scrollWidth) / filteredTime); //ms in px

			return dataToWorkOn;
		}

		function _getFilterOptions() {
			var options = {};
			var start = _sliderVars.selectedInterval.start;
			var end = _sliderVars.selectedInterval.end;
			var orderBySelect = document.querySelector('#sapUiSupportPerfHeaderFilterSort');
			options.orderByValue = orderBySelect.options[orderBySelect.selectedIndex].value;

			options.minValue = document.querySelector('#sapUiSupportPerfHeaderFilterMinDuration').valueAsNumber || 0;

			options.filterByTime = {
				start: start,
				end: end
			};

			return options;
		}

		function _filterByCategory() {
			var inputs = document.querySelectorAll('#categories input');

			function _setVisibilityToInlineCSSToBars(categoryName, isVisible) {
				var selectedBars = document.querySelectorAll('li[data-item-category="' + categoryName + '"]');

				for (var i = 0; i < selectedBars.length; i++) {
					selectedBars[i].style.display = isVisible ? '' : 'none';
				}
			}

			for (var i = 0; i < inputs.length; i++) {
				_setVisibilityToInlineCSSToBars(inputs[i].name, inputs[i].checked);
			}
		}

		function _sortBy(orderBy, orderedData) {
			if (orderBy === 'time' || orderBy === 'duration') {
				document.querySelector('body').classList.add('flattenBarOffset');
			} else {
				document.querySelector('body').classList.remove('flattenBarOffset');
			}

			//sorts
			if (orderBy === 'time') {
				orderedData = orderedData.sort(function (a, b) {
					if (a.time > b.time) {
						return -1;
					}
					if (a.time < b.time) {
						return 1;
					}

					return 0;
				});
			}

			if (orderBy === 'duration') {
				orderedData = orderedData.sort(function (a, b) {
					if (a.duration > b.duration) {
						return -1;
					}
					if (a.duration < b.duration) {
						return 1;
					}

					return 0;
				});
			}

			return orderedData;
		}

		function _filterMinValue(minValue, filteredData) {
			return filteredData.filter(function (item) {
				return (item.duration >= minValue);
			});
		}

		function _filterByTime(options, filteredData) {
			var data = filteredData.filter(function (item) {
				//filter bars in time start/end
				return !(item.end <= options.start || item.start >= options.end);
			}).map(function (item) {
				//cut the start and end of bars
				item.start = Math.max(item.start, options.start);
				item.end = Math.min(item.end, options.end);
				return item;
			});

			data.map(function (item) {
				//cut the time and duration of the bars so they will fit the time start/end in the given options
				if (item.time + item.start > options.end) {
					item.time = options.end - item.start;
				}

				if (item.duration + item.start > options.end) {
					item.duration = options.end - item.start;
				}

				return item;
			});

			return data;
		}

		function _renderFilters() {
			var categoriesHTML = '';
			var allCategories = _getBarCategories(_rawdata);
			allCategories.forEach(function (category) {
				categoriesHTML += '<label><input class="' + _getBarClassType(category) + '" checked type="checkbox" name="' + category + '" />' + category + '</label>';
			});

			var categoriesDom = document.querySelector('#categories');

			categoriesDom.innerHTML = categoriesHTML;
		}

		/* =============================================================================================================
		 * Timegrid
		 ============================================================================================================= */

		function _createTimelineGrid(filterOptions) {
			var gridParent = document.getElementById('sapUiSupportPerfHeaderTimelineBarWrapper');
			var gridLineNumbers = Math.round(gridParent.offsetWidth / 10);
			var filteredDuration = filterOptions.filterByTime.end - filterOptions.filterByTime.start;
			var gridLineStepInTime = parseInt(filteredDuration / gridLineNumbers, 10);

			if (document.getElementById('grid')) {
				document.getElementById('grid').parentNode.removeChild(document.getElementById('grid'));
			}

			var grid = document.createElement('div');
			grid.innerHTML = '<div class="header"></div><div class="body"></div>';
			grid.id = 'grid';

			for (var i = 1; i <= gridLineNumbers; i++) {
				var divForBorder = document.createElement('div');
				var divForText = document.createElement('div');

				if (i % 5 === 0 || i === 1) {
					var time = parseInt(filterOptions.filterByTime.start, 10);

					if (i !== 1) {
						time += i * gridLineStepInTime;
					}
					//to String
					time = time > 500 ? (time / 1000).toFixed(2) + ' s' : time + ' ms';

					divForText.setAttribute('data-time', time);
				}

				grid.querySelector('.body').appendChild(divForBorder);
				grid.querySelector('.header').appendChild(divForText);
			}

			document.querySelector('#sapUiSupportPerf').appendChild(grid);
		}

		/* =============================================================================================================
		 * Slider
		 ============================================================================================================= */

		function _initSlider() {
			_sliderVars.nodes.slider = document.querySelector('#slider');
			_sliderVars.nodes.handle = document.querySelector('#slideHandle');
			_sliderVars.nodes.leftResizeHandle = document.querySelector('#leftHandle');
			_sliderVars.nodes.rightResizeHandle = document.querySelector('#rightHandle');

			_sliderVars.sizes.handleWidth = _sliderVars.sizes.handleMinWidth;

			_sliderVars.nodes.handle.style.left = 0 + 'px';
			_sliderVars.nodes.handle.style.width = '100%';

			//set the slider width
			_reSetSliderSize();

			_sliderVars.nodes.slider.addEventListener('mousedown', _onMouseDown);
			window.addEventListener('keydown', _onArrowMove);
		}

		function _reSetSliderSize() {
			var handleComputedWidth = window.getComputedStyle(document.querySelector('#slideHandle')).width;
			var oldSliderWidth = _sliderVars.sizes.width;

			_sliderVars.sizes.handleWidth = parseInt(handleComputedWidth, 10);
			_sliderVars.sizes.width = document.querySelector('#slider').offsetWidth;

			if (_sliderVars.sizes.width !== _sliderVars.sizes.handleWidth) {
				_resizeSliderHandle(oldSliderWidth);
				_updateSliderIntervals();
			}
		}

		function _onMouseDown(evt) {
			var targetId = evt.target.id;
			var marginAndHalfOfSlideHandleWidth = _SIDE_LIST_WIDTH + (_sliderVars.sizes.handleWidth / 2);
			var leftConstraint = Math.max(evt.clientX - marginAndHalfOfSlideHandleWidth, 0);
			var rightConstraint = _sliderVars.sizes.width - _sliderVars.sizes.handleWidth;
			var constrainedPosition = Math.min(leftConstraint, rightConstraint);

			if (targetId === _sliderVars.nodes.slider.id) {
				_sliderVars.nodes.handle.style.left = constrainedPosition + 'px';
				_sliderVars.drag.handleOffsetLeft = _sliderVars.nodes.handle.offsetLeft;
				_sliderVars.drag.isResize = false;
			} else if (targetId === _sliderVars.nodes.handle.id) {
				_sliderVars.drag.handleClickOffsetX = evt.offsetX;
				_sliderVars.drag.isResize = false;
			} else if (targetId === _sliderVars.nodes.leftResizeHandle.id) {
				_sliderVars.drag.whichResizeHandle = _sliderVars.consts.LEFT_HANDLE_ID;
				_sliderVars.drag.isResize = true;
			} else if (targetId === _sliderVars.nodes.rightResizeHandle.id) {
				_sliderVars.drag.whichResizeHandle = _sliderVars.consts.RIGHT_HANDLE_ID;
				_sliderVars.drag.isResize = true;
			} else {
				return;
			}

			window.addEventListener('mousemove', _onMouseMove);
			window.addEventListener('mouseup', _onMouseUp);
		}

		function _onMouseMove(evt) {
			evt.stopImmediatePropagation();

			var constraintDistance;
			var distance = evt.clientX - _SIDE_LIST_WIDTH;
			if (_sliderVars.drag.isResize) {
				_handleResize(evt);
				return;
			}

			var rightBorder = _sliderVars.sizes.width - _sliderVars.sizes.handleWidth + _sliderVars.drag.handleClickOffsetX;
			constraintDistance = Math.max(Math.min(distance, rightBorder), _sliderVars.drag.handleClickOffsetX);
			_sliderVars.nodes.handle.style.left = constraintDistance - _sliderVars.drag.handleClickOffsetX + 'px';
		}

        function _onArrowMove(evt){

            var offsetLeft = 0;
            var LEFT_ARROW_CODE = 37;
            var RIGHT_ARROW_CODE = 39;
            var STEP = 5;

            if (evt.keyCode != LEFT_ARROW_CODE && evt.keyCode != RIGHT_ARROW_CODE){
                return;
            } else if (evt.keyCode == LEFT_ARROW_CODE){
                offsetLeft = -STEP;
            } else if (evt.keyCode == RIGHT_ARROW_CODE){
                offsetLeft = STEP;
            }
            var maxLeftOffset = Math.min((_sliderVars.drag.handleOffsetLeft + offsetLeft),
                _sliderVars.sizes.width - _sliderVars.sizes.handleWidth);

            _sliderVars.drag.handleOffsetLeft = Math.max(maxLeftOffset, 0);
            _sliderVars.nodes.handle.style.left = _sliderVars.drag.handleOffsetLeft + 'px';

            _updateSliderIntervals();
            _render();

        }

		function _onMouseUp(evt) {
			evt.stopImmediatePropagation();
			window.removeEventListener('mousemove', _onMouseMove);
			window.removeEventListener('mouseup', _onMouseUp);

			var handleComputedWidth = window.getComputedStyle(_sliderVars.nodes.handle).width;

			_sliderVars.sizes.handleWidth = parseInt(handleComputedWidth, 10);
			_sliderVars.drag.handleOffsetLeft = _sliderVars.nodes.handle.offsetLeft;

			_updateSliderIntervals();
			_render();

			var filteredOptions = _getFilterOptions();
			_sliderVars.nodes.slider.setAttribute('title', 'Selected interval from ' + (filteredOptions.filterByTime.start / 1000).toFixed(0) + ' s to ' + (filteredOptions.filterByTime.end / 1000).toFixed(0) + ' s.');
		}

		function _handleResize(evt) {
			evt.stopImmediatePropagation();

			var minWidth;
			var maxWidth;
			var newWidth;
			var resizeDistance;
			var rightConstraint;
			var leftRightConstraints;
			var clientX = evt.clientX - _SIDE_LIST_WIDTH;
			var LEFT_DRAG_OFFSET_VALUE = 9;

			if (_sliderVars.drag.whichResizeHandle === _sliderVars.consts.RIGHT_HANDLE_ID) {
				resizeDistance = clientX - _sliderVars.drag.handleOffsetLeft;
				minWidth = Math.max(resizeDistance, _sliderVars.sizes.handleMinWidth);
				maxWidth = _sliderVars.sizes.width - _sliderVars.drag.handleOffsetLeft;

				newWidth = Math.min(minWidth, maxWidth);
				_sliderVars.nodes.handle.style.width = newWidth + 'px';
			}

			if (_sliderVars.drag.whichResizeHandle === _sliderVars.consts.LEFT_HANDLE_ID) {
				minWidth = _sliderVars.drag.handleOffsetLeft + _sliderVars.sizes.handleWidth - _sliderVars.sizes.handleMinWidth;
				clientX = Math.max(Math.min(clientX, minWidth), 0);
				maxWidth = _sliderVars.drag.handleOffsetLeft + _sliderVars.sizes.handleWidth;
				rightConstraint = Math.min(clientX, _sliderVars.sizes.width);
				leftRightConstraints = Math.max(Math.max(rightConstraint, -2 * _sliderVars.sizes.handleMinWidth),
                    LEFT_DRAG_OFFSET_VALUE);
				newWidth = maxWidth - leftRightConstraints + 9;

				if (newWidth <= LEFT_DRAG_OFFSET_VALUE + _sliderVars.sizes.handleMinWidth){
					newWidth -= LEFT_DRAG_OFFSET_VALUE;
					leftRightConstraints += LEFT_DRAG_OFFSET_VALUE;
				}

				_sliderVars.nodes.handle.style.left = (leftRightConstraints - LEFT_DRAG_OFFSET_VALUE)  + 'px';
				_sliderVars.nodes.handle.style.width = newWidth + 'px';
			}
		}

		function _resizeSliderHandle(oldSliderWidth) {
			var sliderWidthDifference = _sliderVars.sizes.width - oldSliderWidth;
			var upperWidthBound = _sliderVars.sizes.width - _sliderVars.drag.handleOffsetLeft;
			var newHandleWidth = _sliderVars.sizes.handleWidth + sliderWidthDifference;

			_sliderVars.sizes.handleWidth = Math.max(_sliderVars.sizes.handleMinWidth, Math.min(newHandleWidth, upperWidthBound));
			_sliderVars.nodes.handle.style.width = _sliderVars.sizes.handleWidth + 'px';

			if (_sliderVars.sizes.width < (_sliderVars.drag.handleOffsetLeft + _sliderVars.sizes.handleWidth)) {
				_sliderVars.drag.handleOffsetLeft = _sliderVars.sizes.width - _sliderVars.sizes.handleWidth;
				_sliderVars.nodes.handle.style.left = _sliderVars.drag.handleOffsetLeft + 'px';
			}
		}

		function _updateSliderIntervals() {
			if (!_rawdata.length) {
				return;
			}

			var leftInPercent = (_sliderVars.drag.handleOffsetLeft / _sliderVars.sizes.width) * 100;
			var rightInPercent = leftInPercent + (_sliderVars.sizes.handleWidth / _sliderVars.sizes.width) * 100;
			var allRawTimeOnePercent = _rawdata[_rawdata.length - 1].end / 100;

			_sliderVars.selectedInterval.start = (leftInPercent * allRawTimeOnePercent).toFixed(0);
			_sliderVars.selectedInterval.end = (rightInPercent * allRawTimeOnePercent).toFixed(0);
		}

		return Performance;
	});
