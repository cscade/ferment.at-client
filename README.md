![Logo](http://77e48a193d773bf87095-ed78355e050836447af92afb2cca79ca.r2.cf2.rackcdn.com/ferment.at-logo_200.png)

# ferment.at Client

The official client software for the ferment.at cloud fermentation logging service.

**Please note that ferment.at is not yet live. The complete toolset and API is currently in development, and the service will go live shortly.**

## Overview

ferment.at is composed of two primary parts;

1. The ferment.at Service, a closed-source platform-as-a-service available at [https://ferment.at](https://ferment.at).
2. The ferment.at Client (this project), an open-source program that runs on your local network at your brewery.

In a nutshell, the Client runs on your hardware on your network at your brewery, connected to your various fermentation process controllers. It records fermentation and process data from your controllers, and forwards it to ferment.at using our [public API](https://github.com/cscade/ferment.at-api).

Because the client runs on your local network and only communicates process data *out*, there is no need for opening firewall ports, or other security concerns.

The Client locally caches process data before periodically sending it to the Service. In the event that your internet connection at the brewery goes down, or some other network problem gets in the way, your data will be saved until the Client can reconnect.

In addition to locally caching your data to avoid loss from network interruptions, the Client can also be configured to run in a read-only environment (no writable hard drive), enabling it to be deployed on dirt cheap hardware like a [Raspberry Pi](http://www.raspberrypi.org/) without sacrificing long term durability or stability. For more information see the section on read-only deployments below.

## Getting Started

> TODO basic deployment instructions

## Controllers

Multiple process controllers can be connected to each Client, and multiple process values can be recorded from each controller. Your options are essentially limitless in terms of flexibility for what data you want to collect from where for a given fermentation.

> TODO controller setup and configuration documentation

### Talking to Controllers

The Client talks to different fermentation process controllers via "adapters". Adapters are simple wrappers for communicating over a network with a given controller, and allow the Client to work with all different types of controllers interchangeably.

At this time there is one officially supported adapter, which connects the Client to temperature probes on the BCS-460 and BCS-462 process controllers produced by [Embedded Control Concepts](http://embeddedcontrolconcepts.com/).

**Official Adapters**

* [BCS-46x Adapter](https://github.com/cscade/fermentat-contrib-adapter-bcs-46x)

## Read-only Deployments

> TODO instructions for raspberry pi in read-only mode

## Contributing

Contributions to this project are very welcome! Simply open a pull request when you feel you have a useful contribution. If you're considering adding something non-trivial, consider opening a ticket for discussion first to avoid duplicated work.

The official client will always reflect the recommended patterns for interfacing with ferment.at, and use only supported, public APIs.

### Versioning Pattern

This project follows the [Semantic Versioning 2.0.0](http://semver.org/) pattern.

### 3rd Party Clients

Although this project represents the official ferment.at Client, 3rd party clients that conform to the [public API](https://github.com/cscade/ferment.at-api) specification are just fine too. If you have a client designed for another language or platform, contact me and I will list it here.

## License

(The MIT License)

Copyright © 2013 Carson S. Christian <cscade@gmail.com>
