# Ferment.at Client - raspberry pi

The document contains the setup steps required to get a raspberry pi up and running the official ferment.at client.

> Please note that although running the client on the Raspberry Pi is a supported configuration, it's up to you to support the Pi itself. The ferment.at support staff won't be able to help you with configuring the device.

## Initial Setup

Start with the official raspberry pi foundation distribution of raspian. Look for "Raw Images, Raspian" - [Downloads | Raspberry Pi](http://www.raspberrypi.org/downloads).

After creating a bootable SD card using the downloaded image, insert it into the pi, plug it into your wired network, and boot it up. Find the pi on your network by locating it's hostname in your router's DHCP client list, or whatever method you prefer. SSH in, run raspi-config, expand your boot partition, change your password, and reboot. Optionally, I also recommend (in raspi-config) going to the advanced options and changing your memory split to the smallest supported value - you don't be using the desktop on this pi, so free up as much RAM as you can.

Next, update all packages to current versions; `sudo apt-get update && sudo apt-get -y upgrade`.

After all updates have been applied, we will install node.js.

## Install node.js

Fortunately, node packages pre-compiled for the pi are available, so we don't need to spend hours compiling on the device.

Begin by determining the most recent version of node available in precompiled form. Browse to http://nodejs.org/dist/ and look in the newest version folder for a package containing `linux-arm-pi`. At the time of this writing, that turned out to be http://nodejs.org/dist/v0.10.21/node-v0.10.21-linux-arm-pi.tar.gz, although you may have to go back a few versions from the bleeding edge to find one that is precompiled.

Let's install the binary.

```sh
# Be sure to adjust each instance of node-VERSION-linux-arm-pi.tar.gz below.
cd && wget http://nodejs.org/dist/v0.10.21/node-v0.10.21-linux-arm-pi.tar.gz && tar xzf node-v0.10.21-linux-arm-pi.tar.gz
sudo mkdir -p /opt/node && sudo cp -R node-v0.10.21-linux-arm-pi/* /opt/node
```

The node binary will now be available at `/opt/node/bin/node`.

Let's clean up after ourselves a little bit, and make it easier to access the binary;

```sh
# Clean up.
rm -r ./node-v0.10.21-linux-arm-pi*

# Edit /etc/profile to include node in the path.
sudo nano /etc/profile

# Insert the following lines just above "export PATH":
NODE_JS_HOME="/opt/node"
PATH="$PATH:$NODE_JS_HOME/bin"
# Save the file. ^X Y [enter]
```

At this point you're done installing node. You can either log out and back in, or you can `source /etc/profile` to make the new path available. Then, you can check your node version;

```sh
pi@fermentat-client:~$ node --version
v0.10.21
```

## Install ferment.at-client

To begin with, we will require the node library `forever`, which will make sure our client process stays running at all times.

```sh
# The full path to npm is required here, since root doesn't have npm in it's path.
sudo /opt/node/bin/npm install -g forever
```

Installing forever can take quite some time, as it has many dependencies. After installation, running `forever list` should yeild "No forever processes running", indicating a successfull install.

> TODO client initial setup and configuration

## Setting up wireless (optional)

If you want to run your pi in a wireless configuration, I recommend the [Edimax EW-7811Un](http://www.amazon.com/gp/product/B003MTTJOY/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=B003MTTJOY&linkCode=as2&tag=seebreco-20) (associate link - thanks!).

While your pi is still connected to ethernet, ssh in and plug in the adapter. Next, edit your `/etc/network/interfaces` file to read like so;

    auto lo
    auto wlan0=wireless0

    iface lo inet loopback
    iface eth0 inet dhcp

    allow-hotplug wlan0

    iface wireless0 inet dhcp
    wpa-ssid SSID
    wpa-psk PASSWORD

Replacing **SSID** and **PASSWORD** with your own network information. Save your changes, and then manually cycle the interface;

```sh
sudo ifdown wlan0
sudo ifup wlan0=wireless0
```

You should see some setup messages followed by a successful DHCP lease if everything worked correctly.

If you need to add additional wireless APs, you can create additional `iface wirelessX inet dhcp` entries, and switch to them by changing the `auto wlan0=wirelessX` line accordingly. Your changes will not take effect until you reboot the device or manually cycle the interface as above.

## Setting up bonjour (optional)

I like my pi to show up on my network by hostname so I don't have to go hunt down the IP address all the time. I use [libnss-mdns](http://packages.debian.org/wheezy/i386/libnss-mdns) for handy multicast name resolution on unix systems, eg. Mac OSX. First, configure your hostname to whatever you want by editing `/etc/hostname`. Personally, I use a hostname of `fermentat-client`. Then set your new hostname with `hostname -F /etc/hostname`. You will need to log out and back in to see your changes.

Next, let's get libnss-mdns set up;

```sh
sudo apt-get update && sudo apt-get install -y libnss-mdns
```

After installation completes, you should be able to connect to your pi at `hostname.local`.
