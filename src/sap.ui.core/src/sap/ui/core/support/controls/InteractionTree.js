/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/base/ManagedObject',
	'sap/ui/core/IconPool',
	'sap/m/library',
	'sap/m/Popover',
	'sap/m/Text',
	'sap/ui/layout/form/SimpleForm',
	'sap/m/Button',
	'sap/m/Label',
	'sap/m/Link',
	'sap/ui/core/HTML',
	'sap/ui/core/Title',
	"sap/ui/thirdparty/jquery"
],
    function(
		ManagedObject,
	   IconPool,
	   mobileLibrary,
	   Popover,
	   Text,
	   SimpleForm,
	   Button,
	   Label,
	   Link,
	   HTML,
	   Title,
	   jQuery
	) {
       'use strict';

       var PlacementType = mobileLibrary.PlacementType;

       var InteractionTree = ManagedObject.extend("sap.ui.core.support.controls.InteractionTree", {
          constructor: function () {
             this.start = 0;
             this.end = 1;
          }
       });

       InteractionTree.expandIcon = 'sap-icon://navigation-right-arrow';
       InteractionTree.collapseIcon = 'sap-icon://navigation-down-arrow';
       InteractionTree.headerIcon = '<img class="sapUiInteractionSvgImage" src="HeaderIcon.svg">';

       InteractionTree.prototype.setInteractions = function (interactions) {

          this.interactions = interactions;

          this.start = 0;
          this.end = 1;

          this.updateRanges();
       };

       InteractionTree.prototype.setRange = function (start, end) {
          this.start = start;
          this.end = end;

          this.updateRanges();

          this.update();
       };

       InteractionTree.prototype.updateRanges = function () {

          var interactions = this.interactions;
          if (!interactions || !interactions.length) {
             return;
          }

          this.startTime = interactions[0].start;
          this.endTime = interactions[interactions.length - 1].end;

          var range = this.endTime - this.startTime;

          this.actualStartTime = this.startTime + this.start * range;
          this.actualEndTime = this.startTime + this.end * range;

          this.timeRange = this.actualEndTime - this.actualStartTime;
       };

       InteractionTree.prototype.update = function () {
          if (!this.parent) {
             return;
          }

          jQuery(this.parent).find('#' + this.getId()).remove();

          this.renderAt(this.parent);
       };

       InteractionTree.prototype.renderAt = function (parent) {
          this.parent = parent;

          var rm = sap.ui.getCore().createRenderManager();
          this.render(rm);
          rm.flush(parent);
          rm.destroy();

          this.attachEvents();
          this.attachInteractionDetailsPopover();
          this.attachRequestDetailsPopover();
       };

       InteractionTree.prototype.render = function (rm) {

          rm.write('<div id="' + this.getId() + '" class="sapUiInteractionTreeContainer sapUiSizeCompact">');

          rm.write('<div class="sapUiInteractionGridLinesContainer"></div>');

          rm.write('<ul');

          rm.addClass("sapUiInteractionTree");

          rm.writeClasses();

          rm.write(">");

          this.renderHeaders(rm);

          var interaction,
              interactions = this.interactions;

          if (!interactions || !interactions.length) {
             return;
          }

          for (var i = 0; i < interactions.length; i++) {
             interaction = interactions[i];

             this.renderInteraction(rm, interaction, i);
          }

          rm.write("</ul>");

          rm.write("</div>");
       };

       InteractionTree.prototype.attachEvents = function () {
          var that = this,
              interactionTree = jQuery('.sapUiInteractionTreeContainer .sapUiInteractionTree');

          this.gridContainer = jQuery('.sapUiInteractionTreeContainer .sapUiInteractionGridLinesContainer');
          this.gridContainerWidth = 0;

          interactionTree.bind('click', function (event) {

             var $target = jQuery(event.target);

             if ($target.hasClass('sapUiInteractionLeft')) {
                that.handleInteractionClick($target);
             }
          });

          this.gridContainer.resize(function (event) {
             that.updateGridLines();
          });

          jQuery(window).resize(function (event) {
             that.updateGridLines();
          });

          that.updateGridLines();
       };

       InteractionTree.prototype.updateGridLines = function () {

          var gridContainer = this.gridContainer,
              range = this.timeRange,
              width = this.gridContainer.width();

          if (this.gridContainerWidth == width) {
             return;
          }

          gridContainer.empty();

          gridContainer.append('<div style="left:' + (this.getPosition(width, range, 0) + 6) + 'px" class="sapUiInteractionGridLineIntervalText">' + this.formatGridLineDuration(0) + '</div>');

          var interval = this.calculateInterval(width, range);

          for (var i = interval; i < range; i += interval) {

             var position = this.getPosition(width, range, i);

             if (i + interval < range) {
                gridContainer.append('<div style="left:' + (position + 6) + 'px" class="sapUiInteractionGridLineIntervalText">' + this.formatGridLineDuration(i) + '</div>');
             }

             gridContainer.append('<div style="left:' + position + 'px" class="sapUiInteractionGridLine"></div>');
          }

          this.gridContainerWidth = width;
       };

       InteractionTree.prototype.calculateInterval = function (width, range) {
          var maxInter200Px = 4;
          var maxInterCount = Math.max(width * maxInter200Px / 200.0, 1.0);

          var bestInterval = range / maxInterCount;

          var minIdealInter = Math.pow(10, Math.floor(Math.log(bestInterval) / Math.LN10));

          var idMults = [10, 5, 2, 1];

          for (var i = 0; i < idMults.length; i++) {
             var idealMultiplier = idMults[i];
             var curIdealInter = minIdealInter * idealMultiplier;
             if (maxInterCount < (range / curIdealInter)) {
                break;
             }

             bestInterval = curIdealInter;
          }

          return bestInterval;
       };

       InteractionTree.prototype.getPosition = function (width, range, val) {
          var position = width / range * val;

          return position;
       };

       InteractionTree.prototype.handleInteractionClick = function ($div) {

          var $icon = $div.find('.sapUiInteractionTreeIcon');

          if (!$icon.length) {
             return;
          }

          var expanded = $icon.attr('expanded') == 'true';

          var $parent = $icon.parent();
          $icon.remove();

          var iconHTML = this.getIconHTML(!expanded);
          $parent.children().eq(0).after(iconHTML);

          var $li = $parent.parent().parent();
          $li.toggleClass('sapUiInteractionItemExpanded');

          var index = parseInt($li.attr('data-interaction-index'));
          this.interactions[index].isExpanded = !expanded;

          var $container = $li.find('ul');

          var func = expanded ? 'slideUp' : 'slideDown';

          $container.stop(true, true)[func]('fast', function () {
             $container.toggleClass('sapUiHiddenUiInteractionItems');
          });
       };

       InteractionTree.prototype.renderHeaders = function (rm) {
          rm.write('<li>');

          rm.write('<div');

          rm.addClass("sapUiInteractionTreeItem");
          rm.addClass("sapUiInteractionItemDiv");
          rm.addClass("sapUiInteractionHeader");

          rm.writeClasses();

          rm.write(">");

          rm.write('<div class="sapUiInteractionTreeItemLeft">');

          rm.write("<div>");

          rm.write('<span class="sapUiInteractionItemComponentText">');
          rm.writeEscaped('Component');
          rm.write('</span>');


          rm.write("<br/>");


          rm.write('<span class="sapUiInteractionItemTriggerText">');
          rm.writeEscaped('Trigger');
          rm.write('</span>');

          rm.write("</div>");

          rm.write('</div>'); // sapUiInteractionTreeItemLeft


          rm.write('<div class="sapUiInteractionTreeItemRight">');

          rm.write('</div>');
          rm.write("</div>");


          rm.write("</li>");
       };

       InteractionTree.prototype.isInteractionVisible = function (interaction) {
          var start = interaction.start;
          var end = interaction.end;

          if (this.actualStartTime > end || this.actualEndTime < start) {
             return false;
          }

          if (this.actualStartTime < start + interaction.duration && this.actualEndTime > start) {
             return true;
          }

          return this.hasVisibleRequests(interaction);
       };

       InteractionTree.prototype.hasVisibleRequests = function (interaction) {
          var request,
              start,
              end,
              requests = interaction.requests;

          for (var i = 0; i < requests.length; i++) {

             request = requests[i];

             start = request.fetchStartOffset + request.startTime;
             end = request.fetchStartOffset + request.startTime + this.getRequestDuration(request);

             if (this.actualStartTime < end && this.actualEndTime > start) {
                return true;
             }
          }

          return false;
       };

       InteractionTree.prototype.renderInteraction = function (rm, interaction, index) {
          var request,
              requests = interaction.requests;

          if (!this.isInteractionVisible(interaction)) {
             return;
          }

          rm.write('<li data-interaction-index="' + index + '"');

          if (interaction.isExpanded) {
             rm.addClass('sapUiInteractionItemExpanded');
             rm.writeClasses();
          }

          rm.write('>');

          this.renderInteractionDiv(rm, interaction);

          rm.write("<ul");

          rm.addClass("sapUiInteractionItem");

          if (!interaction.isExpanded) {
             rm.addClass("sapUiHiddenUiInteractionItems");
          }

          rm.writeClasses();
          rm.write(">");


          for (var i = 0; i < requests.length; i++) {
             request = requests[i];
             this.renderRequest(rm, interaction, request, i);
          }

          rm.write("</ul>");
          rm.write("</li>");
       };

       InteractionTree.prototype.renderInteractionDiv = function (rm, interaction) {
          rm.write('<div');

          rm.addClass("sapUiInteractionTreeItem");
          rm.addClass("sapUiInteractionItemDiv");

          rm.writeClasses();

          rm.write(">");

          rm.write('<div class="sapUiInteractionLeft sapUiInteractionTreeItemLeft">');

          rm.write("<div>");

          rm.write('<span class="sapUiInteractionItemComponentText">');
          rm.writeEscaped((interaction.component !== "undetermined") ? interaction.component : 'Initial Loading');
          rm.write('</span>');


          rm.write("<br/>");


          rm.write('<span class="sapUiInteractionItemTriggerText">');
          rm.writeEscaped(interaction.trigger + " / " + interaction.event);
          rm.write('</span>');

          rm.write("</div>");

          if (interaction.requests.length) {
             this.renderIcon(rm, interaction.isExpanded);
          }

          if (interaction.sapStatistics.length && interaction.requests.length) {
             rm.write('<div class="sapUiInteractionHeaderIcon">' + InteractionTree.headerIcon + '</div>');
          }

          rm.write('</div>'); // sapUiInteractionTreeItemLeft

          rm.write('<div class="sapUiInteractionTreeItemRight">');

          var middle = Math.round(interaction.start + interaction.duration);

          this.renderInteractionPart(rm, interaction.start, middle, 'sapUiInteractionBlue');
          // this.renderInteractionPart(rm, middle, interaction.end, 'sapUiInteractionBlueLight');

          rm.write('</div>');
          rm.write("</div>");
       };

       InteractionTree.prototype.renderInteractionPart = function (rm, start, end, colorClass) {
          if (this.actualStartTime > end || this.actualEndTime < start) {
             return;
          }

          end = Math.min(end, this.actualEndTime);
          start = Math.max(start, this.actualStartTime);

          var left = 100 / this.timeRange * (start - this.actualStartTime);
          var right = 100 / this.timeRange * (end - this.actualStartTime);
          var width = right - left;

          rm.write('<span style="margin-left: ' + left + '%; width: ' + width + '%" class="sapUiInteractionTimeframe sapUiInteractionTimeInteractionFrame ' + colorClass + '"></span>');
       };

       InteractionTree.prototype.renderRequest = function (rm, interaction, request, index) {

          var fetchStartOffset = request.fetchStartOffset;

          var start = fetchStartOffset + request.startTime;
          var end = fetchStartOffset + request.startTime + this.getRequestDuration(request);

          if (this.actualStartTime > end || this.actualEndTime < start) {
             return;
          }

          rm.write('<li data-request-index="' + index + '"');

          rm.addClass("sapUiInteractionTreeItem");
          rm.addClass("sapUiInteractionRequest");

          rm.writeClasses();

          rm.write(">");

          rm.write('<div class="sapUiInteractionTreeItemLeft sapUiInteractionRequestLeft">');

          var requestType = request.initiatorType || request.entryType;

          var colorClass = this.getRequestColorClass(requestType);

          rm.write('<span class="sapUiInteractionRequestIcon ' + colorClass + '"></span>');

          rm.write('<span class="sapUiInteractionItemEntryTypeText">');
          rm.writeEscaped(requestType);
          rm.write('</span>');

          if (this.getRequestSapStatistics(interaction, request)) {
            rm.write('<div class="sapUiInteractionRequestHeaderIcon">' + InteractionTree.headerIcon + '</div>');
          }

          rm.write('</div>');

          rm.write('<div class="sapUiInteractionTreeItemRight"');
          rm.write('>');

          var requestStart = this.getRequestRequestStart(request) + fetchStartOffset;
          var responseStart = this.getRequestResponseStart(request) + fetchStartOffset;

          this.renderRequestPart(rm, start, requestStart, colorClass + '70');
          this.renderRequestPart(rm, requestStart, responseStart, colorClass);
          this.renderRequestPart(rm, responseStart, end, colorClass + '70');

          rm.write('</div>');

          rm.write("</li>");
       };

       InteractionTree.prototype.getRequestSapStatistics = function (interaction, request) {
          var sapStatistic,
              sapStatistics = interaction.sapStatistics;

          for (var j = 0; j < sapStatistics.length; j++) {
             if (sapStatistics[j].timing && request.startTime === sapStatistics[j].timing.startTime) {
                sapStatistic = sapStatistics[j];
                return sapStatistic;
             }
          }

          return false;
       };

       InteractionTree.prototype.getRequestColorClass = function (requestType) {

          var colorClass;

          switch (requestType) {
             case 'xmlhttprequest':
                colorClass = 'sapUiPurple';
                break;
             case 'OData':
                colorClass = 'sapUiRed';
                break;
             case 'link':
             case 'css':
                colorClass = 'sapUiAccent1';
                break;
             default:
                colorClass = 'sapUiAccent8';
                break;
          }

          return colorClass;
       };

       InteractionTree.prototype.attachRequestDetailsPopover = function () {
          var simpleForm, clientVsServerTitle, progressBar, closeButton, initiatorTypeText, entryTypeText, nameLink, startText, endText, durationText,
              statisticsTitle, totalLabel, totalText, fwLabel, fwText, appLabel, appText;

          var that = this;
          var requestDivElements = jQuery('.sapUiInteractionRequest.sapUiInteractionTreeItem .sapUiInteractionTreeItemRight');

          /* eslint-disable no-loop-func */
          if (requestDivElements.length) {
             var oPopover = createEmptyPopOver();

             for (var i = 0; i < requestDivElements.length; i++) {
                requestDivElements[i].addEventListener('click', function (event) {
                   initializePopOverClientServerProgressBar.call(this);
                   initializePopOverRequestData.call(this);
                   initializePopOverSapStatisticsData.call(this);

                   var requestBarElement = jQuery(this).children()[0];
                   oPopover.openBy(requestBarElement);
                });
             }
          }
          /* eslint-enable no-loop-func */

          function initializePopOverSapStatisticsData() {

             var $element = jQuery(this);

             var $requestLi = $element.parents('li[data-request-index]');
             var $interactionLi = $element.parents('li[data-interaction-index]');

             var interactionIndex = parseInt($interactionLi.attr('data-interaction-index'));
             var requestIndex = parseInt($requestLi.attr('data-request-index'));

             var interaction = that.interactions[interactionIndex];
             var request = interaction.requests[requestIndex];

             if (!interaction || !request) {
                return;
             }

             var sapStatistic = that.getRequestSapStatistics(interaction, request);

             if (sapStatistic) {
                if (!statisticsTitle.getParent()) {
                   simpleForm.addContent(statisticsTitle);
                   simpleForm.addContent(totalLabel);
                   simpleForm.addContent(totalText);
                   simpleForm.addContent(fwLabel);
                   simpleForm.addContent(fwText);
                   simpleForm.addContent(appLabel);
                   simpleForm.addContent(appText);
                }

                var statistics = sapStatistic.statistics;

                totalText.setText(that.formatDuration(parseFloat(statistics.substring(statistics.indexOf("total=") + "total=".length, statistics.indexOf(",")))));
                statistics = statistics.substring(statistics.indexOf(",") + 1);
                fwText.setText(that.formatDuration(parseFloat(statistics.substring(statistics.indexOf("fw=") + "fw=".length, statistics.indexOf(",")))));
                statistics = statistics.substring(statistics.indexOf(",") + 1);
                appText.setText(that.formatDuration(parseFloat(statistics.substring(statistics.indexOf("app=") + "app=".length, statistics.indexOf(",")))));
             } else if (statisticsTitle.getParent()) {
                simpleForm.removeContent(statisticsTitle);
                simpleForm.removeContent(totalLabel);
                simpleForm.removeContent(totalText);
                simpleForm.removeContent(fwLabel);
                simpleForm.removeContent(fwText);
                simpleForm.removeContent(appLabel);
                simpleForm.removeContent(appText);
             }
          }

          function initializePopOverRequestData() {

             var request = that.getRequestFromElement(jQuery(this));

             initiatorTypeText.setText(request.initiatorType || '');
             entryTypeText.setText(request.entryType || '');
             nameLink.setText(request.name);
             nameLink.setHref(request.name);

             var duration = that.getRequestDuration(request);

             var start = request.fetchStartOffset + request.startTime;
             var end = start + duration;

             startText.setText(that.formatTime(start));
             endText.setText(that.formatTime(end));
             durationText.setText(that.formatDuration(duration));
          }

          function initializePopOverClientServerProgressBar() {

             var request = that.getRequestFromElement(jQuery(this));

             var fetchStartOffset = request.fetchStartOffset;
             var duration = that.getRequestDuration(request);

             var start = fetchStartOffset + request.startTime;
             var end = start + duration;

             var requestStart = that.getRequestRequestStart(request) + fetchStartOffset;
             var responseStart = that.getRequestResponseStart(request) + fetchStartOffset;

             var preprocessingTime = requestStart - start;
             var serverTotalTime = responseStart - requestStart;

             var clientTotalTime = end - responseStart;

             var serverTimePercent = Math.floor(100 * serverTotalTime / duration);
             var clientTimePercent = Math.floor(100 * clientTotalTime / duration);
             var preprocessingTimePercent = Math.floor(100 *  preprocessingTime / duration);

             var titleTemplate = '<span class="sapUiInteractionTitleSection"><div class="sapUiInteractionTitleText">{Title}</div><div class="sapUiInteractionTitleSubText">{Subtitle}</div></span>';

             var clientVsServerHTML = '<div class="sapUiInteractionTitle">';

             clientVsServerHTML += titleTemplate.replace('{Title}', 'PREPROCESSING').replace('{Subtitle}', that.formatDuration(preprocessingTime));
             clientVsServerHTML += titleTemplate.replace('{Title}', 'SERVER').replace('{Subtitle}', that.formatDuration(serverTotalTime));
             clientVsServerHTML += titleTemplate.replace('{Title}', 'CLIENT').replace('{Subtitle}', that.formatDuration(clientTotalTime));

             clientVsServerHTML += '</div>';

             clientVsServerTitle.setContent(clientVsServerHTML);

             var requestType = request.initiatorType || request.entryType;

             var colorClass = that.getRequestColorClass(requestType);
             var colorClass70 = colorClass + '70';

             var preprocessHTML = "<span class='sapUiSupportIntProgressBar " + colorClass70 + "'' style=\"width:calc(" + preprocessingTimePercent +
                 "% - 1px)\"></span><span class='sapUiSupportIntProgressBarSeparator'></span>";

             var serverHTML = "<span class='sapUiSupportIntProgressBar " + colorClass + "' style=\"width:calc(" + serverTimePercent + "% - 1px)\"></span>" +
                 "<span class='sapUiSupportIntProgressBarSeparator'></span>";

             var clientHTML = "<span class='sapUiSupportIntProgressBar " + colorClass70 + "'' style=\"width:calc(" + clientTimePercent + "% - 1px)\"></span>";

             var progressBarHTML = "<div class='sapUiSupportIntProgressBarParent'>" + preprocessHTML + serverHTML + clientHTML + "</div>";

             progressBar.setContent(progressBarHTML);
          }

          function createEmptyPopOver() {
             var oPopover = new Popover({
                placement: PlacementType.Auto,
                contentWidth: "400px",
                showHeader: false,
                showArrow: true,
                verticalScrolling: true,
                horizontalScrolling: false,
                content: [
                   createPopOverContent()
                ]
             }).addStyleClass('sapUiSupportPopover');

             oPopover.attachAfterOpen(function(oEvent){
                oEvent.getSource().$().focus();
             });

             return oPopover;
          }

          function createPopOverContent() {
             clientVsServerTitle = new HTML();
             progressBar = new HTML();
             closeButton = new Button({
                icon : IconPool.getIconURI("decline"),
                type: "Transparent",
                press : function() {
                   oPopover.close();
                }
             }).addStyleClass("sapUiSupportReqPopoverCloseButton");
             closeButton.setTooltip("Close");
             initiatorTypeText = new Text().addStyleClass("sapUiSupportIntRequestText");
             entryTypeText = new Text().addStyleClass("sapUiSupportIntRequestText");
             nameLink = new Link({target: "_blank", wrapping: true}).addStyleClass("sapUiSupportIntRequestLink");
             startText = new Text().addStyleClass("sapUiSupportIntRequestText");
             endText = new Text().addStyleClass("sapUiSupportIntRequestText");
             durationText = new Text().addStyleClass("sapUiSupportIntRequestText");
             statisticsTitle = new Title({text: "SAP STATISTICS FOR ODATA CALLS"});
             totalLabel = new Label({text: "Gateway Total"}).addStyleClass("sapUiSupportIntRequestLabel");
             totalText = new Text().addStyleClass("sapUiSupportIntRequestText");
             fwLabel = new Label({text: "Framework"}).addStyleClass("sapUiSupportIntRequestLabel");
             fwText = new Text().addStyleClass("sapUiSupportIntRequestText");
             appLabel = new Label({text: "Application"}).addStyleClass("sapUiSupportIntRequestLabel");
             appText = new Text().addStyleClass("sapUiSupportIntRequestText");

             simpleForm = new SimpleForm({
                maxContainerCols: 2,
                minWidth: 400,
                labelMinWidth: 100,
                editable: false,
                layout: "ResponsiveGridLayout",
                labelSpanM: 3,
                emptySpanM: 0,
                columnsM: 1,
                breakpointM: 0,
                content: [
                   new Title({text: "REQUEST DATA"}),
                   new Label({text: "Initiator Type"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   initiatorTypeText,
                   new Label({text: "Entry Type"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   entryTypeText,
                   new Label({text: "Name"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   nameLink,
                   new Label({text: "Start Time"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   startText,
                   new Label({text: "End Time"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   endText,
                   new Label({text: "Duration"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   durationText
                ]
             });

             return [
                clientVsServerTitle,
                progressBar,
                closeButton,
                simpleForm
             ];
          }
       };

       InteractionTree.prototype.getRequestFromElement = function ($element) {
          var $requestLi = $element.parents('li[data-request-index]');
          var $interactionLi = $element.parents('li[data-interaction-index]');

          var interactionIndex = parseInt($interactionLi.attr('data-interaction-index'));
          var requestIndex = parseInt($requestLi.attr('data-request-index'));

          var request = this.interactions[interactionIndex].requests[requestIndex];

          return request;
       };

       InteractionTree.prototype.attachInteractionDetailsPopover = function () {
          var simpleForm,
              closeButton,
              durationText,
              processingText,
              requestTimeText,
              roundtripText,
              bytesReceivedText,
              requestNumberText,
              startTimeText;

          var that = this;
          var interactionsDivElements = jQuery('.sapUiInteractionItemDiv.sapUiInteractionTreeItem .sapUiInteractionTreeItemRight');

          /* eslint-disable no-loop-func */
          if (interactionsDivElements.length) {
             var oPopover = createEmptyPopOver();

             for (var i = 0; i < interactionsDivElements.length; i++) {
                interactionsDivElements[i].addEventListener('click', function (event) {
                   initializePopOverInteractionData.call(this);

                   var interactionBarElement = jQuery(this).children()[0];
                   oPopover.openBy(interactionBarElement);
                });
             }
          }
          /* eslint-enable no-loop-func */

          function initializePopOverInteractionData() {

             var $li = jQuery(this).parent().parent();
             var index = parseInt($li.attr('data-interaction-index'));
             var interaction = that.interactions[index];

             if (!interaction) {
                return;
             }

             durationText.setText(that.formatDuration(interaction.duration));
             processingText.setText(that.formatDuration(interaction.duration - interaction.roundtrip));
             requestTimeText.setText(that.formatDuration(interaction.requestTime));
             roundtripText.setText(that.formatDuration(interaction.roundtrip));

             bytesReceivedText.setText(interaction.bytesReceived);
             requestNumberText.setText(interaction.requests.length);

             startTimeText.setText(that.formatTime(interaction.start));
          }

          function createEmptyPopOver() {
             var oPopover = new Popover({
                placement: PlacementType.Auto,
                contentWidth: "350px",
                showHeader: false,
                showArrow: true,
                verticalScrolling: true,
                horizontalScrolling: false,
                content: [
                   createPopOverContent()
                ]
             }).addStyleClass('sapUiSupportPopover');

             oPopover.attachAfterOpen(function(oEvent){
                oEvent.getSource().$().focus();
             });
             return oPopover;
          }

          function createPopOverContent() {
             closeButton = new Button({
                icon : IconPool.getIconURI("decline"),
                type: "Transparent",
                press : function() {
                   oPopover.close();
                }
             }).addStyleClass("sapUiSupportIntPopoverCloseButton");
             closeButton.setTooltip("Close");
             durationText = new Text().addStyleClass("sapUiSupportIntRequestText");
             processingText = new Text().addStyleClass("sapUiSupportIntRequestText");
             requestTimeText = new Text().addStyleClass("sapUiSupportIntRequestText");
             roundtripText = new Text().addStyleClass("sapUiSupportIntRequestText");
             bytesReceivedText = new Text().addStyleClass("sapUiSupportIntRequestText");
             requestNumberText = new Text().addStyleClass("sapUiSupportIntRequestText");
             startTimeText = new Text().addStyleClass("sapUiSupportIntRequestText");

             simpleForm = new SimpleForm({
                maxContainerCols: 2,
                minWidth: 400,
                labelMinWidth: 100,
                editable: false,
                layout: "ResponsiveGridLayout",
                labelSpanM: 7,
                emptySpanM: 0,
                columnsM: 1,
                breakpointM: 0,
                content:[
                   new Title({text:"INTERACTION DATA"}),
                   new Label({text: "Duration"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   durationText,
                   new Label({text: "Client Processing Duration"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   processingText,
                   new Label({text: "Total Requests Duration"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   requestTimeText,
                   new Label({text: "Roundtrip Duration"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   roundtripText,
                   new Label({text:"Bytes Received"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   bytesReceivedText,
                   new Label({text:"Request Count"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   requestNumberText,
                   new Label({text:"Start Time"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   startTimeText
                ]
             }).addStyleClass("sapUiSupportIntPopoverForm");
             return [closeButton, simpleForm];
          }
       };

       InteractionTree.prototype.renderRequestPart = function (rm, start, end, colorClass) {
          if (this.actualStartTime > end || this.actualEndTime < start) {
             return;
          }

          end = Math.min(end, this.actualEndTime);
          start = Math.max(start, this.actualStartTime);

          var left = 100 / this.timeRange * (start - this.actualStartTime);
          var right = 100 / this.timeRange * (end - this.actualStartTime);
          var width = right - left;

          rm.write('<span style="margin-left: ' + left + '%; width: ' + width + '%" class="sapUiInteractionTimeframe sapUiInteractionTimeRequestFrame ' + colorClass + '"></span>');

       };

       InteractionTree.prototype.getRequestDuration = function(request) {
          if (request.duration > 0) {
             return request.duration;
          }

          var end = request.responseStart || request.requestStart || request.fetchStart;

          return end - request.startTime;
       };

       InteractionTree.prototype.getRequestRequestStart = function(request) {
          if (request.requestStart > 0) {
             return request.requestStart;
          }

          return request.fetchStart || request.startTime;
       };

       InteractionTree.prototype.getRequestResponseStart = function(request) {
          if (request.responseStart > 0) {
             return request.responseStart;
          }

          return request.requestStart || request.fetchStart || request.startTime;
       };

       InteractionTree.prototype.pad0 = function (i, w) {
          return ("000" + String(i)).slice(-w);
       };

       InteractionTree.prototype.formatGridLineDuration = function (duration) {

          var offset = this.actualStartTime - this.startTime;
          duration += offset;

          return duration > 100 ? (duration / 1000).toFixed(2) + ' s' : duration.toFixed(0) + ' ms';
       };

       InteractionTree.prototype.formatDuration = function (duration) {

          duration = Math.max(duration, 0);

          if (duration < 3) {
             return duration.toFixed(2) + ' ms';
          }

          return duration >= 1000 ? (duration / 1000).toFixed(3) + ' s' : duration.toFixed(0) + ' ms';
       };

       InteractionTree.prototype.formatTime = function (now) {

          var oNow = new Date(now);

          return this.pad0(oNow.getHours(), 2) + ":" + this.pad0(oNow.getMinutes(), 2) + ":" + this.pad0(oNow.getSeconds(), 2) + "." + this.pad0(oNow.getMilliseconds(), 3);
       };

       InteractionTree.prototype.renderIcon = function (rm, expanded) {
          var html = this.getIconHTML(expanded);
          rm.write(html);
       };

       InteractionTree.prototype.getIconHTML = function (expanded) {

          var icon = expanded ? InteractionTree.collapseIcon : InteractionTree.expandIcon;

          var classes = "sapUiIcon sapUiInteractionTreeIcon";

          if (iconInfo && !iconInfo.suppressMirroring) {
             classes += " sapUiIconMirrorInRTL";
          }

          var html = '<span aria-hidden="true" expanded="' + expanded + '" class="' + classes + '" ';

          var iconInfo = IconPool.getIconInfo(icon);

          if (iconInfo) {
             html += 'data-sap-ui-icon-content="' + iconInfo.content + '"';
             html += ' style="font-family:\'SAP-icons\'"';
          }

          html += "></span>";

          return html;
       };

       return InteractionTree;
    });