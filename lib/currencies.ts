import type { Currency } from "@/types";

export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", decimal_places: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimal_places: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", decimal_places: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", decimal_places: 0 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimal_places: 2 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", decimal_places: 2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", decimal_places: 2 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", decimal_places: 2 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", decimal_places: 2 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", decimal_places: 0 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", decimal_places: 2 },
  { code: "MXN", name: "Mexican Peso", symbol: "$", decimal_places: 2 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", decimal_places: 2 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", decimal_places: 2 },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", decimal_places: 2 },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", decimal_places: 2 },
  { code: "DKK", name: "Danish Krone", symbol: "kr", decimal_places: 2 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", decimal_places: 2 },
  { code: "ZAR", name: "South African Rand", symbol: "R", decimal_places: 2 },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", decimal_places: 2 },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", decimal_places: 2 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", decimal_places: 2 },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", decimal_places: 2 },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", decimal_places: 2 },
  { code: "THB", name: "Thai Baht", symbol: "฿", decimal_places: 2 },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", decimal_places: 0 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", decimal_places: 2 },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", decimal_places: 2 },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", decimal_places: 2 },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪", decimal_places: 2 },
  { code: "CLP", name: "Chilean Peso", symbol: "$", decimal_places: 0 },
  { code: "ARS", name: "Argentine Peso", symbol: "$", decimal_places: 2 },
  { code: "COP", name: "Colombian Peso", symbol: "$", decimal_places: 2 },
  { code: "EGP", name: "Egyptian Pound", symbol: "£", decimal_places: 2 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", decimal_places: 2 },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", decimal_places: 3 },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼", decimal_places: 2 },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BD", decimal_places: 3 },
  { code: "OMR", name: "Omani Rial", symbol: "﷼", decimal_places: 3 },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼", decimal_places: 0 },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د", decimal_places: 3 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", decimal_places: 2 },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", decimal_places: 2 },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", decimal_places: 0 },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$", decimal_places: 2 },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", decimal_places: 2 },
  { code: "RON", name: "Romanian Leu", symbol: "lei", decimal_places: 2 },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв", decimal_places: 2 },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn", decimal_places: 2 },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", decimal_places: 2 },
];

export function getCurrency(code: string): Currency | undefined {
  return currencies.find((c) => c.code === code);
}

export function getCurrencySymbol(code: string): string {
  return getCurrency(code)?.symbol ?? code;
}
