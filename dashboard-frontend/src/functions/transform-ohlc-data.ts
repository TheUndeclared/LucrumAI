import { OHLCData, OHLCVPairItem } from "@/types";

/**
 * Transform the OHLC Data for ApexCharts
 *
 * The OHLC data which received from the API needs to be transformed into
 * the format required by ApexCharts.
 * ApexCharts expects an array of objects where each object represents a
 * candlestick with x (timestamp) and y (OHLC values).
 *
 * @param ohlcData Object
 * @returns Array
 */
export const transformOHLCData = (ohlcData: OHLCData) => {
  return ohlcData?.t?.map((timestamp, index) => ({
    x: new Date(timestamp * 1000), // Convert Unix timestamp to JavaScript Date
    y: [
      Number(ohlcData.o[index].toFixed(2)), // Open
      Number(ohlcData.h[index].toFixed(2)), // High
      Number(ohlcData.l[index].toFixed(2)), // Low
      Number(ohlcData.c[index].toFixed(2)), // Close
    ],
  }));
};

/**
 * Transform the OHLC Data for ApexCharts
 *
 * The OHLC data which received from the API needs to be transformed into
 * the format required by ApexCharts.
 * ApexCharts expects an array of objects where each object represents a
 * candlestick with x (timestamp) and y (OHLC values).
 *
 * @param ohlcData Object
 * @returns Array
 */
export const transformOHLCVPairItems = (ohlcvPairItems: OHLCVPairItem[]) => {
  return ohlcvPairItems?.map((item) => ({
    x: new Date(item.unixTime * 1000), // Convert Unix timestamp to JavaScript Date
    y: [
      Number(item.o.toFixed(2)), // Open
      Number(item.h.toFixed(2)), // High
      Number(item.l.toFixed(2)), // Low
      Number(item.c.toFixed(2)), // Close
    ],
  }));
};
