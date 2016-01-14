/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject', 'sap/ui/core/IconPool', 'sap/m/Popover', 'sap/m/Text', 'sap/ui/layout/form/SimpleForm', 'sap/m/Label', 'sap/m/Link'],
    function (jQuery, ManagedObject, IconPool, Popover, Text, SimpleForm, Label, Link) {
       'use strict';

       var InteractionTree = ManagedObject.extend("sap.ui.core.support.controls.InteractionTree", {
          constructor: function () {
             this.start = 0;
             this.end = 1;
          }
       });

       InteractionTree.expandIcon = 'sap-icon://navigation-right-arrow';
       InteractionTree.collapseIcon = 'sap-icon://navigation-down-arrow';

       InteractionTree.prototype.setInteractions = function (interactions) {

          this.interactions = interactions;

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

          rm.write('<div id="' + this.getId() + '" class="sapUiInteractionTreeContainer">');

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

          var index = parseInt($li.attr('interaction'), 10);
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

       InteractionTree.prototype.renderInteraction = function (rm, interaction, index) {
          var request,
              requests = interaction.requests,
              sapStatistics = interaction.sapStatistics;

          var start = interaction.start;
          var end = interaction.end + interaction.duration;

          if (this.actualStartTime > end || this.actualEndTime < start) {
             return;
          }

          rm.write('<li interaction="' + index + '"');

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

             this.renderRequest(rm, interaction, request, sapStatistics[i], i);
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
          rm.writeEscaped(interaction.component);
          rm.write('</span>');


          rm.write("<br/>");


          rm.write('<span class="sapUiInteractionItemTriggerText">');
          rm.writeEscaped(interaction.trigger);
          rm.write('</span>');

          rm.write("</div>");

          if (interaction.requests.length) {
             this.renderIcon(rm, interaction.isExpanded);
          } else {
             rm.write('<div class="sapUiInteractionTreeSpace"></div>');
          }

          if (interaction.sapStatistics.length) {
             rm.write('<div class="sapUiInteractionHeaderIcon sapUiBlue">H</div>');
          }

          rm.write('</div>'); // sapUiInteractionTreeItemLeft

          rm.write('<div class="sapUiInteractionTreeItemRight"');
          this.writeInteractionAttrAsCustomData(interaction, rm);
          rm.write('>');

          var start = Math.max(interaction.start, this.actualStartTime);
          var end = Math.min(interaction.end, this.actualEndTime);

          var left = 100 / this.timeRange * (start - this.actualStartTime);
          var right = 100 / this.timeRange * (end - this.actualStartTime);
          var width = right - left;

          rm.write('<span style="margin-left: ' + left + '%; width: ' + width + '%" class="sapUiInteractionTimeframe sapUiInteractionTimeInteractionFrame"></span>');

          rm.write('</div>');
          rm.write("</div>");
       };

       InteractionTree.prototype.writeInteractionAttrAsCustomData = function (interaction, rm) {
          for (var property in interaction) {
             if (interaction.hasOwnProperty(property) && interaction[property].constructor !== Array) {
                rm.writeAttribute('data-' + property, interaction[property]);
             }
          }
          rm.writeAttribute('data-requestscount', interaction.requests.length);
       };

       InteractionTree.prototype.renderRequest = function (rm, interaction, request, sapStatistic, index) {

          var fetchStartOffset = request.fetchStartOffset;

          var start = fetchStartOffset + request.startTime;
          var end = fetchStartOffset + request.startTime + request.duration;

          if (this.actualStartTime > end || this.actualEndTime < start) {
             return;
          }

          rm.write('<li');

          rm.addClass("sapUiInteractionTreeItem");
          rm.addClass("sapUiInteractionRequest");

          rm.writeClasses();

          rm.write(">");

          rm.write('<div class="sapUiInteractionTreeItemLeft sapUiInteractionRequestLeft">');

          var requestType = request.initiatorType || request.entryType;

          var colorClass;

          switch (requestType) {
             case 'OData':
                colorClass = 'sapUiRed';
                  break;
             case 'xmlhttprequest':
                colorClass = 'sapUiPurple';
                break;
             default:
                colorClass = 'sapUiAccent8';
                  break;
          }

          rm.write('<span class="sapUiInteractionRequestIcon ' + colorClass + '"></span>');

          rm.write('<span class="sapUiInteractionItemEntryTypeText">');
          rm.writeEscaped(requestType);
          rm.write('</span>');

          rm.write('</div>');

          rm.write('<div class="sapUiInteractionTreeItemRight"');
          this.writeAttributesAsCustomData(request, rm);
          this.writeAttributesAsCustomData(sapStatistic, rm);
          rm.write('>');

          var requestStart = request.requestStart + fetchStartOffset;
          var responseStart = request.responseStart + fetchStartOffset;

          this.renderRequestPart(rm, start, requestStart, colorClass + '70');
          this.renderRequestPart(rm, requestStart, responseStart, colorClass);
          this.renderRequestPart(rm, responseStart, end, colorClass + '70');

          rm.write('</div>');

          rm.write("</li>");
       };

       InteractionTree.prototype.writeAttributesAsCustomData = function (attrs, rm) {
          for (var property in attrs) {
             if (attrs.hasOwnProperty(property)) {
                rm.writeAttribute('data-' + property, attrs[property]);
             }
          }
       };

       InteractionTree.prototype.attachRequestDetailsPopover = function () {
          var simpleForm, clientVsServerTitle, progressBar, initiatorTypeText, entryTypeText, nameLink, startText, endText, durationText,
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

                   var requestBarElement = jQuery(this).children()[1];
                   oPopover.openBy(requestBarElement);
                });
             }
          }
          /* eslint-enable no-loop-func */

          function initializePopOverSapStatisticsData() {
             var statisticAttr = this.getAttribute("data-statistics");
             if (statisticAttr) {
                simpleForm.addContent(statisticsTitle);
                simpleForm.addContent(totalLabel);
                simpleForm.addContent(totalText);
                simpleForm.addContent(fwLabel);
                simpleForm.addContent(fwText);
                simpleForm.addContent(appLabel);
                simpleForm.addContent(appText);

                totalText.setText(statisticAttr.substring(statisticAttr.indexOf("total=") + "total=".length, statisticAttr.indexOf(",")));
                statisticAttr = statisticAttr.substring(statisticAttr.indexOf(",") + 1);
                fwText.setText(statisticAttr.substring(statisticAttr.indexOf("fw=") + "fw=".length, statisticAttr.indexOf(",")));
                statisticAttr = statisticAttr.substring(statisticAttr.indexOf(",") + 1);
                appText.setText(statisticAttr.substring(statisticAttr.indexOf("app=") + "app=".length, statisticAttr.indexOf(",")));
             } else {
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
             initiatorTypeText.setText(this.getAttribute("data-initiatorType"));
             entryTypeText.setText(this.getAttribute("data-entryType"));
             nameLink.setText(this.getAttribute("data-name"));
             nameLink.setHref(this.getAttribute("data-name"));
             startText.setText(that.formatTime(parseFloat(this.getAttribute("data-fetchStartOffset")) + parseFloat(this.getAttribute("data-startTime"))));
             endText.setText(that.formatTime(parseFloat(this.getAttribute("data-fetchStartOffset")) + parseFloat(this.getAttribute("data-startTime")) + parseFloat(this.getAttribute("data-duration"))));
             durationText.setText(that.formatDuration(parseFloat(this.getAttribute("data-duration"))));
          }

          function initializePopOverClientServerProgressBar() {
             var connectDuration = (parseFloat(this.getAttribute("data-connectEnd")) - parseFloat(this.getAttribute("data-connectStart")));
             var domainLookupDuration = (parseFloat(this.getAttribute("data-domainLookupEnd")) - parseFloat(this.getAttribute("data-domainLookupStart")));
             var redirectDuration = (parseFloat(this.getAttribute("data-redirectEnd")) - parseFloat(this.getAttribute("data-redirectStart")));

             var preprocessingTime = connectDuration + domainLookupDuration + redirectDuration ;
             var serverTotalTime = parseFloat(this.getAttribute("data-responseStart")) - parseFloat(this.getAttribute("data-requestStart"));
             var clientTotalTime = parseFloat(this.getAttribute("data-responseEnd")) - parseFloat(this.getAttribute("data-responseStart"));

             var serverTimePercent = (serverTotalTime / (serverTotalTime + clientTotalTime + preprocessingTime)) * 100;
             var clientTimePercent = (clientTotalTime / (serverTotalTime + clientTotalTime + preprocessingTime)) * 100;
             var preprocessingTimePercent = (preprocessingTime / (serverTotalTime + clientTotalTime + preprocessingTime)) * 100;

             var preprocessingTimeRounded = Math.round(preprocessingTime * 100) / 100;
             var serverTimeRounded = Math.round(serverTotalTime * 100) / 100;
             var clientTimeRounded = Math.round(clientTotalTime * 100) / 100;

             clientVsServerTitle.setText("Preprocessing / Server / Client (" + preprocessingTimeRounded + "ms / " + serverTimeRounded + "ms / " + clientTimeRounded + "ms)");
             progressBar.setContent("<div class='sapUiSupportIntProgressBarParent'><span class='sapUiSupportIntProgressBarPreprocess' style=\"width:calc(" + preprocessingTimePercent
                 + "% - 1px)\"></span><span class='sapUiSupportIntProgressBarSeparator'></span><span class='sapUiSupportIntProgressBarClient' style=\"width:calc(" + serverTimePercent + "% - 1px)\"></span>" +
                 "<span class='sapUiSupportIntProgressBarSeparator'></span><span class='sapUiSupportIntProgressBarServer' style=\"width:calc(" + clientTimePercent + "% - 1px)\"></span></div>");
          }

          function createEmptyPopOver() {
             var oPopover = new Popover({
                placement: sap.m.PlacementType.Auto,
                contentWidth: "450px",
                showHeader: false,
                showArrow: true,
                verticalScrolling: true,
                horizontalScrolling: false,
                initialFocus: "dummyFocus",
                content: [
                   createPopOverContent()
                ]
             });
             return oPopover;
          }

          function createPopOverContent() {
             clientVsServerTitle = new sap.ui.core.Title();
             progressBar = new sap.ui.core.HTML();
             initiatorTypeText = new Text().addStyleClass("sapUiSupportIntRequestText");
             entryTypeText = new Text().addStyleClass("sapUiSupportIntRequestText");
             nameLink = new Link({target: "_blank", wrapping: true}).addStyleClass("sapUiSupportIntRequestLink");
             startText = new Text().addStyleClass("sapUiSupportIntRequestText");
             endText = new Text().addStyleClass("sapUiSupportIntRequestText");
             durationText = new Text().addStyleClass("sapUiSupportIntRequestText");
             statisticsTitle = new sap.ui.core.Title({text:"SAP STATISTICS"});
             totalLabel = new sap.m.Label({text:"Total"}).addStyleClass("sapUiSupportIntRequestLabel");
             totalText = new Text().addStyleClass("sapUiSupportIntRequestText");
             fwLabel = new sap.m.Label({text:"fw"}).addStyleClass("sapUiSupportIntRequestLabel");
             fwText = new Text().addStyleClass("sapUiSupportIntRequestText");
             appLabel = new sap.m.Label({text:"app"}).addStyleClass("sapUiSupportIntRequestLabel");
             appText = new Text().addStyleClass("sapUiSupportIntRequestText");

             simpleForm = new sap.ui.layout.form.SimpleForm({
                maxContainerCols: 2,
                minWidth: 400,
                labelMinWidth: 100,
                editable: false,
                layout: "ResponsiveGridLayout",
                labelSpanM: 5,
                emptySpanM: 0,
                columnsM: 1,
                breakpointM: 0,
                content:[
                   clientVsServerTitle,
                   progressBar,
                   new sap.ui.core.Title({text:"REQUEST DATA"}),
                   new sap.m.Label({text: "initiatorType"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   initiatorTypeText,
                   new sap.m.Label({text:"entryType"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   entryTypeText,
                   new sap.m.Label({text:"name"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   nameLink,
                   new sap.m.Label({text:"start"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   startText,
                   new sap.m.Label({text:"end"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   endText,
                   new sap.m.Label("dummyFocus", {text:"duration"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   durationText
                ]
             });
             return simpleForm;
          }
       };

       InteractionTree.prototype.attachInteractionDetailsPopover = function () {
          var simpleForm, durationText, bytesReceivedText, requestNumberText, startTimeText, endTimeText;

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
             durationText.setText(that.formatDuration(parseFloat(this.getAttribute("data-duration"))));
             bytesReceivedText.setText(this.getAttribute("data-bytesreceived"));
             requestNumberText.setText(this.getAttribute("data-requestscount"));
             startTimeText.setText(that.formatTime(parseFloat(this.getAttribute("data-start"))));
             endTimeText.setText(that.formatTime(parseFloat(this.getAttribute("data-end"))));
          }

          function createEmptyPopOver() {
             var oPopover = new Popover({
                placement: sap.m.PlacementType.Auto,
                contentWidth: "450px",
                showHeader: false,
                showArrow: true,
                verticalScrolling: true,
                horizontalScrolling: false,
                content: [
                   createPopOverContent()
                ]
             });
             return oPopover;
          }

          function createPopOverContent() {
             durationText = new Text().addStyleClass("sapUiSupportIntRequestText");
             bytesReceivedText = new Text().addStyleClass("sapUiSupportIntRequestText");
             requestNumberText = new Text().addStyleClass("sapUiSupportIntRequestText");
             startTimeText = new Text().addStyleClass("sapUiSupportIntRequestText");
             endTimeText = new Text().addStyleClass("sapUiSupportIntRequestText");

             simpleForm = new sap.ui.layout.form.SimpleForm({
                maxContainerCols: 2,
                minWidth: 400,
                labelMinWidth: 100,
                editable: false,
                layout: "ResponsiveGridLayout",
                labelSpanM: 5,
                emptySpanM: 0,
                columnsM: 1,
                breakpointM: 0,
                content:[
                   new sap.ui.core.Title({text:"INTERACTION DATA"}),
                   new sap.m.Label({text: "duration"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   durationText,
                   new sap.m.Label({text:"bytesReceived"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   bytesReceivedText,
                   new sap.m.Label({text:"requests"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   requestNumberText,
                   new sap.m.Label({text:"start"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   startTimeText,
                   new sap.m.Label({text:"end"}).addStyleClass("sapUiSupportIntRequestLabel"),
                   endTimeText
                ]
             });
             return simpleForm;
          }
       };

       InteractionTree.prototype.renderRequestPart = function (rm, start, end, colorClass) {
          if (this.actualStartTime > end || this.actualEndTime < start) {
             return;
          }

          var start = Math.max(start, this.actualStartTime);
          var end = Math.min(end, this.actualEndTime);

          var left = 100 / this.timeRange * (start - this.actualStartTime);
          var right = 100 / this.timeRange * (end - this.actualStartTime);
          var width = right - left;

          rm.write('<span style="margin-left: ' + left + '%; width: ' + width + '%" class="sapUiInteractionTimeframe sapUiInteractionTimeRequestFrame ' + colorClass + '"></span>');

       };

       InteractionTree.prototype.pad0 = function (i, w) {
          return ("000" + String(i)).slice(-w);
       };

       InteractionTree.prototype.formatGridLineDuration = function (duration) {

          var offset = this.actualStartTime - this.startTime;
          duration += offset;

          return duration > 100 ? (duration / 1000).toFixed(2) + 's' : duration.toFixed(0) + 'ms';
       };

       InteractionTree.prototype.formatDuration = function (duration) {

          return duration.toFixed(0) + ' ms';
       };

       InteractionTree.prototype.formatTime = function (now) {

          var oNow = new Date(now);

          return this.pad0(oNow.getHours(), 2) + ":" + this.pad0(oNow.getMinutes(), 2) + ":" + this.pad0(oNow.getSeconds(), 2) + "." + this.pad0(oNow.getMilliseconds(), 2);
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
