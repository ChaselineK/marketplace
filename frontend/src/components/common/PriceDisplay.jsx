import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export default function PriceDisplay({ amount, baseCurrency = 'TZS', size = 'normal', showEstimateLabel = true }) {
  const { formatPrice } = useCurrency();
  const { baseFormatted, estimateFormatted, isEstimate } = formatPrice(amount, baseCurrency);

  const sizeClasses = {
    small: 'text-sm font-semibold',
    normal: 'text-base font-bold',
    large: 'text-2xl font-extrabold',
  }[size] || 'text-base font-bold';

  return (
    <div className="flex flex-col">
      <span className={`${sizeClasses} text-stone-900 tracking-tight`}>
        {baseFormatted}
      </span>
      {isEstimate && estimateFormatted && (
        <span className="text-xs text-stone-500 font-medium mt-0.5" title="Estimated conversion rate">
          {estimateFormatted}
          {showEstimateLabel && <span className="text-[10px] text-stone-400 ml-1">(est.)</span>}
        </span>
      )}
    </div>
  );
}
