import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [displayCurrency, setDisplayCurrency] = useState('TZS');
  const [ratesData, setRatesData] = useState({
    base_currency: 'TZS',
    supported_currencies: ['TZS', 'USD', 'NGN'],
    rates: [],
    last_updated: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/currency-rates');
      setRatesData(res.data);
    } catch (err) {
      console.warn('Could not fetch currency rates, using fallback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  /**
   * Helper to format price with authoritative base currency and optional estimate in selected display currency
   */
  const formatPrice = (amount, baseCurrency = 'TZS') => {
    const numAmount = Number(amount);
    const baseFormatted = `${baseCurrency} ${numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

    if (displayCurrency === baseCurrency) {
      return {
        baseFormatted,
        estimateFormatted: null,
        isEstimate: false,
      };
    }

    const rateObj = ratesData.rates?.find(
      (r) => r.quote_currency === displayCurrency
    );

    if (rateObj && rateObj.rate > 0) {
      const converted = numAmount * rateObj.rate;
      const symbol = displayCurrency === 'USD' ? '$' : displayCurrency === 'NGN' ? '₦' : '';
      const formattedEstimate = `≈ ${symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${displayCurrency}`;

      return {
        baseFormatted,
        estimateFormatted: formattedEstimate,
        isEstimate: true,
        source: rateObj.source,
      };
    }

    return {
      baseFormatted,
      estimateFormatted: null,
      isEstimate: false,
    };
  };

  return (
    <CurrencyContext.Provider
      value={{
        displayCurrency,
        setDisplayCurrency,
        supportedCurrencies: ratesData.supported_currencies || ['TZS', 'USD', 'NGN'],
        rates: ratesData.rates,
        lastUpdated: ratesData.last_updated,
        loading,
        formatPrice,
        refreshRates: fetchRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

