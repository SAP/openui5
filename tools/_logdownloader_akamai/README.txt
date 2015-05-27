
This app downloads the OpenUI5 log files from Akamai.


Usage e.g.:
java -jar com.sap.ui5.tools.logdownloader_akamai-1.0.0-SNAPSHOT.jar --user openui5 --password .......... --dir "C:\temp\automated_akamai"

See http://vesapui5.dhcp.wdf.sap.corp:1080/trac/sapui5/wiki/OpenUI5/LogStatistics

 1. Import into Eclipse as "Existing Maven Project"
 2. Build the project via "Run as > Maven install"
 3. Adapt the downloadLogs.bat file with your data in the target folder
 4. Run downloadLogs.bat
