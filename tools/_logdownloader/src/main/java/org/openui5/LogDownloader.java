package org.openui5;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class LogDownloader {

	// SETTINGS
	private static final String[] ACCOUNTS = {"openui5", "openui5beta"};
	
	private static String USER = null;
	private static final String DEFAULT_USER = null;
	private static String PASSWORD = null;
	private static final String DEFAULT_PASSWORD = null;
	
	private static final String DATA_FILE_NAME = "data";
	
	private static String NEO_PATH = null;
	private static final String DEFAULT_NEO_PATH = "\"C:\\Program Files (x86)\\neo-java-web-sdk-1.65.10\\tools\\neo.bat\"";
	
	private static final boolean DEV_MODE = false;

	// global consts
	private static final String PROXY = "setProxy.bat & ";
	private static final String BACKUP_FOLDER_NAME = "logBackup";

	// member variables
	private final File directory;
	private final File exportDir;


	
	public static void main(String[] args) {

		String folderToScan = System.getProperty("user.dir");
		String exportDirString = null;

		// parse commandline arguments
		if (args.length > 0) {
			if (args.length % 2 != 0) {
				error("There are " + args.length + " arguments, but this tool needs name-value pairs.");
			}
			
			for (int i = 0; i < args.length; i += 2) {
				String paramName = args[i].trim();
				String paramValue = args[i+1].trim();
				
				if (paramName.equals("--user")) {
					USER = paramValue;
				} else if (paramName.equals("--password")) {
					PASSWORD = paramValue;
				} else if (paramName.equals("--neobat")) {
					NEO_PATH = "\"" + paramValue.replaceAll("^\"|\"$", "").replaceAll("^'|\'$", "") + "\"";
				} else if (paramName.equals("--dir")) {
					folderToScan =  paramValue.replaceAll("^\"|\"$", "").replaceAll("^'|\'$", "");
				} else if (paramName.equals("--export")) {
					exportDirString =  paramValue.replaceAll("^\"|\"$", "").replaceAll("^'|\'$", "");
				} else {
					error("Unknown commandline parameter '" + paramName + "'. Supported are: --user, --password, --neobat, --dir, --export");
				}
			}
		} else {
			log("Usage:  java -Xms128m -Xmx1024m org.openui5.LogDownloader --user D012345 --password abc123 --neobat \"C:\\Program Files (x86)\\neo-java-web-sdk-1.65.10\\tools\\neo.bat\"");
			log("   User and password are required.");
			log("   Supported parameters:");
			log("   --user: the user name");
			log("   --password: the password");
			log("   --neobat: the location of the commandline tool neo.bat");
			log("   --dir: the directory in which the log data should be stored (an archive directory will be created below); ");
			log("          default is the current directory");
			log("   --export: the directory where the JSON file(s) with the aggregated results should be copied to;");
			log("             this file can be used as data source for apps; by default the JSON file is not copied anywhere");
			if (!DEV_MODE) {
				error("No commandline arguments received. At least user name and password need to be given!");
			}
		}
		
		if (USER == null) {
			if (DEV_MODE) {
				USER = DEFAULT_USER;
			} else {
				error("User name was not given, use the '--user' parameter.");
			}
		}
		if (PASSWORD == null) {
			if (DEV_MODE) {
				PASSWORD = DEFAULT_PASSWORD;
			} else {
				error("Password was not given, use the '--password' parameter.");
			}
		}
		
		if (NEO_PATH == null) {
			NEO_PATH = DEFAULT_NEO_PATH;
			log("Using default NEO path: " + NEO_PATH);
		}
		if (!(new File(NEO_PATH.replaceAll("^\"|\"$", "").replaceAll("^'|\'$", "")).exists()) || new File(NEO_PATH.replaceAll("^\"|\"$", "").replaceAll("^'|\'$", "")).isDirectory()) {
			error("Correct Neo tools path was not given, use the '--neobat' parameter and let it point to the file 'neo.bat', not its containing directory.");
		}

		// setup working directory
		File logDir = new File(folderToScan);
		if (!logDir.exists() || !logDir.isDirectory()) {
			error("Working directory " + logDir.getAbsolutePath() + " does not exist or is no directory.");
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
					error("Export directory " + exportDirString + " is a file");
				}
			}
		}

		// start the download and parsing process...
		LogDownloader ld = new LogDownloader(logDir, exportDir);

		// ...for all required accounts
		for (int i = 0; i < ACCOUNTS.length; i++) {
			ld.handleLogFiles(ACCOUNTS[i]);
		}
	}

	

	/**
	 * 
	 * @param directory the working directory (must be an existing directory where the intermediate files can be stored)
	 */
	public LogDownloader(File directory, File exportDirectory) {
		this.directory = directory;
		this.exportDir = exportDirectory;
	}


	/**
	 * Downloads and processes the HTTP log files for the given account
	 * 
	 * @param account
	 */
	public void handleLogFiles(String account) {
		
		log("\nStarting log download process for account '" + account + "'...\n\n");

		
		// Step 1: get the list of log files from the cloud server
		JSONObject json = this.getLogList(account);
		log("...log list downloaded.\n");


		// Step 2: extract the actual HTTP log file names by parsing the log list
		List<String> logFileNames = this.parseCommandOutput(json.getString("commandOutput"));

		if (logFileNames.size() < 1) { // no logs?
			error("no log files could be extracted from JSON");
		} else {
			log("..." + logFileNames.size() + " log file names found.\n");
		}


		// Step 3: download the HTTP log files
		List<File> rawLogFiles = this.downloadLogFiles(logFileNames, account);
		if (rawLogFiles.size() != logFileNames.size()) {
			error(logFileNames.size() + " log file names known, but " + rawLogFiles.size() + " files downloaded.");
		} else {
			log("..." + rawLogFiles.size() + " log files downloaded.\n");
		}


		// Step 4: anonymize the log files
		List<FileWithDate> anonymizedLogFiles = this.anonymizeLogFiles(rawLogFiles);
		if (anonymizedLogFiles.size() != logFileNames.size()) {
			error(logFileNames.size() + " log file names known, but " + anonymizedLogFiles.size() + "files anonymized.");
		} else {
			log("..." + anonymizedLogFiles.size() + " log files anonymized.\n");
		}


		// Step 5: extract data from log files and backup the completed log files
		List<LogFileData> dataSets = this.parseLogs(anonymizedLogFiles, account);
		log("...log files parsed.\n");


		// Step 6: load previous data from file
		JSONObject allData = this.loadDataFile(new File(directory + File.separator + DATA_FILE_NAME + "_" + account + ".json"));
		log("...data file loaded.\n");


		// Step 7: merge new data
		allData = this.addToJson(allData, dataSets);
		log("...new data added.\n");


		// Step 8: save data file
		File jsonDataFile = new File(directory + File.separator + DATA_FILE_NAME + "_" + account + ".json");
		this.saveDataFile(jsonDataFile, allData);
		log("...data file saved.\n");


		// Step 9: store Excel/CSV data
		this.exportAsCSV(new File(directory + File.separator + DATA_FILE_NAME + "_" + account + ".csv"), allData);
		log("...CSV file exported.\n");
		
		// Step 10:
		this.exportJsonToWeb(jsonDataFile);
	}





	/**
	 * Returns a JSONObject containing the result of the list-logs API call
	 * 
	 * @param account like openui5 or openui5beta
	 * @return
	 */
	private JSONObject getLogList(String account) {
		JSONObject result = null;

		final String listLogsCommand = " list-logs --user " + USER + " -p " + PASSWORD + " --output json --account appdesigner --application " + account + " --host https://hana.ondemand.com/ ";

		String commandline = "cmd /c " + PROXY + NEO_PATH + listLogsCommand;
		log("Retrieving list of log files...");
		log("Using commandline " + commandline.replace(PASSWORD, "***"));

		try {
			Runtime rt = Runtime.getRuntime();

			// execute the commandline tool
			Process p = rt.exec(commandline);

			// read the result string
			final InputStream in = p.getInputStream();
			String resultString = IOUtils.toString(in, "UTF-8");

			// don't continue unless finished
			p.waitFor();
			
			// parse the JSON data
			Exception ex = null;
			try {
				result = new JSONObject(resultString);
			} catch (JSONException e) {
				ex = e; // delay reporting this error, otherwise we would loose the error reported from the server
			}
			
			// check for errors
			if (result != null && result.getInt("exitCode") != 0) { // error in API call?
				error(result.getString("errorMsg") + "\n\nresult json is: " + result + "\n\ncommandline was:\n" + commandline.replace(PASSWORD, "***"));
			}
			
			// now check for JSON parsing error
			if (ex != null) {
				error("No valid JSON recived: " + resultString);
				throw new RuntimeException(ex);
			}

		} catch (IOException e) {
			throw new RuntimeException(e);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}

		return result;
	}


	/**
	 * Takes the "commandOutput" string from the JSONObject returned by the list-logs call and extracts the names of the listed HTTP log files
	 * 
	 * @param commandOutput
	 * @return
	 */
	private List<String> parseCommandOutput(String commandOutput) {
		List<String> result = new ArrayList<String>();
		final Pattern LINE_PATTERN = Pattern.compile("^\\d.* (http_[^\\s]+.log)$");

		log("Parsing log list...");

		String[] lines = commandOutput.split("\n");

		for (int i = 0; i < lines.length; i++) {
			String line = lines[i];
			Matcher m = LINE_PATTERN.matcher(line);
			if (m.matches()) {
				result.add(m.group(1));
			}
		}

		return result;
	}


	/**
	 * Takes a list of log file names and downloads them from the server
	 * 
	 * @param logFileNames
	 * @return locally downloaded log files
	 */
	private List<File> downloadLogFiles(List<String> logFileNames, String account) {
		final String getLogCommand = " get-log  --user " + USER + "  -p " + PASSWORD + "  --account appdesigner  --application " + account + "  --host https://hana.ondemand.com/  --output json  --directory \"" + directory.getAbsolutePath() + "\"";
		String commandline = "cmd /c " + PROXY + NEO_PATH + getLogCommand;
		Runtime rt = Runtime.getRuntime();
		JSONObject json;

		List<File> logFiles = new ArrayList<File>();

		log("Downloading log files...");

		try {

			for (int i = 0; i < logFileNames.size(); i++) {
				String fileName = logFileNames.get(i);
				File logFile = new File(directory + File.separator + fileName);

				log(" - " + logFile.getAbsolutePath());

				// delete file if it already exists
				if (logFile.exists()) {
					logFile.delete();
				}

				// execute the commandline tool
				Process p = rt.exec(commandline + " --file " + fileName);

				// read the result string
				final InputStream in = p.getInputStream();
				String resultString = IOUtils.toString(in, "UTF-8");

				// don't continue unless finished
				p.waitFor();

				// parse the JSON data
				json = new JSONObject(resultString);

				// detect errors
				if (json.getInt("exitCode") != 0) { // error in API call?
					error(json.getString("errorMsg"));
				}

				// check downloaded file
				if (!logFile.exists()) {
					error("File " + logFile + " was not downloaded successfully");
				} else if (logFile.length() < 1000) {
					error("File " + logFile + " is too small to be good: " + logFile.length() + " bytes");
				} else {
					logFiles.add(logFile);
					logFile.deleteOnExit();
				}
			}

		} catch (IOException e) {
			throw new RuntimeException(e);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}

		return logFiles;
	}


	/**
	 * Anonymizes the given log files by removing the IP addresses (substituting them with a unique number per IP).
	 * Deletes the original log files and returns the new anonymized log files along with the corresponding date (as yyyy-mm-dd string).
	 * 
	 * @param rawLogFiles
	 * @return
	 */
	private List<FileWithDate> anonymizeLogFiles(List<File> rawLogFiles) {
		List<FileWithDate> anonymizedLogFiles = new ArrayList<FileWithDate>();
		Set<String> usedFileNames = new HashSet<String>();

		final Pattern FILE_DATE_PATTERN = Pattern.compile(".*(\\d\\d\\d\\d-\\d\\d-\\d\\d).*"); // to get the date from the log file name

		log("Anonymizing log files...");

		try {
			for (int i = 0; i < rawLogFiles.size(); i++) {
				File file = rawLogFiles.get(i);

				log(" - " + file.getName());
				List<String> logLines = readAndAnonymizeFile(file);

				String dateText = file.getName();
				Matcher m = FILE_DATE_PATTERN.matcher(file.getName());
				if (m.matches()) {
					dateText = m.group(1);
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
	 * Reads a given file and returns the parsed and anonymized logLines for the relevant log entries
	 * 
	 * @param logFile
	 * @return
	 */
	private List<String> readAndAnonymizeFile(File logFile) {
		List<String> logLines = new ArrayList<String>(2048);
		Map<String,Integer> ipAddressAnonymizer = new HashMap<String,Integer>(256);

		// these strings mark relevant log entries
		final String ANY_DOWNLOAD_FRAGMENT_STRING = " /downloads/openui5-";
		final String ANY_GITHUB_PAGE_FRAGMENT_STRING = " /resources/sap/ui/core/themes/base/img/1x1.gif?page=";
		final String DEMOKIT_PAGE_FRAGMENT_STRING = "GET / ";

		try {
			BufferedReader br = new BufferedReader(new FileReader(logFile));
			String line;
			while ((line = br.readLine()) != null) {

				if (line.contains(ANY_DOWNLOAD_FRAGMENT_STRING)
						|| line.contains(ANY_GITHUB_PAGE_FRAGMENT_STRING)
						|| line.contains(DEMOKIT_PAGE_FRAGMENT_STRING)) { // only handle interesting lines

					String[] parts = line.split("\\(");
					String[] innerParts = parts[1].split("\\)");
					String ipList = innerParts[0]; // ipList is the part between the braces, containing any IP addresses

					// now replace the IP addresses by a number, starting from 1
					Integer anonIp = ipAddressAnonymizer.get(ipList);

					if (anonIp == null) { // new IP address string, anonymize it
						Integer previous = ipAddressAnonymizer.get("latest");
						int prevInt;
						if (previous == null) {
							prevInt = 0;
						} else {
							prevInt = previous.intValue();
						}
						int current = prevInt + 1;
						ipAddressAnonymizer.put(ipList, new Integer(current));
						ipAddressAnonymizer.put("latest", new Integer(current));
						anonIp = current;
					}

					line = String.valueOf(anonIp) + " " + line.substring(line.indexOf("["));

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
	 * @return a sorted list of data sets where each day is only present once
	 */
	private List<LogFileData> parseLogs(List<FileWithDate> anonymizedLogFiles, String account) {
		List<LogFileData> dataSets = new ArrayList<LogFileData>();
		List<File> completeLogFiles = new ArrayList<File>(); // those we want to back up
		
		log("Parsing log files...");

		Calendar today = Calendar.getInstance();
		Calendar fileDate = Calendar.getInstance();

		try {
			for (int i = 0; i < anonymizedLogFiles.size(); i++) {
				log(" - " + anonymizedLogFiles.get(i).file);

				List<AnonymousLogLine> logLines = readLogFile(anonymizedLogFiles.get(i).file);

				if (logLines.size() > 0) {
					LogFileData data = handleLogLinesFromFile(logLines);

					fileDate.setTime(data.getDate());
					if (!sameDay(fileDate, today)) { // ignore today's log because it is incomplete
						dataSets.add(data);
						warn(data.toString());
						completeLogFiles.add(anonymizedLogFiles.get(i).file);
					}
				} else {
					// TODO: nothing relevant in the log. Do anything?
				}
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}


		// there can be multiple log files per day (one per process), aggregate numbers per day now...
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

		// sort the data sets ascending by day
		Collections.sort(aggregatedDataSets, new Comparator<LogFileData>() { // sort lines by date
			@Override
			public int compare(LogFileData d1, LogFileData d2)
			{
				return d1.getYYYYMMDD_WithDashes().compareTo(d2.getYYYYMMDD_WithDashes());
			}
		});
		
		// backup the anonymized log files
		this.backupAnonymizedFiles(completeLogFiles, account);

		return aggregatedDataSets;
	}


	/**
	 * Returns whether the given dates are on the same day
	 * 
	 * @param c1
	 * @param c2
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
	 * @return
	 */
	private List<AnonymousLogLine> readLogFile(File logFile) {
		List<AnonymousLogLine> logLines = new ArrayList<AnonymousLogLine>(512);

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
	 * Takes parsed log lines, does some filtering on the HTTP codes and reports the aggregated results for this file to outputLines
	 * 
	 * @param logLines
	 * @throws IOException
	 */
	private LogFileData handleLogLinesFromFile(List<AnonymousLogLine> logLines) throws IOException {
		Date date = logLines.get(Math.min(logLines.size()-1, 500)).getDate(); // use the date of the 500th line because the first lines might be from the date before (only happened once in 100 days for the very first line, so this distance seems safe)

		Calendar c1 = Calendar.getInstance();
		c1.setTime(date);

		Set<String> knownIps = new HashSet<String>(512);

		int runtimeDownloads = 0;
		int mobileDownloads = 0;
		int sdkDownloads = 0;
		int githubHits = 0;
		int blogHits = 0;
		int demokitHits = 0;
		int ipCounter = 0;


		boolean handleThis206Line; // whether a line with HTTP 206 status code should be counted; those originate from download managers which load multiple chunks in parallel, so there are several requests but only one actual download
		for (AnonymousLogLine logLine : logLines) {
			handleThis206Line = false;

			if (logLine.getCode() == 206) {
				if (knownIps.contains(logLine.getIpCounter() + "-" + logLine.getUrl())) {
					//System.out.println("Discarding line of type " + logLine.getType()); // rule of thumb: if same file was already downloaded the same day, this 206 request is a different chunk of the same download
				} else {
					handleThis206Line = true;
				}
			}

			knownIps.add(logLine.getIpCounter() + "-" + logLine.getUrl());

			// keep track of how many unique IPs have been encountered
			ipCounter = Math.max(Integer.parseInt(logLine.getIpCounter()), ipCounter);

			if (logLine.getCode() == 200 || (logLine.getCode() == 206 && handleThis206Line)) {
				switch (logLine.getType()) {
				case GITHUB_PAGE:
					githubHits++;
					break;
				case BLOG_PAGE:
					blogHits++;
					break;
				case DEMOKIT_PAGE:
					demokitHits++;
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
				default:
					System.out.println("ERROR: unknown case");
				}

			} else {
				if (logLine.getCode() != 206) {
					warn("logline with status code " + logLine.getCode() + " url: " + logLine.getUrl());
				}
			}
		}

		LogFileData data = new LogFileData(date, runtimeDownloads, mobileDownloads, sdkDownloads, githubHits, blogHits, demokitHits, ipCounter);

		return data;
	}


	/**
	 * Moves the given files to a backup directory below the working directoy
	 * 
	 * @param anonymizedLogFiles
	 */
	private void backupAnonymizedFiles(List<File> anonymizedLogFiles, String account) {
		File backupDir = new File(directory + File.separator + BACKUP_FOLDER_NAME + "_" + account);
		if (!backupDir.exists()) {
			backupDir.mkdir();
		}

		for (int i = 0; i < anonymizedLogFiles.size(); i++) {
			File logFile = anonymizedLogFiles.get(i);
			File targetFile = new File(backupDir + File.separator + logFile.getName());
			if (!targetFile.exists()) {
				logFile.renameTo(targetFile);
			}
		}
	}


	/**
	 * Loads the given data file into a JSON object after doing some sanity checks; creates an empty data file if the given file does not exist
	 * 
	 * @param file
	 * @return
	 */
	private JSONObject loadDataFile(File file) {
		JSONObject json;
		log("Loading data file " + file + "...");

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
	 */
	private void saveDataFile(File file, JSONObject json) {
		String jsonString = json.toString(2);
		PrintWriter out = null;
		log("Saving data file " + file + "...");

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
	 * Adds the given data sets to the given JSON object. Only adds data for days that are not contained yet.
	 * 
	 * @param json a data object that needs to hold an array of data sets in the "data" node on root level
	 * @param dataSets
	 * @return
	 */
	private JSONObject addToJson(JSONObject json, List<LogFileData> dataSets) {
		JSONArray dataArray = json.getJSONArray("data");
		Set<String> existingDates = new HashSet<String>();
		log("Adding new data to JSON...");

		// get a list of all dates that already exist
		for (int i = 0; i < dataArray.length(); i++) {
			JSONObject dataObject = dataArray.getJSONObject(i);
			existingDates.add(dataObject.getString("date"));
		}

		for (int i = 0; i < dataSets.size(); i++) {
			LogFileData data = dataSets.get(i);

			// check whether the data is already there
			String currentDateString = data.getYYYYMMDD_WithDashes();

			if (existingDates.contains(currentDateString)) {
				// this data set does not need to be stored, it's already there

			} else { // new data, add it
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
				o.put("demokitHits", data.demokitHits);
				o.put("ipCounter", data.ipCounter);

				dataArray.put(o);
			}
		}

		return json;
	}


	
	private void exportAsCSV(File file, JSONObject allData) {
		JSONArray dataArray = allData.getJSONArray("data");
		log("Exporting CSV file " + file + "...");

		BufferedWriter bw = null;
		try {
			if (file.exists()) {
				file.delete();
			} 
			file.createNewFile();

			FileOutputStream fos = new FileOutputStream(file);
			bw = new BufferedWriter(new OutputStreamWriter(fos));

			for (int i = 0; i < dataArray.length(); i++) {
				JSONObject dataSet = dataArray.getJSONObject(i);

				String dateText = dataSet.getString("csvDate");
				int runtimeDownloads = dataSet.getInt("runtime");
				int mobileDownloads = dataSet.getInt("mobile");
				int sdkDownloads = dataSet.getInt("sdk");
				int githubHits = dataSet.getInt("githubHits");
				int blogHits = dataSet.getInt("blogHits");
				int demokitHits = dataSet.getInt("demokitHits");
				int ipCounter = dataSet.getInt("ipCounter");

				// the result string for a line in the CSV file
				String outFileText = dateText + ";" + runtimeDownloads + ";" + mobileDownloads + ";" + sdkDownloads + ";" + githubHits + ";" + demokitHits + ";" + blogHits + ";" + ipCounter + "\n";
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
	
	
	/**
	 * Copies the given file to the file named by the EXPORT commandline parameter (if that one is set)
	 * 
	 * @param originalFile
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

	private static void error(String message) {
		throw new RuntimeException(message);
	}
	private static void warn(String message) {
		System.out.println("    WARNING: " + message);
	}
	private static void log(String message) {
		System.out.println(message);
	}
}
