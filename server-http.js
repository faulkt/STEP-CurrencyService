const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('pino');
const { exception } = require('console');

const PORT = process.env.PORT;

const exchangerateAPI = 'http://api.exchangeratesapi.io/v1/latest?access_key=34bc562f6f51499e3ed8bc437cc83560';

const logger = pino({
    name: 'currencyservice-server',
    messageKey: 'message',
    level: 'info',
});

const app = express();
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());


/**
 * Helper function that gets currency data from a stored JSON file
 * Uses public data from European Central Bank
 */
function _getCurrencyData(callback) {
    const data = require('./data/currency_conversion.json');
    callback(data);
}

/**
 * Helper function that handles decimal/fractional carrying
 */
 function _carry(amount) {
    const fractionSize = Math.pow(10, 9);
    amount.nanos += (amount.units % 1) * fractionSize;
    amount.units =
      Math.floor(amount.units) + Math.floor(amount.nanos / fractionSize);
    amount.nanos = amount.nanos % fractionSize;
    return amount;
  }


  function convert(from, to_code, callback) {
    const api = exchangerateAPI;
    const url = `${api}&base=${from.currency_code}&symbols=${to_code}`;
 
    _getCurrencyData((data) => {
      const euros = _carry({
        units: from.units / data[from.currency_code],
        nanos: from.nanos / data[from.currency_code],
      });
      euros.nanos = Math.round(euros.nanos);
      // Convert: EUR --> to_currency
      const result = _carry({
        units: euros.units * data[to_code],
        nanos: euros.nanos * data[to_code],
      });
      result.units = Math.floor(result.units);
      result.nanos = Math.floor(result.nanos);
      result.currency_code = to_code;
      logger.info(`Conversion request successful`);
      callback(null, result);
    });
  }


  app.post('/convert', async (req, res, next) => {
      try {
        logger.info('Received conversion request');
        logger.info(req.headers)
        logger.info(req.body)
      const { from, to } = req.body;
      convert(from, to, (converterr, convertres) => {
          if (converterr) return next(converterr);
          return res.json(convertres);
      });
      }
      catch (err) {
        logger.error(`Conversion request failed: ${err}`);
        return next(error);
      }
      
  });

  function errorHandler(err, req, res, next) {
      if (res.headerSent) {
          return next(err);
      }
      res.status(500);
      res.json(err);
  }

  app.use(errorHandler);

  app.listen(PORT, () => {
      logger.info(`Starting HTTP server on port ${PORT}`);
  });