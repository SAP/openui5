using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace BrowserMonitor2
{
    public partial class BrowserMonitorForm : Form
    {
        // startup parameters
        List<Uri> urls;
        bool autorun;

        // members relevant for one set of runs
        const int WARMUP_RUNS = 2;
        int defaultSignificantRuns;
        int significantRuns;
        int currentRun;
        bool isRunning;
        double[] runningTimes;
        string currentUrl;
        Boolean cancelRequested = false;

        // members relevant for one single page load
        double timeBefore;
        double timeEvent;
        double timeAfter;

        // timer stuff
        System.Windows.Forms.Timer timer;
        const int MAX_TIMER_COUNT = 1;
        const int TIMER_DELAY = 1000; // 1 sec TODO: adapt dynamically using one or two test-runs for warming up
        System.Windows.Forms.Timer cancelTimer = null;
        const bool DEBUG_TIMING = false;

        // reporting
        TextWriter outWriter;
        Uri outputUrl;

        // resizing warning
        bool resizeWarned = false;
        bool minimizeWarned = false;
        int previousWidth;
        int previousHeight;

        /**
         * Constructor
         */
        public BrowserMonitorForm()
        {
            InitializeComponent();
            
            // sizes
            previousWidth = browser.Width;
            previousHeight = browser.Height;
            frameSizeLabel.Text = "Browser frame size: " + browser.Width + " x " + browser.Height;

            // setup timer
            timer = new System.Windows.Forms.Timer();
            timer.Tick += new EventHandler(DelayedAfterDocumentCompleted);
            timer.Interval = TIMER_DELAY;

            isRunning = false;
            outWriter = null;

            urls = new List<Uri>();
            autorun = false;
        }

        public void AddURL(Uri url)
        {
            if (url != null)
            {
                urls.Add(url);
                urlBox.Text = url.ToString();
            }
        }

        public void AddOutputURL(Uri url)
        {
            if (url != null)
            {
                this.outputUrl = url;
                reportUrlBox.Text = url.ToString();
                linkLabel1.Enabled = true;
            }
        }

        public void SetWriter(TextWriter outWriter)
        {
            this.outWriter = outWriter;
        }

        public void SetRepeatCount(int runs)
        {
            defaultSignificantRuns = runs;
            runsBox.Text = runs.ToString();
        }

        public void SetAutoRun(bool auto)
        {
            this.autorun = auto;
        }


        private void goButton_Click(object sender, EventArgs e)
        {
            string url = urlBox.Text;
            RunTestSeries(url);
        }


        private void RunTestSeries(string url)
        {
            if (cancelTimer != null)
            {
                cancelTimer.Stop();
                cancelTimer = null;
            }

            if (!isRunning)
            {
                isRunning = true;
                this.significantRuns = int.Parse(runsBox.Text);;
                runningTimes = new double[significantRuns];
                currentUrl = url;
                currentRun = WARMUP_RUNS * -1;
                resultBox.AppendText(Environment.NewLine + "Single results (ms):" + Environment.NewLine);

                DoSingleRun();
            }
            else
            {
                //TODO: error, already running!
                MessageBox.Show("Error: already running");
            }
        }

        private void DoSingleRun()
        {
            timeEvent = 0;
            timeAfter = 0;
            timeBefore = Process.GetCurrentProcess().TotalProcessorTime.TotalMilliseconds;
            
            reportTiming("browser.Navigate(currentUrl)");

            browser.Navigate(currentUrl);
        }

        private void browser_DocumentCompleted(object sender, WebBrowserDocumentCompletedEventArgs e)
        {
            timeEvent = Process.GetCurrentProcess().TotalProcessorTime.TotalMilliseconds; // the time when the event is fired, but the page not yet fully loaded

            reportTiming("browser_DocumentCompleted");

            if ("Navigation Canceled".Equals(browser.DocumentTitle)
                || this.cancelRequested
                || (browser.DocumentTitle.Contains("Tomcat") && browser.DocumentTitle.Contains("Error report"))
                || ("Internet Explorer cannot display the webpage".Equals(browser.DocumentTitle)))
            {
                // e.g. server not running or user pressed "Cancel Tests"
                resultBox.AppendText("Test Run aborted:" + Environment.NewLine);
                if (this.cancelRequested)
                {
                    resultBox.AppendText("Cancelled by user");
                }
                else if ("Navigation Canceled".Equals(browser.DocumentTitle))
                {
                    resultBox.AppendText("Server seems to be down");
                }
                else if (browser.DocumentTitle.Contains("Tomcat") && browser.DocumentTitle.Contains("Error report"))
                {
                    resultBox.AppendText("Server error, maybe page not found");
                }
                else if ("Internet Explorer cannot display the webpage".Equals(browser.DocumentTitle))
                {
                    resultBox.AppendText("Maybe server not found");
                }

                cancelRequested = false;
                isRunning = false;

                // if in auto mode, run the next page now
                if (autorun)
                {
                    RunNextStep();
                }
            }
            else
            {
                // Start the timer to also capture any after-work done in the browser
                timer.Start();
            }
        }

        void DelayedAfterDocumentCompleted(object sender, EventArgs e)
        {
            if (browser.Url.ToString() == "about:blank") // this occurs after aborting
            {
                return;
            }

            timeAfter = Process.GetCurrentProcess().TotalProcessorTime.TotalMilliseconds;

            // stop the timer
            timer.Stop();

            // create the result text for the textbox
            string text = "";
            for (int i = 0; i < MAX_TIMER_COUNT; i++)
            {
                text += (timeAfter - timeBefore) + Environment.NewLine;
            }

            // difference between warmup and real run
            if (currentRun < 0)
            {
                // this is a warmup run!!
                resultBox.AppendText("Warmup run #" + (WARMUP_RUNS + currentRun + 1) + ": " + text);
            }
            else
            {
                // save the result
                runningTimes[currentRun] = timeAfter - timeBefore;

                resultBox.AppendText(text);
            }

            // if more runs are requested, do it again...
            currentRun++;
            if (currentRun < significantRuns)
            {
                DoSingleRun();
            }
            else
            {
                // this URL has now been completely measured; the requested number of measured runs has been completed

                resultBox.AppendText("OK." + Environment.NewLine + Environment.NewLine);
                resultBox.AppendText(Statistics.GetStats(runningTimes) + Environment.NewLine + Environment.NewLine);
                isRunning = false;

                if (outputUrl != null)
                {
                    reportResults(outputUrl);
                }

                // if in auto mode, run the next page now
                if (autorun)
                {
                    RunNextStep();
                }
            }
        }

        private static long ConvertToUnixTimestamp(DateTime date)
        {
            DateTime origin = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            TimeSpan diff = date - origin;
            return (long) Math.Floor(diff.TotalMilliseconds);
        }

        private void reportResults(Uri outputUrl)
        {
            long date = ConvertToUnixTimestamp(DateTime.Now);
            string clientHost = Uri.EscapeDataString(System.Environment.MachineName);
            string clientBrowser = Uri.EscapeDataString("Internet Explorer"); //browser.ProductName + " (" + browser.ProductVersion + ")");
            string clientVersion = Uri.EscapeDataString(browser.Version.ToString());

            String pageUrl = Uri.EscapeDataString(currentUrl);

            String allResults = runningTimes[0].ToString().Replace(",", ".");
            for (int i = 1; i < runningTimes.Length; i++)
            {
                allResults += "," + runningTimes[i].ToString().Replace(",", ".");
            }

            String urlString = outputUrl + "?" + "put&date=" + date + "&clientHost=" + clientHost + "&clientBrowser=" + clientBrowser +
                "&clientVersion=" + clientVersion + "&pageUrl=" + pageUrl + "&allResults=" + allResults;

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(urlString);
            try
            {
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                StreamReader r = new StreamReader(response.GetResponseStream());
                string content = r.ReadToEnd();
                resultBox.AppendText(content);
            }
            catch (WebException e)
            {
                resultBox.AppendText("ERROR when trying to send results to server URL '" + outputUrl + "': " + e.Message);
            }
        }



        private void clearButton_Click(object sender, EventArgs e)
        {
            resultBox.Clear();
        }

        private void BrowserMonitorForm_Shown(object sender, EventArgs e)
        {
            if (autorun)
            {
                RunNextStep();
            }
        }

        private void RunNextStep()
        {
            if (urls.Count > 0)
            {
                Uri url = urls[0];
                urls.RemoveAt(0);
                RunTestSeries(url.ToString());
            }
            else
            {
                Application.Exit();
            }
        }

        private void linkLabel1_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            if (outputUrl != null)
            {
                System.Diagnostics.Process.Start(outputUrl + "?get&reportType=HTML");
            }
        }

        private void cancelTestsButton_Click(object sender, EventArgs e)
        {
            this.cancelRequested = true;
            if (cancelTimer != null)
            {
                cancelTimer.Stop();
                cancelTimer = null;
            }
            cancelTimer = new System.Windows.Forms.Timer();
            cancelTimer.Tick += new EventHandler(ForceCancel);
            cancelTimer.Interval = 5000;
            cancelTimer.Start();
        }

        void ForceCancel(object sender, EventArgs e)
        {
            if (cancelTimer != null)
            {
                cancelTimer.Stop();
                cancelTimer = null;
            }
            //MessageBox.Show("Cancel is now enforced.");

            resultBox.AppendText("Test Run aborted:" + Environment.NewLine);
            resultBox.AppendText("Cancelled by user");
            cancelRequested = false;
            isRunning = false;
            browser.Navigate("about:blank");

            // if in auto mode, run the next page now
            if (autorun)
            {
                RunNextStep();
            }
            
        }

        private void linkLabel2_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            System.Diagnostics.Process.Start("http://vephxinfra.dhcp.wdf.sap.corp:8080/uilib-sample/PerformanceReport.html");
        }

        private void linkLabel3_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            System.Diagnostics.Process.Start("http://vephoenix.dhcp.wdf.sap.corp:1080/trac/phoenix/wiki/SprintOverviews/Takt-2010-I/PerformanceMeasurementsAndInfrastructure#TheBrowserMonitor2");
        }

        private void setReportUrlButton_Click(object sender, EventArgs e)
        {
            AddOutputURL(new Uri(reportUrlBox.Text));
        }

        private void BrowserMonitorForm_ResizeEnd(object sender, EventArgs e)
        {
            if (!resizeWarned && ((previousWidth != browser.Width) || (previousHeight != browser.Height)))
            {
                MessageBox.Show("Please note that resizing the browser frame influences the CPU consumption!\n" +
                    "Fullscreen needs roughly 30% more time than a very small window.\nFor comparable measurements always use " +
                    "identical window sizes.\n(This is also the case for the original BrowserMonitor tool created by UR.)");
                // no need to update sizes, as we warn only once
                resizeWarned = true;
            }
        }

        private void BrowserMonitorForm_Resize(object sender, EventArgs e)
        {
            frameSizeLabel.Text = "Browser frame size: " + browser.Width + " x " + browser.Height;
        }

        private void BrowserMonitorForm_SizeChanged(object sender, EventArgs e)
        {
            if (!minimizeWarned && (this.WindowState == FormWindowState.Minimized)) {
                MessageBox.Show("Please note that minimizing the browser frame influences the CPU consumption!\n" +
                    "Normal usage needs roughly 30% more time than a minimized window.\nFor comparable measurements always use " +
                    "a visible window and identical window sizes.\n");
                minimizeWarned = true;
            }
            else if (!resizeWarned && (this.WindowState == FormWindowState.Maximized)) // handle like resize (resize event is not fired on maximizing)
            {
                MessageBox.Show("Please note that resizing the browser frame influences the CPU consumption!\n" +
                    "Fullscreen needs roughly 30% more time than a very small window.\nFor comparable measurements always use " +
                    "identical window sizes.\n(This is also the case for the original BrowserMonitor tool created by UR.)");
                resizeWarned = true;
            }
        }

        private void browser_Navigated(object sender, WebBrowserNavigatedEventArgs e)
        {
               reportTiming("browser_Navigated");
        }

        private void browser_Navigating(object sender, WebBrowserNavigatingEventArgs e)
        {
               reportTiming("browser_Navigating");
        }

        private void reportTiming(string measuringPoint)
        {
            if (DEBUG_TIMING)
            {
                double procMillis = Process.GetCurrentProcess().TotalProcessorTime.TotalMilliseconds;
                double totalMillis = Environment.TickCount;
                resultBox.AppendText(measuringPoint + " - CPU: " + procMillis + "  System: " + totalMillis + Environment.NewLine);
            }
        }
    }
}
