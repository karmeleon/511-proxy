# 511-proxy

`511.org/transit/StopMonitoring` is a very useful API for getting real-time transit arrival data for transit systems in the SF Bay Area. Unfortunately, it offers little in the way of filtering that data down. You can either provide a `stopcode` URL param and get arrivals for one single stop, or you can omit the param and get arrivals for _every stop in the system_. This adds up to anywhere between 5MB and 30MB for SFMTA depending on the time of day. With a normal computer this isn't a big deal, but when working with [small embedded systems](https://github.com/karmeleon/inkplate_muni) it's unusably large. Requesting multiple individual stops is also a non-starter due to the 60 request per hour rate limit on the endpoint.

511-proxy is a simple Express app that works as a proxy to the `StopMonitoring` endpoint and accepts most of the same URL parameters. However, it filters the arrivals down with a more useful set of params.

## Usage

### Consuming

This app is running live on my personal server. Simply obtain a 511.org API key and hit `511-proxy.wn.zone`:

```
https://511-proxy.wn.zone/transit/StopMonitoring?api_key=your-api-key&agency=SF&stopcodes=12345|67890&line_ids=5R|N|38&directions=IB|OB|N|S|W|E
```

This returns the same API response format as the normal `StopMonitoring` endpoint, but with the `MonitoredStopVisit` array cut down to only the specified stop codes, lines, and directions specified in the URL. You may omit some or all of the filter params as you see fit.

Additionally, the hosted version of this API supports both `https` and `http` for embedded applications, and does not gzip/brotli encode anything.

### Hosting

Don't trust me with your 511 API key? Run it yourself.

```
npm i
npm run build
npm run start
```

**OR**

```
docker run -p 42424:42424 karmeleon/511-proxy
```
