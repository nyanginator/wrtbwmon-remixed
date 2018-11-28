# wrtbwmon-remixed
https://github.com/nyanginator/wrtbwmon-remixed

* Adapted from https://code.google.com/p/wrtbwmon/.
* Uses HighCharts and HighStock under the non-commercial license (https://shop.highsoft.com/faq/non-commercial). For commercial use, please purchase a license from HighSoft.
* Uses CC0 code HighChartsAdapter and runOnLoad from https://code.iamkate.com.
* Uses SortTable from Stuart Langridge (https://www.kryogenix.org/code/browser/sorttable/).
* Uses Tabbed Content from menucool.com (http://www.menucool.com/tabbed-content).

Table of Contents
=================
* [What This Is](#what-this-is)
* [Setup](#setup)
  * [USB Drive](#usb-drive)
  * [Cron](#cron)
* [Viewing the Usage](#viewing-the-usage)
* [Config File](#config-file)
  * [Basic Settings](#basic-settings)
  * [Watch List](#watch-list)
* [Users File](#users-file)
* [Usage File](#usage-file)
  * [File Format](#file-format)
  * [Offset Grand Total](#offset-grand-total)
* [Freeing Up Space](#freeing-up-space)
  * [Backups](#backups)
  * [Reports](#reports)
  * [Usage](#usage)
  * [HTML](#html)
* [Resetting Usage](#resetting-usage)
* [Notes](#notes)
* [Contact](#contact)

What This Is
============
`wrtbwmon` is a popular bandwidth monitoring tool for WRT-based routers. This variant is a more featured version:
* Changed columns to:
  - User Name + MAC Address
  - Total Used
  - Total Dowloaded
  - Total Uploaded
  - Average Daily Total
  - Average Daily Download
  - Average Daily Upload
  - Today Total
  - Today Downloaded
  - Today Uploaded
  - Last Update (Last Seen)
* Added colors, download/upload icons, and formatting.
* Added sortable table columns.
* Added a table search filter and totals for filtered results.
* Added clickable rows for viewing detailed usage. Animated charts are viewable on tabs for daily, monthly, and yearly usage.
* Added a Grand Total row.
* Added a "Watch List" option, which will automatically turn on/off Internet for specifed user names based on a quota.
* Added a config file for easier setting of variables.

Original `wrtbwmon`
--------------------------------
![Original wrtbwmon](https://raw.githubusercontent.com/nyanginator/wrtbwmon-remixed/master/screenshots/screenshot-original.jpg)

`wrtbwmon-remixed`
-------------------------------
Main Page:

![wrtbwmon-remixed](https://raw.githubusercontent.com/nyanginator/wrtbwmon-remixed/master/screenshots/screenshot-remixed.jpg)

Watch List and Search Filter:

![wrtbwmon Filter/Watch List](https://raw.githubusercontent.com/nyanginator/wrtbwmon-remixed/master/screenshots/screenshot-filter-watchlist.jpg)

Details Page:

![wrtbwmon-remixed Details](https://raw.githubusercontent.com/nyanginator/wrtbwmon-remixed/master/screenshots/screenshot-details.jpg)

Setup
=====

USB Drive
---------
It's easiest to simply run the script off a USB drive plugged into the router. While this means your router needs to have a USB port, this option is more convenient than trying to hack the hardware or setup a network location for the script.

First go to the DD-WRT control panel and check that Services > USB are as follows:

* Core USB Support: Enable
* USB Storage Support: Enable
* Automatic Drive Mount: Enable

Format a USB drive and copy all of the `wrtbwmon-remixed` files onto it. Plug it into the router. You should see it show up under Services > USB with a path (e.g. `/dev/sda1`). Make note of the device (`sda1`) for setting up cron next.

Cron
----
Go to Administration > Management and find the `cron` section. At minimum, you should have:
```
* * * * * root /tmp/mnt/sda1/setup
*/4 * * * * root /tmp/mnt/sda1/update
*/15 * * * * root /tmp/mnt/sda1/publish
```
This will keep monitoring the traffic every minute (setup), update the usage numbers every 4 minutes (update), and publish to the router's webpage every 15 minutes (update). To speed up the process, SSH into the router and manually update and publish using the command:
```
$ /tmp/mnt/sda1/unp
```

In case the router resets, you can use the `restore` script to try restoring usage.db, users.txt, and the reports directory from the USB drive, assuming `backupmin` or `backupkeep` was used at some point to create a backup. To automate this, add these lines to cron:
```
* * * * * root /tmp/mnt/sda1/restore
15 */2 * * * root /tmp/mnt/sda1/backupmin
0 0 * * * root /tmp/mnt/sda1/backupkeep
```
The `restore` script checks to see if usage.db is missing (which it would be if the router was reset). If it is, then a restore is attempted. File and folder permissions are refreshed as well. The `backupmin` line copies usage.db, users.txt, and the reports directory to the USB drive every 2 hours. The `backupkeep` line makes a daily backup to the `backups` directory on the USB drive.

If there is a set day to reset everybody's quota, you can add a line for that as well:
```
0 0 1 * * root /tmp/mnt/sda1/reset
```
This line resets everybody's quota on the first of every month.

Viewing the Usage
=================
After the script has been properly setup, updated, and published, you can view the table and graphs at:
```
http://192.168.1.1/user/usage.htm
```
If you specify `WWWSUBDIR` in the config file, then you need to adjust the path accordingly. For example:
```
http://192.168.1.1/user/WWWSUBDIR/usage.htm
```

Config File
===========

Basic Settings
--------------
The config file stores mostly optional information. Fill them in according to your preferences.
* `AXISSTARTDATE` - Unix time for what the earliest date on the graph axis should be.
* `PAGETITLE` - Set your page title here.
* `HEADING` - Set a page subtitle/heading here.
* `DESCRIPTION` - Set a page description here.
* `MBTOTALQUOTA` - This is displayed in the Grand Total row, to let users now what the grand total quota is.
* `WWWSUBDIR` - Optional subdirectory.

Watch List
----------
The Watch List is a feature to automatically turn on/off Internet access for devices matching a certain name. The name must be defined in the users.txt file. Watch Lists show up at the top of the page when users are either close to or have exceeded their quota. You can define as many Watch Lists as you want, but be sure to update the `wrtbwmon` script to include them.

* `WATCHLISTSTEP` - When users on the Watch List are within 2 increments of this value (in MB), they will show up in the Watch List.
* `MBQUOTAPERSTUDENT` - The "Students" Watch List quota.
* `STUDENTWATCHLISTTITLE` - Title for this Watch List.
* `STUDENTWATCHLISTARRAY` - A space-separated string of names. Names themselves cannot have spaces. For example, `Apple` will match `Apple TV`, `Apple iPad`, and `Apple iPhone`. If the `Apple` user is over the set quota, then all 3 devices will have their Internet shut off. If you want to grant Internet access to user over their quota, prefix their name with `SKIP_`.

Another pre-defined Watch List:
* `MBQUOTAPERGUEST` - The "Guests" Watch List quota.
* `GUESTWATCHLISTTITLE` - Title for this Watch List.
* `GUESTWATCHLISTARRAY` - Guest Watch List array.

Users File
==========

In the `users.txt` file, devices are distinguished by their MAC addresses. Like the original `wrtbwmon`, you can define arbitrary names in users.txt to make it easier to identify each one. The format for each line is a MAC address followed by a comma and name for a single device. Double-quotes are not allowed. For example:
```
12:ab:34:cd:56:ef, Dad's Laptop
34:cd:56:ef:78:gh, Dad's Desktop
```

Usage File
==========

File Format
-----------
The `usage.db` file stores usage information of devices in only the current cycle (since the last reset, or since the script was first run). As with the `users.txt` file, devices are still identified by MAC address. The format is as follows:
```
[MAC address],[kB downloaded],[kB uploaded],[not in use],[not in use],[Unix time of Last Update]
```
There are 2 numbers that used to specify peak/offpeak usage that are currently not in use.

Offset Grand Total
------------------
If you are trying to synchronize the Grand Total to the usage reported by your ISP and you find the numbers differ, you can offset it by adding a line with:

```
00:00:00:00:00:00,0,<OFFSET>,0,0,0
```

where `OFFSET` is the amount of kilobytes to offset (e.g. 11G = 11000000).


Freeing Up Space
================

Backups
-------
I recommend a USB drive with 2GB of space, depending on how often you clean out old files. Backups can be safely removed from:

* bkup/
* monthlybkup/

Reports
-------
The `reports` directory stores information on all devices that have ever conected to the router. You can find the daily, monthly, and yearly `.db` files by MAC address and delete devices individually. Note that if you delete files from this directory, you should also delete them from `/tmp/reports`, which is the live copy used for the webpage. The `backupmin` and `backupkeep` commands are what copy the `reports` directory to the USB drive.

Usage
-----
You can also delete lines from the `usage.db` file as you see fit. As with the `reports` directory, remember to also update the `/tmp/usage.db` file.

HTML
----
The webpage files are stores in `/tmp/www`. You can delete whatever files you need to here. On the next `publish`, the necessary HTML files will be regenerated from the `/tmp/reports` directory.

Resetting Usage
===============
The command to reset everybody's usage data back to zero is:
```
$ /tmp/mnt/sda1/reset
```
This clears out the usage.db file except for one line, which looks something like:
```
COUNTERSTART,0,0,0,0,1530417601
```
The `COUNTERSTART` keyword specifies that the last value on this line is the Unix date denoting the start of this usage cycle. It will show up on the usage page as "Last reset on Sun Jul-01 00:00 EDT 2018".

Of course, after resetting, all devices whose Internet was shut off by the Watch List will have their access resumed.


Notes
=====
* Make sure your USB drive is functioning properly.
* The code is not as optimized as it could be, as this project was more of an exercise for me to explore scripting in the limited `ash` shell and play around with some of the possibilities of DD-WRT on my router. Consequently, I was more focused on functionality over performance.
* I have only tested the script on NETGEAR routers running DD-WRT on a network having no more than about 15-20 connected devices.

Contact
=======
Nicholas Yang\
http://nyanginator.wixsite.com/home
