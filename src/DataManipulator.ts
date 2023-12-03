import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}


export class DataManipulator {
  /**
   * This function calculates the current ratio and compare it to the predetermined bounds. 
   * This is where the logic resides to trigger alerts if the ratio crosses these bounds.
   * @param serverRespond 
   * @returns 
   */
  static generateRow(serverRespond: ServerRespond[]): Row {
    // Calculate the average price for stock ABC by averaging the bid and ask prices.
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    // Calculate the average price for stock DEF by averaging the bid and ask prices.
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
    // Calculate the ratio of stock ABC's price to stock DEF's price.
    const ratio = priceABC / priceDEF;
    // Define the upper bound as 5% above 1.
    // Tested with 0.06, 0.07 but 0.05 had the best alerting behavior.
    const upperBound = 1 + 0.05;
    // Define the lower bound as 5% below 1.
    const lowerBound = 1 - 0.05;
    // Return a new row object containing the computed values and a timestamp.
    return {
      price_abc: priceABC,       // The average price of stock ABC.
      price_def: priceDEF,       // The average price of stock DEF.
      ratio,                     // The ratio of the two stock prices.
      // The most recent timestamp between the two stocks.
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
        serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: upperBound,   // The upper bound value.
      lower_bound: lowerBound,   // The lower bound value.
      // If the ratio exceeds the upper or lower bounds, set trigger_alert to the ratio value; otherwise, it's undefined.
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    };
  }
  
}
