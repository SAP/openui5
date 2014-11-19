package org.openui5;

import java.util.Date;

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
	int githubHits;
	int blogHits;
	int demokitHits;
	int ipCounter;

	public LogFileData(Date date, int runtimeDownloads,
			int mobileDownloads, int sdkDownloads, int githubHits,
			int blogHits, int demokitHits, int ipCounter) {
		super();

		int day = date.getDate();
		int month = date.getMonth()+1;
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
	public int getDemokitHits() {
		return demokitHits;
	}
	public int getIpCounter() {
		return ipCounter;
	}

	@Override
	public String toString() {
		// the result string for a line in the CSV file
		String csvText = getDDMMYYYY_WithDots() + ";" + runtimeDownloads + ";" + mobileDownloads + ";" + sdkDownloads + ";" + githubHits + ";" + demokitHits + ";" + blogHits + ";" + ipCounter;
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
		this.demokitHits += other.demokitHits;
		this.ipCounter += other.ipCounter;
	}
}