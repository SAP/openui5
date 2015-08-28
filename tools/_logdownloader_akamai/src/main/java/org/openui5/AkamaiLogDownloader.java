package org.openui5;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.GZIPInputStream;

import net.sf.uadetector.UserAgentStringParser;
import net.sf.uadetector.service.UADetectorServiceFactory;

import org.apache.commons.io.FileUtils;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPFile;
import org.apache.commons.net.ftp.FTPHTTPClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class AkamaiLogDownloader {

	// this is the Akamai server+path to use
	private static final ApplicationConfig openui5_config = new ApplicationConfig("openui5", "saphcp.upload.akamai.com", "/341459/eu1/openui5/openui5/web");
	private static final ApplicationConfig sapui5_config = new ApplicationConfig("sapui5", "saphcp.upload.akamai.com", "/341459/eu1/services/sapui5/web");
	
	private static final ApplicationConfig[] APPLICATION_CONFIGS = { openui5_config };
	
	private static String USER = null;
	private static String PASSWORD = null;
	private static final String DEFAULT_USER = "openui5";
	
	private static final String DATA_FILE_NAME = "data";
	private static final String KNOWN_FILES_FILE_NAME = "data_knownLogFiles";

	// global consts
	private static final String BACKUP_FOLDER_NAME = "logBackup";

	// member variables
	private final File directory;
	private final File exportDir;
	private final File logFile;
	private BufferedWriter logFileOut;
	private Calendar startTime;
	private final String timestamp;
	
	
	// dev/debugging mode
	private final boolean DEV_MODE = false;
	
	// the following array can contain file names to use or folder names (to use all files inside)
	// the list of already processed log files is then ignored, but results keep adding up if the same log file is processed multiple times, so delete data_openui5.json to get real numbers again
	/*
	private final String[] debugFilesOrDirectories = {
		"C:\\temp\\akamai\\analysis1104\\openui5_333580.esw3c_S.201504110000-2400-0",
		"C:\\temp\\akamai\\analysis1104\\openui5_333580.esw3c_S.201504110000-2400-1",
		"C:\\temp\\akamai\\analysis1104\\openui5_333580.esw3c_S.201504120000-2400-0"
	};
	*/
	
	private final String[] debugFilesOrDirectories = {
		"C:\\temp\\akamai"
	};




	public static void main(String[] args) {

		String folderToScan = System.getProperty("user.dir");
		String exportDirString = null;

		// parse commandline arguments
		if (args.length > 0) {
			if (args.length % 2 != 0) {
				staticError("There are " + args.length + " arguments, but this tool needs name-value pairs.");
			}
			
			for (int i = 0; i < args.length; i += 2) {
				String paramName = args[i].trim();
				String paramValue = args[i+1].trim();
				
				if (paramName.equals("--user")) {
					USER = paramValue;
				} else if (paramName.equals("--password")) {
					PASSWORD = paramValue;
				} else if (paramName.equals("--dir")) {
					folderToScan =  paramValue.replaceAll("^\"|\"$", "").replaceAll("^'|\'$", "");
				} else if (paramName.equals("--export")) {
					exportDirString =  paramValue.replaceAll("^\"|\"$", "").replaceAll("^'|\'$", "");
				} else {
					staticError("Unknown commandline parameter '" + paramName + "'. Supported are: --user, --password, --dir, --export");
				}
			}
		} else {
			staticLog("Usage:  java -Xms128m -Xmx1024m org.openui5.AkamaiLogDownloader --user openui5 --password .....");
			staticLog("   At least password is required.");
			staticLog("   Supported parameters:");
			staticLog("   --user: the user name");
			staticLog("   --password: the password");
			staticLog("   --dir: the directory in which the log data should be stored (an archive directory will be created below); ");
			staticLog("          default is the current directory");
			staticLog("   --export: the directory where the JSON file(s) with the aggregated results should be copied to;");
			staticLog("             this file can be used as data source for apps; by default the JSON file is not copied anywhere");
			staticError("No commandline arguments received. At least user name and password need to be given!");
		}
		
		if (USER == null) {
			USER = DEFAULT_USER;
		}
		if (PASSWORD == null) {
			staticError("Password was not given, use the '--password' parameter.");
		}

		// setup working directory
		File logDir = new File(folderToScan);
		if (!logDir.exists()) {
			logDir.mkdirs();
		}
		if (!logDir.exists() || !logDir.isDirectory()) {
			staticError("Working directory " + logDir.getAbsolutePath() + " is not a directory or could not be created.");
			return;
		}
		
		// setup JSON export directory
		File exportDir = null;
		if (exportDirString != null) {
			exportDir = new File(exportDirString);
			if (exportDir.exists()) {
				if (exportDir.isDirectory()) {
					// ok
				} else {
					staticError("Export directory " + exportDirString + " is a file");
				}
			}
		}

		// start the download and parsing process...
		AkamaiLogDownloader ld = new AkamaiLogDownloader(logDir, exportDir);

		// ...for all required applications
		for (int i = 0; i < APPLICATION_CONFIGS.length; i++) {
			ld.handleLogFiles(APPLICATION_CONFIGS[i]);
		}
		
		ld.shutdown();
	}

	

	/**
	 * 
	 * @param directory the working directory (must be an existing directory where the intermediate files can be stored)
	 */
	public AkamaiLogDownloader(File directory, File exportDirectory) {
		this.directory = directory;
		this.exportDir = exportDirectory;

		Calendar now = Calendar.getInstance();
		this.startTime = now;
		this.timestamp = now.get(Calendar.YEAR) + "-" + pad(now.get(Calendar.MONTH) + 1) + "-" + pad(now.get(Calendar.DAY_OF_MONTH)) 
				+ "_" + pad(now.get(Calendar.HOUR_OF_DAY)) + "-" + pad(now.get(Calendar.MINUTE)) + "-" + pad(now.get(Calendar.SECOND));

		this.logFile = new File(directory + File.separator + "analysis_" + this.timestamp + ".log");
		try {
			this.logFileOut = new BufferedWriter(new FileWriter(this.logFile));
		} catch (IOException e) {
			error("Cannot create log file " + this.logFile.getAbsolutePath());
		}
	}
	
	/**
	 * Prepares this instance for no more being used (closes log file)
	 */
	void shutdown() {
		Calendar now = Calendar.getInstance();
		long millis = now.getTimeInMillis() - this.startTime.getTimeInMillis();
				
		log("\nDONE!   (in " + (millis/1000) + " seconds)\n");
		
		if (this.logFileOut != null) {
			try {
				this.logFileOut.close();
			} catch (IOException e) {
				// no need to spam stdout
			}
		}
	}
	
	/**
	 * Helper function to add padding to the given number (one or two digits), so it has two digits in the end.
	 * 
	 * @param number
	 * @return
	 */
	private String pad(int number) {
		return (number < 10 ? "0" : "") + number;
	}


	/**
	 * Downloads and processes the HTTP log files for the given application
	 * 
	 * @param applicationConfig
	 */
	public void handleLogFiles(ApplicationConfig applicationConfig) {
		AnonymousLogLine.initializeClass(applicationConfig.getApplication());
		List<File> rawLogFiles = new ArrayList<File>();; // these will be the downloaded+unzipped log files that need to be parsed
		final String knownFilesFileName = directory + File.separator + KNOWN_FILES_FILE_NAME + "_" + applicationConfig.getApplication() + ".json";
		final File knownFilesFile = new File(knownFilesFileName);
		JSONObject knownFiles;



		if (!DEV_MODE) { // = normal mode, accessing the Akamai FTP server (dev mode works with local files)

			log("\nStarting log download process for application '" + applicationConfig.getApplication() + "'...\n\n");

			// Step 1: get all log files from the server (would be better to interactively check which ones we need, but as I can't get the Java FTP client to work, we use the windows commandline client)
			log("Accessing Akamai FTP server to get list of available log files...");
			List<String> availableLogFileNames = this.getLogFileNames(applicationConfig.getFtpServer(), applicationConfig.getFtpPath());
			log("...available list of " + availableLogFileNames.size() + " Akamai log files downloaded (ftpUrl: " + applicationConfig.getFtpUrl() + ").\n");
	
	
			/*
			 * Now we know which log files are available for downloading. But as they reach back a couple of days, and this tool may have been executed a day (or minute) ago,
			 * many of them might already be processed, so we now want to know which log files have already been processed in the past.
			 */
	
	
			// STEP 2: find out which log files we have already processed in the past
			log("Loading local list of known log files (" + knownFilesFileName + ")...");
			knownFiles = this.loadJsonFromFile(knownFilesFile);
			List<String> knownLogFileNames = getKnownLogFilesFromJson(knownFiles);
			log("...list of " + knownLogFileNames.size() + " known log files loaded.\n");
	
	
			// Step 3: find out which log files are new and need to be downloaded
			log("Checking which log files are new and need to be downloaded...");
			List<String> neededLogFileNames = calcNeededLogFiles(availableLogFileNames, knownLogFileNames);
			log("...found " + neededLogFileNames.size() + " log files which are not known yet.\n");
	
	
			/*
			 * Now we also know which files have already been processed in the past, so they do not need to be downloaded and processed again.
			 */
	
	
			// Step 4: download all new log files
			log("Downloading log files from Akamai FTP server...");
			List<File> downloadedFiles = downloadLogFiles(applicationConfig.getFtpServer(), applicationConfig.getFtpPath(), neededLogFileNames);
			log("..." + downloadedFiles.size() + " log files downloaded.\n");
			
			
			// Step 5: unzip the downloaded files (and delete the compressed ones)
			log("Unzipping log files...");
			rawLogFiles = unzipLogFiles(downloadedFiles);
			log("..." + rawLogFiles.size() + " log files unzipped.\n");

		} // end of normal mode (not DEV_MODE)



		// DEV_MODE
		else { // only in DEV_MODE! Avoid any online stuff, work with local files.
			warn("Working in DEV_MODE!\n\n");
			knownFiles = new JSONObject("{data:[]}");
			for (int i = 0; i < debugFilesOrDirectories.length; i++) { // the array can contain file names to use or folder names (to use all files inside)
				File f = new File(debugFilesOrDirectories[i]);
				if (f.isFile()) {
					rawLogFiles.add(f);
				} else { // directory
					File[] listOfFiles = f.listFiles();

					for (int j = 0; j < listOfFiles.length; j++) {
						if (listOfFiles[j].isFile()) {
							rawLogFiles.add(listOfFiles[j]);
						}
					}
				}
			}
		}
		// end of DEV_MODE



		/*
		 * At this time, rawLogFiles is the list of all log files which are currently stored at Akamai and have been downloaded.
		 * The files have names like "openui5_333580.esw3c_S.201505020000-2400-0"
		 * Even though each file has a date in its name, there will be log data from one or two (or more) previous days! This means the statistics for
		 * any given day are not complete until a couple of days have passed.
		 * There might also be multiple files stored at each day if the log size exceeds a certain threshold. They appear to be stored at the same time, though.
		 */

		// Step 4: anonymize the log files
		log("Anonymizing log files...");
		List<FileWithDate> anonymizedLogFiles = this.anonymizeLogFiles(rawLogFiles, applicationConfig.getApplication());
		if (anonymizedLogFiles.size() != rawLogFiles.size()) {
			error(rawLogFiles.size() + " log file names known, but " + anonymizedLogFiles.size() + "files anonymized.");
		} else {
			log("..." + anonymizedLogFiles.size() + " log files anonymized.\n");
		}


		/*
		 * Now we have files like "http_log_2015-05-02.txt" in our working directory, which have all IP addresses replaced by a counter. 
		 * They are much smaller in size than the original log files because they only contain the relevant entries.
		 * When there were multiple files for one day, the additional anonymized files have underscores appended to the file name.
		 */


		// Step 5: extract data from log files
		log("Parsing log files...");
		List<LogFileData> listOfNewDataSets = this.parseLogs(anonymizedLogFiles, applicationConfig);
		log("...log files parsed, result are " + listOfNewDataSets.size() + " datasets.\n");


		/* 
		 * Now we have a list of dates with the corresponding statistics. This list contains ALL data from the currently handled log files.
		 * Future log files may add more data to some of the days that are already covered here.
		 */


		// Step 6: backup the anonymized log files
		log("Backing up anonymized log files...");
		this.backupAnonymizedFiles(anonymizedLogFiles, applicationConfig);
		log("...log files backed up.\n");


		// Step 7: load previous data from file
		File dataFile = new File(directory + File.separator + DATA_FILE_NAME + "_" + applicationConfig.getApplication() + ".json");
		log("Loading known data sets from " + dataFile.getAbsolutePath() + "...");
		List<LogFileData> listOfOldDataSets = this.loadFileLogDataFromJson(dataFile);
		log("..." + listOfOldDataSets.size() + " data sets loaded from data file.\n");


		/*
		 * Now we have ALL old data in the "allData" object and all new data in the "listOfDataSets".
		 * It's time to merge them. Important: we cannot just append the new data because some of the new data may be late data for days that are already
		 * contained in the old data. So we need a real merge.
		 */


		// Step 8: merge new data
		log("Merging " + listOfNewDataSets.size() + " new data sets to " + listOfOldDataSets.size() + " known data sets...");
		listOfOldDataSets.addAll(listOfNewDataSets);
		List<LogFileData> mergedCurrentDataSets = mergeDataSets(listOfOldDataSets);
		log("...new data merged, new count of data sets is: " + mergedCurrentDataSets.size() + " (may be lower than the sum of above).\n");


		/*
		 * mergedCurrentDataSets is now the complete merged data as available right now. Ready to be saved.
		 */


		// Step 9: save data file
		File jsonDataFile = new File(directory + File.separator + DATA_FILE_NAME + "_" + applicationConfig.getApplication() + ".json");
		log("Saving data file " + jsonDataFile + "...");
		JSONObject allData = convertToJson(mergedCurrentDataSets);
		this.saveJsonFile(jsonDataFile, allData);
		log("...data file saved.\n");


		// Step 10: save file that lists the known log file names
		knownFiles = addknownFilesToJson(knownFiles, rawLogFiles);
		log("Saving list of known log files to " + knownFilesFile + "...");
		this.saveJsonFile(knownFilesFile, knownFiles);
		log("...list of known log files saved.\n");

		
		/*
		 * Now everything important is done: the data is saved as well as the list of files that have already been handled.
		 * The following steps are for easier consumption of the data in Excel and in web apps. 
		 */

		// Step 11: store Excel/CSV data
		File csvFile = new File(directory + File.separator + DATA_FILE_NAME + "_" + applicationConfig.getApplication() + ".csv");
		log("Exporting CSV file " + csvFile + "...");
		this.exportAsCSV(csvFile, allData);
		log("...CSV file exported.\n");


		// Step 12: optionally save a JSON file containing all data, e.g. for consumption in a web app
		this.exportJsonToWeb(jsonDataFile);

	}









	/**
	 * Uncompresses and deletes the given list of gzip-compressed files (they need to end with ".gz").
	 * Returns the list of uncompressed files.
	 * 
	 * @param downloadedFiles
	 * @return
	 */
	private List<File> unzipLogFiles(List<File> gzFiles) {
		List<File> unzippedFiles = new ArrayList<File>();
		byte[] buffer = new byte[1024];
		
		try {
			for (File gzFile : gzFiles) {
				int indexOfGz = gzFile.getName().lastIndexOf(".gz");
				if (indexOfGz < 8) {
					throw new RuntimeException("Unexpected log file name (not compressed?): " + gzFile.getName());
				}
				
				String unzippedFileName = gzFile.getName().substring(0, indexOfGz);
				File unzippedFile = new File(directory.getAbsolutePath() + File.separator + unzippedFileName);
				unzippedFile.deleteOnExit();
				
				FileInputStream in = new FileInputStream(gzFile);
				GZIPInputStream gzInputStream = new GZIPInputStream(in);
				FileOutputStream out = new FileOutputStream(unzippedFile);
				
				int bytes_read;
				while ((bytes_read = gzInputStream.read(buffer)) > 0) {
					out.write(buffer, 0, bytes_read);
				}
				gzInputStream.close();
				out.close();
				gzFile.delete();
				
				unzippedFiles.add(unzippedFile);
			}
			
		} catch (IOException e) {
			// probably no space on disk... the uncompressed log files can be quite large, more than one gigabyte
			
			// clean up
			for (File file : gzFiles) {
				file.delete();
			}
			for (File file : unzippedFiles) {
				file.delete();
			}
			
			throw new RuntimeException(e);
		}
		
		return unzippedFiles;
	}


	/**
	 * Returns a list of those log file names that are available, but not already known.
	 * (Basically just checks which strings from the first list are not in the second list.)
	 * 
	 * @param availableLogFileNames
	 * @param knownLogFileNames
	 * @return
	 */
	private List<String> calcNeededLogFiles(List<String> availableLogFileNames, List<String> knownLogFileNames) {
		List<String> neededFileNames = new ArrayList<String>(availableLogFileNames);
		neededFileNames.removeAll(knownLogFileNames);
		return neededFileNames;
	}



	/**
	 * From the given JSON object, which has an array in the "data" property at its root, this function returns all array entries.
	 * 
	 * @param knownFiles
	 * @return
	 */
	private List<String> getKnownLogFilesFromJson(JSONObject knownFiles) {
		JSONArray knownArray = knownFiles.getJSONArray("data");
		List<String> fileNames = new ArrayList<String>();

		for (int i = 0; i < knownArray.length(); i++) {
			fileNames.add(knownArray.getString(i));
		}
		
		return fileNames;
	}



	/**
	 * Loads log data from the given file (JSON, which has an array in the "data" property at its root - the array entries are the log lines per day)
	 * 
	 * @param file
	 * @return
	 */
	private List<LogFileData> loadFileLogDataFromJson(File file) {
		List<LogFileData> loadedLogFileData = new ArrayList<LogFileData>();
		
		JSONObject json = this.loadJsonFromFile(file);
		JSONArray dataArray = json.getJSONArray("data");

		for (int i = 0; i < dataArray.length(); i++) {
			JSONObject obj = dataArray.getJSONObject(i);
			LogFileData data = LogFileData.fromJson(obj);
			loadedLogFileData.add(data);
		}
		
		return loadedLogFileData;
	}



	/**
	 * Returns the list of available log file names from the server
	 * 
	 * @param ftpServer
	 * @param ftpPath
	 * @return
	 */
	private List<String> getLogFileNames(String ftpServer, String ftpPath) {
		List<String> result = new ArrayList<String>();

		FTPClient ftpClient = new FTPHTTPClient("proxy", 8080); // need to connect to the SAP proxy, using the Akamai credentials (and Akamai server appended to username)
		ftpClient = new FTPClient();
				
		try {
			ftpClient.connect("proxy", 21);
			ftpClient.login(USER + "@" + ftpServer, PASSWORD);
			ftpClient.pasv();
			ftpClient.enterLocalPassiveMode();
			
			// lists files and directories in the current working directory
			FTPFile[] files = ftpClient.listFiles(ftpPath);

			for (FTPFile file : files) {
				result.add(file.getName());
			}
			
			ftpClient.quit();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}

		return result;
	}


	/**
	 * Downloads the files with the given names from the given FTP location. Connects through proxy:8080.
	 * 
	 * @param ftpServer
	 * @param ftpPath
	 * @param fileNames
	 * @return
	 */
	private List<File> downloadLogFiles(String ftpServer, String ftpPath, List<String> fileNames) {
		List<File> downloadedFiles = new ArrayList<File>();

		FTPClient ftpClient = new FTPHTTPClient("proxy", 8080); // need to connect to the SAP proxy, using the Akamai credentials (and Akamai server appended to username)
		ftpClient = new FTPClient();
				
		try {
			ftpClient.connect("proxy", 21);
			ftpClient.login(USER + "@" + ftpServer, PASSWORD);
			ftpClient.pasv();
			ftpClient.enterLocalPassiveMode();
			
			ftpClient.changeWorkingDirectory(ftpPath);
			
			for (String fileName : fileNames) {
				File localFile = new File(directory + File.separator + fileName);
				
				log("   ..." + localFile.getAbsolutePath() + "...");
				
				OutputStream output = new FileOutputStream(localFile);
				// get the file from the remote system
				ftpClient.retrieveFile(fileName, output);
				output.close();
				
				localFile.deleteOnExit();
				downloadedFiles.add(localFile);
			}
			
			ftpClient.quit();
			
		} catch (IOException e) {
			throw new RuntimeException(e);
		}

		return downloadedFiles;
	}


	/**
	 * Anonymizes the given log files by removing the IP addresses (substituting them with a unique number per IP).
	 * Deletes the original log files and returns the new anonymized log files along with the corresponding date (as yyyy-mm-dd string).
	 * These new log files only contain the lines that are considered relevant to our statistics! (downloads or accesses to the most relevant HTML pages or
	 * the 1x1 pixel gif, which is used to track GitHub page accesses)
	 * 
	 * @param rawLogFiles
	 * @param applicationName
	 * @private
	 * @return
	 */
	private List<FileWithDate> anonymizeLogFiles(List<File> rawLogFiles, String applicationName) {
		List<FileWithDate> anonymizedLogFiles = new ArrayList<FileWithDate>();
		Set<String> usedFileNames = new HashSet<String>();

		final Pattern FILE_DATE_PATTERN = Pattern.compile(".*S\\.(\\d\\d\\d\\d)(\\d\\d)(\\d\\d)0000-.*"); // to get the date from the log file name

		try {
			for (int i = 0; i < rawLogFiles.size(); i++) {
				File file = rawLogFiles.get(i);

				log(" - " + file.getName());
				List<String> logLines = readAndAnonymizeFile(file, applicationName);

				String dateText = file.getName();
				Matcher m = FILE_DATE_PATTERN.matcher(file.getName());
				if (m.matches()) {
					dateText = m.group(1) + "-" + m.group(2) + "-" + m.group(3);
				} else {
					error("date could not be parsed from file name, using entire file name: " + file.getName());
				}

				String fileName = directory + File.separator + "http_log_" + dateText;
				while (usedFileNames.contains(fileName)) { // there can be multiple log files per day (different processes)
					fileName = fileName + "_";
				}
				usedFileNames.add(fileName);
				fileName += ".txt";

				File outFile = new File(fileName);

				// delete file if it already exists
				if (outFile.exists()) {
					outFile.delete();
				}

				BufferedWriter out = new BufferedWriter(new FileWriter(outFile));

				for (String line : logLines) {
					out.write(line + "\n");
				}
				out.close();

				anonymizedLogFiles.add(new FileWithDate(dateText, outFile));
				outFile.deleteOnExit();
			}

		} catch (IOException e) {
			throw new RuntimeException(e);
		}

		return anonymizedLogFiles;
	}



	/**
	 * Reads a given file and returns the parsed and anonymized logLines, but ONLY for the relevant log entries
	 * 
	 * @param logFile
	 * @private
	 * @return
	 */
	private List<String> readAndAnonymizeFile(File logFile, String applicationName) {
		List<String> logLines = new ArrayList<String>(65536);
		Map<String,Integer> ipAddressAnonymizer = new HashMap<String,Integer>(1024);
		
		// these strings mark relevant log entries
		final String ANY_DOWNLOAD_FRAGMENT_STRING_EU = "GET	/" + applicationName + ".eu1.hana.ondemand.com/downloads/" + applicationName + "-";    // GET	/openui5.eu1.hana.ondemand.com/downloads/openui5-runtime-1.26.7.zip
		final String ANY_DOWNLOAD_FRAGMENT_STRING_US = "GET	/" + applicationName + ".us1.hana.ondemand.com/downloads/" + applicationName + "-";
		final String ANY_DOWNLOAD_FRAGMENT_STRING_AP = "GET	/" + applicationName + ".ap1.hana.ondemand.com/downloads/" + applicationName + "-";
		final String ANY_GITHUB_PAGE_FRAGMENT_STRING_EU = "GET	/" + applicationName + ".eu1.hana.ondemand.com/resources/sap/ui/core/themes/base/img/1x1.gif?page="; // GET	/openui5.eu1.hana.ondemand.com/resources/sap/ui/core/themes/base/img/1x1.gif
		final String ANY_GITHUB_PAGE_FRAGMENT_STRING_US = "GET	/" + applicationName + ".us1.hana.ondemand.com/resources/sap/ui/core/themes/base/img/1x1.gif?page=";
		final String ANY_GITHUB_PAGE_FRAGMENT_STRING_AP = "GET	/" + applicationName + ".ap1.hana.ondemand.com/resources/sap/ui/core/themes/base/img/1x1.gif?page=";
		final String DEMOKIT_PAGE_FRAGMENT_STRING_EU = "GET	/" + applicationName + ".eu1.hana.ondemand.com/	";                  // GET	/openui5.eu1.hana.ondemand.com/	
		final String DEMOKIT_PAGE_FRAGMENT_STRING_US = "GET	/" + applicationName + ".us1.hana.ondemand.com/	";
		final String DEMOKIT_PAGE_FRAGMENT_STRING_AP = "GET	/" + applicationName + ".ap1.hana.ondemand.com/	";
		final String DEMOKIT_ROBOTS_STRING_EU = "GET	/" + applicationName + ".eu1.hana.ondemand.com/robots.txt	"; // robots requests are interesting, so we can filter out bots later
		final String DEMOKIT_ROBOTS_STRING_US = "GET	/" + applicationName + ".us1.hana.ondemand.com/robots.txt	";
		final String DEMOKIT_ROBOTS_STRING_AP = "GET	/" + applicationName + ".ap1.hana.ondemand.com/robots.txt	";
		final String CORE_STRING_EU = "GET	/" + applicationName + ".eu1.hana.ondemand.com/resources/sap-ui-core.js	";
		final String CORE_STRING_US = "GET	/" + applicationName + ".us1.hana.ondemand.com/resources/sap-ui-core.js	";
		final String CORE_STRING_AP = "GET	/" + applicationName + ".ap1.hana.ondemand.com/resources/sap-ui-core.js	";
		final Pattern VERSIONED_CORE_PATTERN = Pattern.compile(".*GET\\t/" + applicationName + "\\....\\.hana\\.ondemand\\.com/\\d+\\.\\d+\\.\\d+/resources/sap-ui-core\\.js.*");

		try {
			BufferedReader br = new BufferedReader(new FileReader(logFile));
			String line;
			while ((line = br.readLine()) != null) {

				if (line.contains(ANY_DOWNLOAD_FRAGMENT_STRING_EU)		// TODO: performance: nine "contains" or three regex?
						|| line.contains(ANY_DOWNLOAD_FRAGMENT_STRING_US)
						|| line.contains(ANY_DOWNLOAD_FRAGMENT_STRING_AP)
						|| line.contains(ANY_GITHUB_PAGE_FRAGMENT_STRING_EU)
						|| line.contains(ANY_GITHUB_PAGE_FRAGMENT_STRING_US)
						|| line.contains(ANY_GITHUB_PAGE_FRAGMENT_STRING_AP)
						|| line.contains(DEMOKIT_PAGE_FRAGMENT_STRING_EU)
						|| line.contains(DEMOKIT_PAGE_FRAGMENT_STRING_US)
						|| line.contains(DEMOKIT_PAGE_FRAGMENT_STRING_AP)
						|| line.contains(DEMOKIT_ROBOTS_STRING_EU)
						|| line.contains(DEMOKIT_ROBOTS_STRING_US)
						|| line.contains(DEMOKIT_ROBOTS_STRING_AP)
						|| line.contains(CORE_STRING_EU)
						|| line.contains(CORE_STRING_US)
						|| line.contains(CORE_STRING_AP)
						|| VERSIONED_CORE_PATTERN.matcher(line).matches()) { // only handle interesting lines

					String[] parts = line.split("\\t");
					String ip = parts[2];

					// now replace the IP addresses by a number, starting from 1
					Integer anonIp = ipAddressAnonymizer.get(ip);

					if (anonIp == null) { // new IP address string, anonymize it
						Integer previous = ipAddressAnonymizer.get("latest");
						int prevInt;
						if (previous == null) {
							prevInt = 0;
						} else {
							prevInt = previous.intValue();
						}
						int current = prevInt + 1;
						ipAddressAnonymizer.put(ip, new Integer(current));
						ipAddressAnonymizer.put("latest", new Integer(current));
						anonIp = current;
					}

					line = line.replace(ip, String.valueOf(anonIp));

					logLines.add(line); // remember this (modified) line to write it to the anonymized log
				}
			}
			br.close();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}

		return logLines;
	}


	/**
	 * Parses the given anonymized log files and returns the relevant contained data.
	 * The current day is ignored because the log is still growing.
	 * Multiple log files containing data for the same day are handled properly, the result list data is aggregated, so each day is only once in the result.
	 * 
	 * @param anonymizedLogFiles
	 * @param config the application config
	 * @private
	 * @return a sorted list of data sets where each day is only present once
	 */
	private List<LogFileData> parseLogs(List<FileWithDate> anonymizedLogFiles, ApplicationConfig config) {
		List<LogFileData> dataSets = new ArrayList<LogFileData>();

		Calendar today = Calendar.getInstance();
		Calendar fileDate = Calendar.getInstance();
		Map<String,Integer> uaMap = new HashMap<String, Integer>();
		Map<String,Integer> referrerMap = new HashMap<String, Integer>();
		Map<String,Integer> coreReferrerMap = new HashMap<String, Integer>();

		try {
			for (int i = 0; i < anonymizedLogFiles.size(); i++) {
				log(" - " + anonymizedLogFiles.get(i).file);

				List<AnonymousLogLine> logLines = readLogFile(anonymizedLogFiles.get(i).file);

				if (logLines.size() > 0) {
					Collection<LogFileData> datas = handleLogLinesFromFile(logLines, uaMap, referrerMap, coreReferrerMap); // one object per day contained in the log file

					for (LogFileData data : datas) {
						fileDate.setTime(data.getDate());
						if (!sameDay(fileDate, today)) { // ignore today's log because it is incomplete
							dataSets.add(data);
						}
					}
					
				} else {
					// TODO: nothing relevant in the log. Do anything?
				}
			}
			
			// write the UA file
			List<String> sorted = flattenAndSortMap(uaMap, "");
			File uaFile = new File(directory + File.separator + "analysis_" + this.timestamp + "_user-agents.csv");
			BufferedWriter out = new BufferedWriter(new FileWriter(uaFile)); 
			for (String text : sorted) {
				out.write(text);
			}
			out.close();
			
			// write the referrers file
			sorted = flattenAndSortMap(referrerMap, "\"");
			File refFile = new File(directory + File.separator + "analysis_" + this.timestamp + "_referrers.csv");
			out = new BufferedWriter(new FileWriter(refFile)); 
			for (String text : sorted) {
				out.write(text);
			}
			out.close();
			
			// write the referrers file for the requests to the UI5 core
			sorted = flattenAndSortMap(coreReferrerMap, "\"");
			refFile = new File(directory + File.separator + "analysis_" + this.timestamp + "_core_referrers.csv");
			out = new BufferedWriter(new FileWriter(refFile)); 
			for (String text : sorted) {
				out.write(text);
			}
			out.close();
			
		} catch (IOException e) {
			throw new RuntimeException(e);
		}


		// there can be multiple log files per day, aggregate numbers per day now...
		List<LogFileData> aggregatedDataSets = mergeDataSets(dataSets);

		// sort the data sets ascending by day
		Collections.sort(aggregatedDataSets, new Comparator<LogFileData>() { // sort lines by date
			@Override
			public int compare(LogFileData d1, LogFileData d2)
			{
				return d1.getYYYYMMDD_WithDashes().compareTo(d2.getYYYYMMDD_WithDashes());
			}
		});
		
		log("...Results from all processed log files:");
		for (LogFileData data : aggregatedDataSets) {
			log("   - " + data);
		}
		
		return aggregatedDataSets;
	}


	/**
	 * Sorts the given map by the value and returns a new sorted map containing the result of this sorting.
	 * 
	 * @param map
	 * @param quotes a string that is added before and after the map values
	 * @return
	 */
	private List<String> flattenAndSortMap(final Map<String, Integer> map, String quotes) {
		List<String> result = new ArrayList<String>();
		
		for (String key : map.keySet()) {
			result.add(map.get(key) + ";" + quotes + key + quotes + "\n");
		}
		
		Collections.sort(result, new Comparator<String>() { // sort lines by date
			@Override
			public int compare(String s1, String s2)
			{
				int i1 = Integer.parseInt(s1.substring(0, s1.indexOf(";")));
				int i2 = Integer.parseInt(s2.substring(0, s2.indexOf(";")));
				return i2-i1;
			}
		});

		return result;
	}



	/**
	 * Takes a list of datasets that may contain the same day several times, and returns an aggregated list that contains each day only once,
	 * with the numbers added up. 
	 * 
	 * @param dataSets
	 * @private
	 * @return
	 */
	private static List<LogFileData> mergeDataSets(List<LogFileData> dataSets) {
		List<LogFileData> aggregatedDataSets = new ArrayList<LogFileData>();
		Set<Integer> handledIndices = new HashSet<Integer>();

		for (int i = 0; i < dataSets.size(); i++) {
			if (!handledIndices.contains(i)) {
				LogFileData currentDataSet = dataSets.get(i);
				String currentDateString = currentDataSet.getYYYYMMDD_WithDashes();
	
				for (int j = i+1; j < dataSets.size(); j++) {
					if (!handledIndices.contains(j)) { // not really required (other set cannot be a hit for two days)
						LogFileData otherDataSet = dataSets.get(j);
						String otherDateString = otherDataSet.getYYYYMMDD_WithDashes();
						if (otherDateString.equals(currentDateString)) { // the other data set is from the same day
							// merge the data sets: add the other one to the current one
							currentDataSet.addData(otherDataSet);
							handledIndices.add(j); // mark the other data set as already used, so we don't use the other one as current set
						}
					}
				}
				handledIndices.add(i); // not really required (we count up)
				aggregatedDataSets.add(currentDataSet);
			}
		}
		return aggregatedDataSets;
	}


	/**
	 * Returns whether the given dates are on the same day
	 * 
	 * @param c1
	 * @param c2
	 * @private
	 * @return
	 */
	private boolean sameDay(Calendar c1, Calendar c2) {
		return (c1.get(Calendar.YEAR) == c2.get(Calendar.YEAR)
				&& 
				c1.get(Calendar.DAY_OF_YEAR) == c2.get(Calendar.DAY_OF_YEAR));
	}



	/**
	 * Reads a given file and returns the parsed logLines for the relevant log entries
	 * 
	 * @param logFile
	 * @private
	 * @return
	 */
	private List<AnonymousLogLine> readLogFile(File logFile) {
		List<AnonymousLogLine> logLines = new ArrayList<AnonymousLogLine>(4096);

		try {
			BufferedReader br = new BufferedReader(new FileReader(logFile));
			String line;
			while ((line = br.readLine()) != null) {
				AnonymousLogLine maybeLogLine = AnonymousLogLine.createFromLine(line);
				if (maybeLogLine != null) {
					logLines.add(maybeLogLine);
				}
			}
			br.close();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}

		return logLines;
	}


	/**
	 * Takes parsed log lines, does some filtering on the HTTP codes and reports the aggregated results per day.
	 * Ignores robots/crawlers.
	 * This is also where unique visitors/hits are detected and multiple requests to the same file are discarded in most cases.
	 * Also fills the user-agent strings and interesting referrers into the given maps (not per-day)
	 * 
	 * @param logLines
	 * @param uaStrings
	 * @param referrers
	 * @throws IOException
	 * @private
	 */
	private Collection<LogFileData> handleLogLinesFromFile(List<AnonymousLogLine> logLines, Map<String, Integer> uaStrings, Map<String, Integer> referrers, 
			Map<String, Integer> coreReferrers) throws IOException {
		Map<String,LogFileData> fileDataMap = new HashMap<String, LogFileData>(4);
		Set<String> known206Ips = new HashSet<String>(512);
		Set<String> knownIpUrlCombinations = new HashSet<String>(4096); // to avoid counting twice
		
		int ipCounter = 0;

		UserAgentStringParser parser = UADetectorServiceFactory.getResourceModuleParser();
		boolean handleThis206Line; // whether a line with HTTP 206 status code should be counted; those originate from download managers which load multiple chunks in parallel, so there are several requests but only one actual download
		for (AnonymousLogLine logLine : logLines) {
			handleThis206Line = false;

			// this is a kind of fingerprint combining IP address and user-agent (to detect distinct users, even behind a proxy), combined with a unique resource
			// we don't want to count the same person twice, but we do want to count different users within a company network (we won't get all because they might have the same
			// user-agent), but we might also count a person twice who downloads UI5 with different devices. So it cannot be 100% accurate, but the best guess...
			String ipUrlCombination = logLine.getIpCounter() + "-" + logLine.getUrl() + "-" + logLine.getUserAgent();
			
			if (logLine.getCode() == 206) {
				if (known206Ips.contains(ipUrlCombination)) {
					//System.out.println("Discarding line of type " + logLine.getType()); 
					// rule of thumb: if same file was already downloaded the same day, this 206 request is a different chunk of the same download
				} else {
					handleThis206Line = true;
					known206Ips.add(ipUrlCombination); // handled once is enough
				}
			} else if (logLine.getCode() == 200) {
				if (!known206Ips.contains(ipUrlCombination)) {
					// this IP-URL combination will be handled below, so make sure it is not handled again
					known206Ips.add(ipUrlCombination);
				}
			}

			// keep track of how many unique IPs have been encountered - FIXME: this does not currently work
			ipCounter = Math.max(Integer.parseInt(logLine.getIpCounter()), ipCounter);


			if (logLine.getCode() == 200 || (logLine.getCode() == 206 && handleThis206Line)) {
				
				// bot / user-agent handling: ignore!
				if (logLine.isBotLine(parser)) {
					continue; // do not count bots/spiders/crawlers
				}
				
				// now make sure that every URL will be counted only once per IP address (even though this filters out many users behind the same proxy)
				// exception: requests to sap-ui-core.js: we want to count every app startup! (well, duplicate startups are usually handled by)
				if (knownIpUrlCombinations.contains(ipUrlCombination) && !handleThis206Line) {
					continue;
				} else {
					knownIpUrlCombinations.add(ipUrlCombination);
				}
				
				
				// save interesting referrers
				Map<String, Integer> referrerMapToUse = (logLine.getType().equals(Resource.CORE) || logLine.getType().equals(Resource.VERSIONED_CORE)) ? coreReferrers : referrers;
				String ref = logLine.getReferrerIfInteresting();
				if (ref != null) {
					Integer refCount = referrerMapToUse.get(ref);
					if (refCount == null) {
						refCount = 0;
					}
					referrerMapToUse.put(ref, ++refCount);
				}
				
				// save user-agents of non-bots, 1) for statistics/curiosity and 2) to detect unknown bots
				String ua = logLine.getCsvUserAgent();
				Integer uaCount = uaStrings.get(ua);
				if (uaCount == null) {
					uaCount = 0;
				}
				uaStrings.put(ua, ++uaCount);
				
				
				Date date = logLine.getDate();
				Calendar c1 = Calendar.getInstance();
				c1.setTime(date);
				
				// This code looks like it sums up while looping, but actually  it is only executed once... so only one of these variables will be "1", then they will be discarded again.
				
				int runtimeDownloads = 0;
				int mobileDownloads = 0;
				int sdkDownloads = 0;
				int githubHits = 0;
				int blogHits = 0;
				int referencesHits = 0;
				int featuresHits = 0;
				int getstartedHits = 0;
				int demokitHits = 0;
				int coreHits = 0;
				int versionedCoreHits = 0;
				Map<String,Integer> coreVersions = new TreeMap<String,Integer>(new VersionStringComparator());
				
				switch (logLine.getType()) {
				case GITHUB_PAGE:
					githubHits++;
					break;
				case BLOG_PAGE:
					blogHits++;
					break;
				case REFERENCES_PAGE:
					referencesHits++;
					break;
				case FEATURES_PAGE:
					featuresHits++;
					break;
				case GETSTARTED_PAGE:
					getstartedHits++;
					break;
				case DEMOKIT_PAGE:
					demokitHits++;
					break;
				case CORE:
					coreHits++;
					break;
				case RUNTIME_DOWNLOAD:
					runtimeDownloads++;
					break;
				case MOBILE_DOWNLOAD:
					mobileDownloads++;
					break;
				case SDK_DOWNLOAD:
					sdkDownloads++;
					break;
				case VERSIONED_CORE:
					versionedCoreHits++;
					String coreVersion = logLine.getVersionedCoreVersion();
					if (coreVersion != null && coreVersion.length() > 0) {
						if (coreVersions.get(coreVersion) != null) {
							throw new RuntimeException("There is already something in the core versions map!");
						}
						coreVersions.put(coreVersion, 1);
					}
					break;
				default:
					System.out.println("ERROR: unknown case");
				}
				
				// merge to previous data for same day or create new data in case of new day
				String thisDay = ""+c1.get(Calendar.YEAR) + (c1.get(Calendar.MONTH)+1) + c1.get(Calendar.DAY_OF_MONTH);
				LogFileData existingLogLine = fileDataMap.get(thisDay);
				LogFileData newData = new LogFileData(date, runtimeDownloads, mobileDownloads, sdkDownloads, githubHits, blogHits, referencesHits, featuresHits, getstartedHits, demokitHits, coreHits, versionedCoreHits, -1, coreVersions); // FIXME: IP counting is much more difficult: need to check per day which IPs have been seen and also decide which IPs we are interested in: only the root pages or ALL?
				if (existingLogLine != null) {
					existingLogLine.addData(newData);
				} else {
					fileDataMap.put(thisDay, newData);
				}

			} else {
				if (logLine.getCode() != 206 && logLine.getCode() != 302 && logLine.getCode() != 0) {
					warn("logline with status code " + logLine.getCode() + " url: " + logLine.getUrl());
				}
			}
		}

		return fileDataMap.values();
	}


	/**
	 * Moves the given files to a backup directory below the working directoy
	 * 
	 * @param anonymizedLogFiles
	 * @param config the app config
	 * @private
	 */
	private void backupAnonymizedFiles(List<FileWithDate> anonymizedLogFiles, ApplicationConfig config) {
		File backupDir = new File(directory + File.separator + BACKUP_FOLDER_NAME + "_" + config.getApplication());
		if (!backupDir.exists()) {
			backupDir.mkdir();
		}
		log("   ... to " + backupDir.getAbsolutePath() + "...");

		for (int i = 0; i < anonymizedLogFiles.size(); i++) {
			File logFile = anonymizedLogFiles.get(i).file;
			File targetFile = new File(backupDir + File.separator + logFile.getName());
			if (!targetFile.exists()) {
				logFile.renameTo(targetFile);
			}
		}
	}


	/**
	 * Loads the given file into a JSON object after doing some sanity checks; creates an empty data file if the given file does not exist.
	 * The JSON object has a "data" property at its root, which points to an array.
	 * 
	 * @param file
	 * @private
	 * @return
	 */
	private JSONObject loadJsonFromFile(File file) {
		JSONObject json;

		if (file.isDirectory()) {
			error("Data file " + file + " is a directory.");
		}

		if (!file.exists()) {
			warn("Data file " + file + " does not exist.");
			json = new JSONObject("{data:[]}");

		} else { // file exists
			json = readJsonFile(file);
		}

		return json;
	}

	/**
	 * Loads the given data file into a JSON object. The file must exist.
	 * 
	 * @param file
	 * @private
	 * @return
	 */
	private JSONObject readJsonFile(File file) {
		String data = "";

		try {
			BufferedReader br = new BufferedReader(new FileReader(file));
			String line;
			while ((line = br.readLine()) != null) {
				data += line;
			}
			br.close();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}

		JSONObject json = new JSONObject(data);
		return json;
	}


	/**
	 * Saves the given JSON object to the given file. If the file already exist, the existing one is renamed to "Copy_of_...". Any previous backup copy is overwritten.
	 * 
	 * @param file
	 * @param json
	 * @private
	 */
	private void saveJsonFile(File file, JSONObject json) {
		String jsonString = json.toString(2);
		PrintWriter out = null;

		try {
			if (file.exists()) {
				File backupFile = new File(file.getAbsolutePath() + File.separator + "Copy_of_" + file.getName());
				if (backupFile.exists()) {
					backupFile.delete();
				}
				file.renameTo(backupFile);
			}
			file.createNewFile();

			out = new PrintWriter(file);
			out.println(jsonString);

		} catch (IOException e) {
			throw new RuntimeException(e);

		} finally {
			if (out != null) {
				out.close( );
			}
		}
	}


	/**
	 * Converts the given data sets to a JSON object. Assumes dataSets to have no duplicate days.
	 * 
	 * @param dataSets
	 * @private
	 * @return
	 */
	private JSONObject convertToJson(List<LogFileData> dataSets) {
		JSONObject json = new JSONObject("{data:[]}");
		JSONArray dataArray = json.getJSONArray("data");

		for (int i = 0; i < dataSets.size(); i++) {
			LogFileData data = dataSets.get(i);

			JSONObject o = new JSONObject();
			//			o.put("year", data.year);
			//			o.put("month", data.month);
			//			o.put("day", data.day);
			o.put("date", data.getYYYYMMDD_WithDashes());
			o.put("csvDate", data.getDDMMYYYY_WithDots()); // csv date understood by Excel
			o.put("runtime", data.runtimeDownloads);
			o.put("mobile", data.mobileDownloads);
			o.put("sdk", data.sdkDownloads);
			o.put("githubHits", data.githubHits);
			o.put("blogHits", data.blogHits);
			o.put("referencesHits", data.referencesHits);
			o.put("featuresHits", data.featuresHits);
			o.put("getstartedHits", data.getstartedHits);
			o.put("demokitHits", data.demokitHits);
			o.put("coreHits", data.coreHits);
			o.put("versionedCoreHits", data.versionedCoreHits);
			o.put("ipCounter", data.ipCounter);
			
			JSONObject versionsObject = new JSONObject();
			for (String version : data.getCoreVersions().keySet()) {
				versionsObject.put(version, data.getCoreVersions().get(version));
			}
			o.put("coreVersions", versionsObject);

			dataArray.put(o);
		}

		return json;
	}


	/**
	 * Adds the given log file names to the given JSON object.
	 * 
	 * @param json a data object that needs to hold an array of file names in the "data" node on root level
	 * @param dataSets
	 * @private
	 * @return
	 */
	private JSONObject addknownFilesToJson(JSONObject json, List<File> newFiles) {
		JSONArray dataArray = json.getJSONArray("data");

		for (File file : newFiles) {
			String fileName = file.getName();
			if (fileName.indexOf(".gz") > 0) {
				// not expected, should look into this
				throw new RuntimeException("Error while saving new known log file names: these should be the unzipped files, but one of the files contains the substring '.gz', which is suspicious: " + fileName);
			}
			dataArray.put(fileName + ".gz");
		}
		return json;
	}


	/**
	 * Writes all given data to a CSV file for easy consumption in Excel
	 * 
	 * @param file
	 * @param allData
	 * @private
	 */
	private void exportAsCSV(File file, JSONObject allData) {
		JSONArray dataArray = allData.getJSONArray("data");

		BufferedWriter bw = null;
		try {
			if (file.exists()) {
				file.delete();
			} 
			file.createNewFile();

			FileOutputStream fos = new FileOutputStream(file);
			bw = new BufferedWriter(new OutputStreamWriter(fos));
			
			String outFileText = "Date;Runtime Downloads;Hybrid Downloads;SDK Downloads;GitHub Hits;SDK Hits;Blog Hits;IP Counter;References Hits;Features Hits;GetStarted Hits;Core Hits;Versioned Core Hits;Core Versions\n";
			bw.write(outFileText);

			for (int i = 0; i < dataArray.length(); i++) {
				JSONObject dataSet = dataArray.getJSONObject(i);

				String dateText = dataSet.getString("csvDate");
				int runtimeDownloads = dataSet.getInt("runtime");
				int mobileDownloads = dataSet.getInt("mobile");
				int sdkDownloads = dataSet.getInt("sdk");
				int githubHits = dataSet.getInt("githubHits");
				int demokitHits = dataSet.getInt("demokitHits");
				int blogHits = dataSet.getInt("blogHits");
				String coreVersions = "{}";
				
				int referencesHits;
				try {
					referencesHits = dataSet.getInt("referencesHits");
				} catch (JSONException e) {
					referencesHits = 0;
				}
				int featuresHits;
				try {
					featuresHits = dataSet.getInt("featuresHits");
				} catch (JSONException e) {
					featuresHits = 0;
				}
				int getstartedHits;
				try {
					getstartedHits = dataSet.getInt("getstartedHits");
				} catch (JSONException e) {
					getstartedHits = 0;
				}
				int coreHits;
				try {
					coreHits = dataSet.getInt("coreHits");
				} catch (JSONException e) {
					coreHits = 0;
				}
				int versionedCoreHits;
				try {
					versionedCoreHits = dataSet.getInt("versionedCoreHits");
				} catch (JSONException e) {
					versionedCoreHits = 0;
				}
				try {
					JSONObject coreVersionsObject = dataSet.getJSONObject("coreVersions");
					coreVersions = stringifyJSON(coreVersionsObject);
				} catch (JSONException e) {
					coreVersions = "{}";
				}
				int ipCounter = dataSet.getInt("ipCounter");

				// the result string for a line in the CSV file
				outFileText = dateText + ";" + runtimeDownloads + ";" + mobileDownloads + ";" + sdkDownloads + ";" + githubHits + ";" + demokitHits + ";" + blogHits + ";" + ipCounter + ";" + referencesHits + ";" + featuresHits + ";" + getstartedHits + ";" + coreHits + ";" + versionedCoreHits + ";" + coreVersions + "\n";
				bw.write(outFileText);
			}

			bw.close();
		} catch (IOException e) {
			throw new RuntimeException(e);
		} finally {
			if (bw != null) {
				try {
					bw.close();
				} catch (IOException e) {}
			}
		}
	}
	
	private String stringifyJSON(JSONObject o) {
		Iterator<String> versions = o.keys();
		TreeMap<String,Integer> sorted_map = new TreeMap<String,Integer>(new VersionStringComparator());

		while(versions.hasNext()) {
			String version = versions.next();
			sorted_map.put(version, o.getInt(version));
		}
	
		return LogFileData.stringifyMap(sorted_map);
	}

	/**
	 * Copies the given file to the file named by the EXPORT commandline parameter (if that one is set)
	 * This is meant to export a JSON file to a server location to be used inside a web app.
	 * 
	 * @param originalFile
	 * @private
	 */
	private void exportJsonToWeb(File originalFile) {
		if (exportDir != null) {
			log("Doing JSON export/copy to " + exportDir.getAbsolutePath() + "...\n");
			
			File exportFile = new File(exportDir + File.separator + originalFile.getName());
			
			try {
				FileUtils.copyFile(originalFile, exportFile);
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
			
			log("...JSON file copied to '" + exportFile + "'.\n");
		}
	}



	/**
	 * Simple struct
	 *
	 */
	class FileWithDate {
		String date;
		File file;

		public FileWithDate(String date, File file) {
			this.date = date;
			this.file = file;
		}
	}


	// utility methods

	private static void staticError(String message) {
		throw new RuntimeException(message);
	}
	private static void staticLog(String message) {
		System.out.println(message);
	}
	
	private void error(String message) {
		logToFile("   ERROR: " + message);
		throw new RuntimeException(message);
	}
	private void warn(String message) {
		System.out.println("   WARNING: " + message);
		logToFile("   WARNING: " + message);
	}
	private void log(String message) {
		System.out.println(message);
		logToFile(message);
	}
	
	private void logToFile(String message) {
		if (this.logFileOut != null) {
			try {
				this.logFileOut.write(message + "\n");
			} catch (IOException e) {
				// no need to spam stdout
			}
		}
	}
}
