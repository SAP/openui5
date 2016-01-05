/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject', 'sap/ui/core/IconPool'],
    function (jQuery, ManagedObject, IconPool) {
       'use strict';

       var InteractionTree = ManagedObject.extend("sap.ui.core.support.controls.InteractionTree", {

       });

       InteractionTree.expandIcon = 'sap-icon://navigation-right-arrow';
       InteractionTree.collapseIcon = 'sap-icon://navigation-down-arrow';

       InteractionTree.prototype.setInteractions = function (interactions, startTime, endTime) {

          this.interactions = interactions;

          this.startTime = startTime;
          this.endTime = endTime;

          if (!interactions || !interactions.length) {
             return;
          }

          this.actualStartTime = interactions[0].start;
          this.actualEndTime = interactions[interactions.length - 1].end;

          this.timeRange = this.actualEndTime - this.actualStartTime;
       };

       InteractionTree.prototype.setRange = function (start, end) {

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

             this.renderInteraction(rm, interaction);
          }

          rm.write("</ul>");

          rm.write("</div>");
       };

       InteractionTree.prototype.attachEvents = function () {
          var that = this,
              interactionTree = this.icon = jQuery('.sapUiInteractionTreeContainer .sapUiInteractionTree');

          this.gridContainer = jQuery('.sapUiInteractionTreeContainer .sapUiInteractionGridLinesContainer');
          this.gridContainerWidth = 0;

          interactionTree.bind('click', function (event) {

             var $target = jQuery(event.target);

             if ($target.hasClass('sapUiInteractionTreeIcon')) {
                that.handleIconClick($target);
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

          var interval = this.calculateInterval(width, range);

          for (var i = interval; i < range; i += interval) {

             var position = this.getPosition(width, range, i);

             if (i + interval < range) {
                gridContainer.append('<div style="left:' + (position + 2) + 'px" class="sapUiInteractionGridLineIntervalText">' + this.formatDuration(i) + '</div>');
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

       InteractionTree.prototype.handleIconClick = function ($icon) {
          var expanded = $icon.attr('expanded') == 'true';

          var $parent = $icon.parent();
          $icon.remove();

          var iconHTML = this.getIconHTML(!expanded);
          $parent.append(iconHTML);

          var $container = $parent.parent().parent().find('ul');

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

       InteractionTree.prototype.renderInteraction = function (rm, interaction) {
          var request,
              requests = interaction.requests;

          rm.write('<li>');

          this.renderInteractionDiv(rm, interaction);

          rm.write("<ul");

          rm.addClass("sapUiInteractionItem");

          // rm.addClass("sapUiHiddenUiInteractionItems");

          rm.writeClasses();
          rm.write(">");

          for (var i = 0; i < requests.length; i++) {
             request = requests[i];

             this.renderRequest(rm, interaction, request);
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

          rm.write('<div class="sapUiInteractionTreeItemLeft">');

          rm.write("<div>");

          rm.write('<span class="sapUiInteractionItemComponentText">');
          rm.writeEscaped(interaction.component);
          rm.write('</span>');


          rm.write("<br/>");


          rm.write('<span class="sapUiInteractionItemTriggerText">');
          rm.writeEscaped(interaction.trigger);
          rm.write('</span>');

          rm.write("</div>");

          this.renderIcon(rm, true);

          rm.write('</div>'); // sapUiInteractionTreeItemLeft

          var title = 'Start: ' + this.formatTime(interaction.start);
          title += '\nEnd: ' + this.formatTime(interaction.end);
          title += '\nDuration: ' + interaction.duration;

          rm.write('<div class="sapUiInteractionTreeItemRight" title="' + title + '" >');

          var left = 100 / this.timeRange * (interaction.start - this.actualStartTime);
          var right = 100 / this.timeRange * (interaction.end - this.actualStartTime);
          var width = right - left;

          rm.write('<span style="margin-left: ' + left + '%; width: ' + width + '%" class="sapUiInteractionTimeframe sapUiInteractionTimeInteractionFrame"></span>');

          rm.write('</div>');
          rm.write("</div>");
       };

       InteractionTree.prototype.renderRequest = function (rm, interaction, request) {
          rm.write('<li');

          rm.addClass("sapUiInteractionTreeItem");
          rm.addClass("sapUiInteractionRequest");

          rm.writeClasses();

          rm.write(">");

          rm.write('<div class="sapUiInteractionTreeItemLeft sapUiInteractionRequestLeft">');

          rm.write('<span class="sapUiInteractionRequestIcon"></span>');

          rm.write('<span class="sapUiInteractionItemEntryType">');
          rm.writeEscaped(request.initiatorType || request.entryType);
          rm.write('</span>');

          rm.write('</div>');

          var title = 'Name: ' + request.name;

          title += '\n\nStart: ' + this.formatTime(request.fetchStartOffset + request.startTime);
          title += '\nEnd: ' + this.formatTime(request.fetchStartOffset + request.startTime + request.duration);
          title += '\nDuration: ' + request.duration;

          //title += '\n\nConnect Start: ' + this.formatTime(request.fetchStartOffset + request.connectStart);
          //title += '\nConnect End: ' + this.formatTime(request.fetchStartOffset + request.connectEnd);
          //title += '\nConnect Duration: ' + (request.connectEnd - request.connectStart).toString();
          //
          //title += '\n\nDomainLookup Start: ' + this.formatTime(request.fetchStartOffset + request.domainLookupStart);
          //title += '\nDomainLookup End: ' + this.formatTime(request.fetchStartOffset + request.domainLookupEnd);
          //title += '\nDomainLookup Duration: ' + (request.domainLookupEnd - request.domainLookupStart).toString();
          //
          //title += '\n\nRedirect Start: ' + this.formatTime(request.fetchStartOffset + request.redirectStart);
          //title += '\nRedirect End: ' + this.formatTime(request.fetchStartOffset + request.redirectEnd);
          //title += '\nRedirect Duration: ' + (request.redirectEnd - request.redirectStart).toString();
          //
          //title += '\n\nResponse Start: ' + this.formatTime(request.fetchStartOffset + request.responseStart);
          //title += '\nResponse End: ' + this.formatTime(request.fetchStartOffset + request.responseEnd);
          //title += '\nResponse Duration: ' + (request.responseEnd - request.responseStart).toString();

          rm.write('<div class="sapUiInteractionTreeItemRight" title="' + title + '" >');

          var left = 100 / this.timeRange * (request.fetchStartOffset + request.startTime - this.actualStartTime);
          var right = 100 / this.timeRange * (request.fetchStartOffset + request.startTime + request.duration - this.actualStartTime);
          var width = right - left;

          rm.write('<span style="margin-left: ' + left + '%; width: ' + width + '%" class="sapUiInteractionTimeframe sapUiInteractionTimeRequestFrame"></span>');

          rm.write('</div>');

          rm.write("</li>");
       };

       InteractionTree.prototype.pad0 = function (i, w) {
          return ("000" + String(i)).slice(-w);
       };

       InteractionTree.prototype.formatDuration = function (duration) {
          return duration > 500 ? (duration / 1000).toFixed(2) + 's' : duration + 'ms';
       };

       InteractionTree.prototype.formatTime = function (now) {

          var oNow = new Date(now),
              iMicroSeconds = Math.floor((now - Math.floor(now)) * 1000);

          return this.pad0(oNow.getHours(), 2) + ":" + this.pad0(oNow.getMinutes(), 2) + ":" + this.pad0(oNow.getSeconds(), 2) + "." + this.pad0(oNow.getMilliseconds(), 3) + this.pad0(iMicroSeconds, 3);
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
