import express, { type Express, type Request, type Response } from "express";
import type { APIResponse } from "./apiResponseType";

const app: Express = express();
const port = process.env.PORT ?? 42424;

const UPSTREAM_BASE_URL = "https://api.511.org/transit/StopMonitoring";
const DELIMITER = "|";
// express normalizes these to all be lower case
const RESPONSE_HEADERS_TO_FORWARD = new Set([
    "cache-control",
    "date",
    "expires",
    "pragma",
    "ratelimit-limit",
    "ratelimit-remaining",
    "set-cookie",
]);

// forward the request to the 511 api with all the same query params, except for:
// stopcodes: remove, split by "|", then use for filtering result
// format: remove, always specify `json`
// line_ids: remove, split by "|", then use for filtering result
// directions: remove, split by "|", then use for filtering result
app.get("/transit/StopMonitoring", async (req, res) => {
    const proxiedQueryString = new URLSearchParams(
        req.query as Record<string, string>,
    );
    // TODO: other ways of interpreting url arrays
    const allowedStopCodes = new Set(
        proxiedQueryString.get("stopcodes")?.split(DELIMITER),
    );
    const allowedLineIds = new Set(
        proxiedQueryString.get("line_ids")?.split(DELIMITER),
    );
    const allowedDirections = new Set(
        proxiedQueryString.get("directions")?.split(DELIMITER),
    );

    proxiedQueryString.delete("stopcodes");
    proxiedQueryString.delete("line_ids");
    proxiedQueryString.delete("directions");
    proxiedQueryString.delete("format");

    proxiedQueryString.set("format", "json");

    const urlToQuery = new URL(UPSTREAM_BASE_URL);
    urlToQuery.search = proxiedQueryString.toString();

    const start = performance.now();
    const apiResponse = await fetch(urlToQuery, {
        method: "GET",
        headers: {
            "User-Agent": "511-proxy",
        },
    });

    // forward some of the response headers
    const responseHeadersToForward = new Map(
        apiResponse.headers
            .entries()
            .filter(([key, value]) => RESPONSE_HEADERS_TO_FORWARD.has(key)),
    );
    res.setHeaders(responseHeadersToForward);

    if (!apiResponse.ok) {
        res.status(apiResponse.status).send(await apiResponse.text());
        return;
    }

    const downloadParseTime = performance.now();
    const responseJson = (await apiResponse.json()) as APIResponse;
    const originalNumVisits =
        responseJson.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit
            .length;
    // filter out the MonitoredStopVisits to only the ones specified
    responseJson.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit =
        responseJson.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit.filter(
            (visit) =>
                allowedStopCodes.size === 0 ||
                allowedStopCodes.has(visit.MonitoringRef),
        )
            .filter(
                (visit) =>
                    allowedLineIds.size === 0 ||
                    allowedLineIds.has(visit.MonitoredVehicleJourney.LineRef),
            )
            .filter(
                (visit) =>
                    allowedDirections.size === 0 ||
                    allowedDirections.has(
                        visit.MonitoredVehicleJourney.DirectionRef,
                    ),
            );

    const filterTime = performance.now();

    res.setHeaders(
        new Headers({
            "X-Original-Visit-Count": `${originalNumVisits}`,
            "X-Filtered-Visit-Count": `${
                responseJson.ServiceDelivery.StopMonitoringDelivery
                    .MonitoredStopVisit.length
            }`,
            "X-Upstream-Response-Time": `${Math.round(downloadParseTime - start)}`,
            "X-Processing-Time": `${Math.round(filterTime - downloadParseTime)}`,
        }),
    );

    res.status(200).json(responseJson);
});

app.listen(port, () => {
    console.log(`server running at port ${port}`);
});
