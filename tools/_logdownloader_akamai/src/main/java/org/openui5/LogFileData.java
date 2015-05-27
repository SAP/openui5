package org.openui5;

import java.util.Date;

import org.json.JSONObject;

/**
 * Class holding the log data (only the extracted numbers) collected for one specific day
 *
 */
class LogFileData {
	Date date;
	int year;
	int month;
	int day;
	int runtimeDownloads;
	int mobileDownloads;
	int sdkDownloads;
	int referencesHits;
	int githubHits;
	int blogHits;
	int featuresHits;
	int demokitHits;
	int ipCounter;

	public LogFileData(Date date, int runtimeDownloads,
			int mobileDownloads, int sdkDownloads, int githubHits,
			int blogHits, int referencesHits, int featuresHits, int demokitHits, int ipCounter) {
		super();

		int day = date.getDate();
		int month = date.getMonth() + 1;
		int year = date.getYear() + 1900;

		this.date = date;
		this.year = year;
		this.month = month;
		this.day = day;
		this.runtimeDownloads = runtimeDownloads;
		this.mobileDownloads = mobileDownloads;
		this.sdkDownloads = sdkDownloads;
		this.githubHits = githubHits;
		this.blogHits = blogHits;
		this.referencesHits = referencesHits;
		this.featuresHits = featuresHits;
		this.demokitHits = demokitHits;
		this.ipCounter = ipCounter;
	}

	public String getYYYYMMDD_WithDashes() {
		String dayPad = day < 10 ? "0" : "";
		String monthPad = month < 10 ? "0" : "";
		String dateText = year + "-" + monthPad + month + "-" + dayPad + day; // padding for single-digit days to ease sorting in the end
		return dateText;
	}

	public String getDDMMYYYY_WithDots() { // for Excel
		String dayPad = day < 10 ? "0" : "";
		String monthPad = month < 10 ? "0" : "";
		String dateText = dayPad + day + "." + monthPad + month + "." + year; // padding for single-digit days to ease sorting in the end
		return dateText;
	}
	
	public static LogFileData fromJson(JSONObject obj) {
		String yyyymmddWithDashes = obj.getString("date");
		String[] dateParts = yyyymmddWithDashes.split("-");
		int year = Integer.parseInt(dateParts[0]);
		int month = Integer.parseInt(dateParts[1]);
		int day = Integer.parseInt(dateParts[2]);
		
		LogFileData data = new LogFileData(
				new Date(year-1900, month-1, day),
				obj.getInt("runtime"), 
				obj.getInt("mobile"), 
				obj.getInt("sdk"), 
				obj.getInt("githubHits"), 
				obj.getInt("blogHits"),
				obj.getInt("referencesHits"),
				obj.getInt("featuresHits"),
				obj.getInt("demokitHits"), 
				obj.getInt("ipCounter"));
		return data;
	}

	public Date getDate() {
		return date;
	}

	public int getRuntimeDownloads() {
		return runtimeDownloads;
	}
	public int getMobileDownloads() {
		return mobileDownloads;
	}
	public int getSdkDownloads() {
		return sdkDownloads;
	}
	public int getGithubHits() {
		return githubHits;
	}
	public int getBlogHits() {
		return blogHits;
	}
	public int getReferencesHits() {
		return referencesHits;
	}
	public int getFeaturesHits() {
		return featuresHits;
	}
	public int getDemokitHits() {
		return demokitHits;
	}
	public int getIpCounter() {
		return ipCounter;
	}

	@Override
	public String toString() {
		// the result string for a line in the CSV file
		String csvText = getDDMMYYYY_WithDots() + ";" + runtimeDownloads + ";" + mobileDownloads + ";" + sdkDownloads + ";" + githubHits + ";" + demokitHits + ";" + blogHits + ";" + ipCounter + ";" + referencesHits+ ";" + featuresHits;
		return csvText;
	}

	public void addData(LogFileData other) {
		if ((this.year != other.year) || (this.month != other.month) || (this.day != other.day)) {
			throw new RuntimeException("Adding data sets with different dates: " + this.date + ", " + other.date);
		}

		this.runtimeDownloads += other.runtimeDownloads;
		this.mobileDownloads += other.mobileDownloads;
		this.sdkDownloads += other.sdkDownloads;
		this.githubHits += other.githubHits;
		this.blogHits += other.blogHits;
		this.referencesHits += other.referencesHits;
		this.featuresHits += other.featuresHits;
		this.demokitHits += other.demokitHits;
		this.ipCounter = Math.max(this.ipCounter, other.ipCounter);
	}
}