# Testing

To test this library a helper app has been provided (`test.js`).

## Testing procedure

To test the application start the test application with `node test.js`. Then execute the below two curl commands.

- `curl http://localhost:3000`
- `curl http://localhost:3000/metrics`

The latter endpoint should return metrics for the first curl command that you executed. A sample response has been
included below for reference.

```
# HELP server_connections_total The total tcp socket connections created
# TYPE server_connections_total counter
server_connections_total{address="[::]:3000"} 3

# HELP server_connections The current number connected tcp sockets
# TYPE server_connections gauge
server_connections{address="[::]:3000"} 1

# HELP server_requests_in_flight The number of http requests in flight
# TYPE server_requests_in_flight gauge
server_requests_in_flight{address="[::]:3000"} 1

# HELP server_unused_connections The current number of tcp sockets yet to be used
# TYPE server_unused_connections gauge
server_unused_connections{address="[::]:3000"} 0

# HELP http_requests_total Total number of HTTP requests made.
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/metrics",code="200"} 1
http_requests_total{method="GET",path="/",code="200"} 1

# HELP http_request_duration_seconds The HTTP request latencies in seconds.
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.005",method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="0.01",method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="0.025",method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="0.05",method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="0.1",method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="0.25",method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="0.5",method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="1",method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="2.5",method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="5",method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="10",method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="+Inf",method="GET",path="/metrics"} 1
http_request_duration_seconds_sum{method="GET",path="/metrics"} 0.00317
http_request_duration_seconds_count{method="GET",path="/metrics"} 1
http_request_duration_seconds_bucket{le="0.005",method="GET",path="/"} 1
http_request_duration_seconds_bucket{le="0.01",method="GET",path="/"} 1
http_request_duration_seconds_bucket{le="0.025",method="GET",path="/"} 1
http_request_duration_seconds_bucket{le="0.05",method="GET",path="/"} 1
http_request_duration_seconds_bucket{le="0.1",method="GET",path="/"} 1
http_request_duration_seconds_bucket{le="0.25",method="GET",path="/"} 1
http_request_duration_seconds_bucket{le="0.5",method="GET",path="/"} 1
http_request_duration_seconds_bucket{le="1",method="GET",path="/"} 1
http_request_duration_seconds_bucket{le="2.5",method="GET",path="/"} 1
http_request_duration_seconds_bucket{le="5",method="GET",path="/"} 1
http_request_duration_seconds_bucket{le="10",method="GET",path="/"} 1
http_request_duration_seconds_bucket{le="+Inf",method="GET",path="/"} 1
http_request_duration_seconds_sum{method="GET",path="/"} 0.001569583
http_request_duration_seconds_count{method="GET",path="/"} 1
```
