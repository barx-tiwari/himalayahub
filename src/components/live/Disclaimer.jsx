import { Info } from 'lucide-react';

export default function Disclaimer({ children, className = '' }) {
  return <p className={`disclaimer ${className}`}><Info aria-hidden="true" /><span>{children}</span></p>;
}

export const FINANCE_DISCLAIMER = 'Market information is provided for informational purposes and may be delayed. This is not financial advice.';
export const WEATHER_DISCLAIMER = 'Forecasts can change. Check official local advisories before making travel decisions.';
export const HEALTH_DISCLAIMER = 'This tool is for general information and is not a medical diagnosis.';
