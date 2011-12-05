namespace BrowserMonitor2
{
    partial class BrowserMonitorForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(BrowserMonitorForm));
            this.urlBox = new System.Windows.Forms.TextBox();
            this.goButton = new System.Windows.Forms.Button();
            this.browser = new System.Windows.Forms.WebBrowser();
            this.resultBox = new System.Windows.Forms.TextBox();
            this.clearButton = new System.Windows.Forms.Button();
            this.runsBox = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.panel1 = new System.Windows.Forms.Panel();
            this.label2 = new System.Windows.Forms.Label();
            this.linkLabel1 = new System.Windows.Forms.LinkLabel();
            this.cancelTestsButton = new System.Windows.Forms.Button();
            this.linkLabel2 = new System.Windows.Forms.LinkLabel();
            this.linkLabel3 = new System.Windows.Forms.LinkLabel();
            this.reportUrlBox = new System.Windows.Forms.TextBox();
            this.setReportUrlButton = new System.Windows.Forms.Button();
            this.frameSizeLabel = new System.Windows.Forms.Label();
            this.panel1.SuspendLayout();
            this.SuspendLayout();
            // 
            // urlBox
            // 
            this.urlBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left)
                        | System.Windows.Forms.AnchorStyles.Right)));
            this.urlBox.Location = new System.Drawing.Point(50, 14);
            this.urlBox.Name = "urlBox";
            this.urlBox.Size = new System.Drawing.Size(829, 20);
            this.urlBox.TabIndex = 0;
            // 
            // goButton
            // 
            this.goButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.goButton.Location = new System.Drawing.Point(1005, 12);
            this.goButton.Name = "goButton";
            this.goButton.Size = new System.Drawing.Size(61, 23);
            this.goButton.TabIndex = 1;
            this.goButton.Text = "Go";
            this.goButton.UseVisualStyleBackColor = true;
            this.goButton.Click += new System.EventHandler(this.goButton_Click);
            // 
            // browser
            // 
            this.browser.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
                        | System.Windows.Forms.AnchorStyles.Left)
                        | System.Windows.Forms.AnchorStyles.Right)));
            this.browser.Location = new System.Drawing.Point(-2, -2);
            this.browser.MinimumSize = new System.Drawing.Size(20, 20);
            this.browser.Name = "browser";
            this.browser.ScriptErrorsSuppressed = true;
            this.browser.Size = new System.Drawing.Size(792, 650);
            this.browser.TabIndex = 2;
            this.browser.Navigating += new System.Windows.Forms.WebBrowserNavigatingEventHandler(this.browser_Navigating);
            this.browser.DocumentCompleted += new System.Windows.Forms.WebBrowserDocumentCompletedEventHandler(this.browser_DocumentCompleted);
            this.browser.Navigated += new System.Windows.Forms.WebBrowserNavigatedEventHandler(this.browser_Navigated);
            // 
            // resultBox
            // 
            this.resultBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
                        | System.Windows.Forms.AnchorStyles.Right)));
            this.resultBox.Location = new System.Drawing.Point(810, 40);
            this.resultBox.Multiline = true;
            this.resultBox.Name = "resultBox";
            this.resultBox.ReadOnly = true;
            this.resultBox.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.resultBox.Size = new System.Drawing.Size(256, 515);
            this.resultBox.TabIndex = 3;
            this.resultBox.Text = "IMPORTANT: For reliable measurements please read the documentation linked below!";
            // 
            // clearButton
            // 
            this.clearButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.clearButton.Location = new System.Drawing.Point(913, 667);
            this.clearButton.Name = "clearButton";
            this.clearButton.Size = new System.Drawing.Size(61, 23);
            this.clearButton.TabIndex = 4;
            this.clearButton.Text = "Clear";
            this.clearButton.UseVisualStyleBackColor = true;
            this.clearButton.Click += new System.EventHandler(this.clearButton_Click);
            // 
            // runsBox
            // 
            this.runsBox.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.runsBox.Location = new System.Drawing.Point(962, 14);
            this.runsBox.Name = "runsBox";
            this.runsBox.Size = new System.Drawing.Size(37, 20);
            this.runsBox.TabIndex = 5;
            this.runsBox.Text = "30";
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(12, 17);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(32, 13);
            this.label1.TabIndex = 6;
            this.label1.Text = "URL:";
            // 
            // panel1
            // 
            this.panel1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
                        | System.Windows.Forms.AnchorStyles.Left)
                        | System.Windows.Forms.AnchorStyles.Right)));
            this.panel1.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.panel1.Controls.Add(this.browser);
            this.panel1.Location = new System.Drawing.Point(12, 40);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(792, 650);
            this.panel1.TabIndex = 7;
            // 
            // label2
            // 
            this.label2.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(898, 17);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(58, 13);
            this.label2.TabIndex = 8;
            this.label2.Text = "Run Count";
            // 
            // linkLabel1
            // 
            this.linkLabel1.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.linkLabel1.AutoSize = true;
            this.linkLabel1.Enabled = false;
            this.linkLabel1.Location = new System.Drawing.Point(807, 651);
            this.linkLabel1.Name = "linkLabel1";
            this.linkLabel1.Size = new System.Drawing.Size(202, 13);
            this.linkLabel1.TabIndex = 9;
            this.linkLabel1.TabStop = true;
            this.linkLabel1.Text = "View reports stored at configured location";
            this.linkLabel1.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.linkLabel1_LinkClicked);
            // 
            // cancelTestsButton
            // 
            this.cancelTestsButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.cancelTestsButton.Location = new System.Drawing.Point(980, 667);
            this.cancelTestsButton.Name = "cancelTestsButton";
            this.cancelTestsButton.Size = new System.Drawing.Size(86, 23);
            this.cancelTestsButton.TabIndex = 10;
            this.cancelTestsButton.Text = "Cancel Tests";
            this.cancelTestsButton.UseVisualStyleBackColor = true;
            this.cancelTestsButton.Click += new System.EventHandler(this.cancelTestsButton_Click);
            // 
            // linkLabel2
            // 
            this.linkLabel2.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.linkLabel2.AutoSize = true;
            this.linkLabel2.Location = new System.Drawing.Point(807, 635);
            this.linkLabel2.Name = "linkLabel2";
            this.linkLabel2.Size = new System.Drawing.Size(184, 13);
            this.linkLabel2.TabIndex = 11;
            this.linkLabel2.TabStop = true;
            this.linkLabel2.Text = "View reports stored at central location";
            this.linkLabel2.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.linkLabel2_LinkClicked);
            // 
            // linkLabel3
            // 
            this.linkLabel3.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.linkLabel3.AutoSize = true;
            this.linkLabel3.Location = new System.Drawing.Point(807, 619);
            this.linkLabel3.Name = "linkLabel3";
            this.linkLabel3.Size = new System.Drawing.Size(108, 13);
            this.linkLabel3.TabIndex = 12;
            this.linkLabel3.TabStop = true;
            this.linkLabel3.Text = "Read Documentation";
            this.linkLabel3.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.linkLabel3_LinkClicked);
            // 
            // reportUrlBox
            // 
            this.reportUrlBox.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.reportUrlBox.Location = new System.Drawing.Point(810, 563);
            this.reportUrlBox.Name = "reportUrlBox";
            this.reportUrlBox.Size = new System.Drawing.Size(155, 20);
            this.reportUrlBox.TabIndex = 13;
            // 
            // setReportUrlButton
            // 
            this.setReportUrlButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.setReportUrlButton.Location = new System.Drawing.Point(971, 561);
            this.setReportUrlButton.Name = "setReportUrlButton";
            this.setReportUrlButton.Size = new System.Drawing.Size(95, 23);
            this.setReportUrlButton.TabIndex = 14;
            this.setReportUrlButton.Text = "Set Report URL";
            this.setReportUrlButton.UseVisualStyleBackColor = true;
            this.setReportUrlButton.Click += new System.EventHandler(this.setReportUrlButton_Click);
            // 
            // frameSizeLabel
            // 
            this.frameSizeLabel.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.frameSizeLabel.AutoSize = true;
            this.frameSizeLabel.Location = new System.Drawing.Point(807, 595);
            this.frameSizeLabel.Name = "frameSizeLabel";
            this.frameSizeLabel.Size = new System.Drawing.Size(98, 13);
            this.frameSizeLabel.TabIndex = 15;
            this.frameSizeLabel.Text = "Browser frame size:";
            // 
            // BrowserMonitorForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1078, 702);
            this.Controls.Add(this.frameSizeLabel);
            this.Controls.Add(this.setReportUrlButton);
            this.Controls.Add(this.reportUrlBox);
            this.Controls.Add(this.linkLabel3);
            this.Controls.Add(this.linkLabel2);
            this.Controls.Add(this.cancelTestsButton);
            this.Controls.Add(this.linkLabel1);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.panel1);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.runsBox);
            this.Controls.Add(this.clearButton);
            this.Controls.Add(this.resultBox);
            this.Controls.Add(this.goButton);
            this.Controls.Add(this.urlBox);
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "BrowserMonitorForm";
            this.Text = "Browser Monitor 2";
            this.SizeChanged += new System.EventHandler(this.BrowserMonitorForm_SizeChanged);
            this.Shown += new System.EventHandler(this.BrowserMonitorForm_Shown);
            this.Resize += new System.EventHandler(this.BrowserMonitorForm_Resize);
            this.ResizeEnd += new System.EventHandler(this.BrowserMonitorForm_ResizeEnd);
            this.panel1.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox urlBox;
        private System.Windows.Forms.Button goButton;
        private System.Windows.Forms.WebBrowser browser;
        private System.Windows.Forms.TextBox resultBox;
        private System.Windows.Forms.Button clearButton;
        private System.Windows.Forms.TextBox runsBox;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.LinkLabel linkLabel1;
        private System.Windows.Forms.Button cancelTestsButton;
        private System.Windows.Forms.LinkLabel linkLabel2;
        private System.Windows.Forms.LinkLabel linkLabel3;
        private System.Windows.Forms.TextBox reportUrlBox;
        private System.Windows.Forms.Button setReportUrlButton;
        private System.Windows.Forms.Label frameSizeLabel;

    }
}

