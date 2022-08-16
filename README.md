# STEP-CurrencyService

Modified version of the Dynatrace Currency Service for STEP Labs

# Setup

- Once you've cloned the repository, you'll need to install the npm dependencies in order to run the service. These are listed in the `package.json` file. You can install them by running:

```
npm install
```

- Run the `devstartup` script in the `/bin` folder to start the Currency Service. There are three options you can utilize:

```
./bin/devstartup vanilla
```

will run the Currency Service in vanilla mode on port 7000 without any instrumentations or debug options.

```
./bin/devstartup instrument
```

will run the Currency Service with OpenTelemetry instrumentation on port 7000.

```
./bin/devstartup debug
```

will run the Currency Service with OpenTelemetry instrumentation on port 7000 with all debug options enabled.

# Technologies

- Node.js 16.13.1

# Environment Variables

- `DT_TENANT_URL_CS` The URL of the OpenTelemetry collector (Dynatrace API)
- `DT_API_TOKEN_CS` The Authorization token for the Dynatrace API
- `PORT` The port the Currency Service will be run on
