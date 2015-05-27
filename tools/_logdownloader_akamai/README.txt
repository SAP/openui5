
This app downloads the OpenUI5 log files from Akamai.






The rest below is outdated:

See http://vesapui5.dhcp.wdf.sap.corp:1080/trac/sapui5/attachment/wiki/OpenUI5/LogStatistics

 1. Import into Eclipse as "Existing Maven Project"
 2. Build the project via "Run as > Maven install"
 3. Adapt the downloadLogs.bat file with your data in the target folder
 4. Run downloadLogs.bat

 
 In case of problems try making sure setProxy.bat is at C:\\git\\sapui5.misc\\tools\\_logdownloader_akamai\\target\\setProxy.bat