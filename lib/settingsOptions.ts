// Curated option lists for the Settings page's dropdowns. None of these are
// enforced/validated server-side (recon-backend/routes/settings.js treats
// every one of these fields as a plain string) — these lists exist purely to
// give the frontend a real, bounded set of choices instead of free text.

export const ORG_TYPE_OPTIONS = [
  'Financial Services',
  'Banking',
  'Insurance',
  'Accounting Firm',
  'Retail',
  'Technology',
  'Healthcare',
  'Manufacturing',
  'Government',
  'Non-Profit',
  'Other',
]

export const DATE_FORMAT_OPTIONS = [
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (30 Jun 2026)' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Jun 30, 2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-06-30)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (30/06/2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (06/30/2026)' },
]

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar ($)' },
  { value: 'GBP', label: 'GBP - British Pound (£)' },
  { value: 'EUR', label: 'EUR - Euro (€)' },
  { value: 'GMD', label: 'GMD - Gambian Dalasi (D)' },
  { value: 'NGN', label: 'NGN - Nigerian Naira (₦)' },
  { value: 'GHS', label: 'GHS - Ghanaian Cedi (₵)' },
  { value: 'KES', label: 'KES - Kenyan Shilling (KSh)' },
  { value: 'ZAR', label: 'ZAR - South African Rand (R)' },
  { value: 'XOF', label: 'XOF - West African CFA Franc (CFA)' },
  { value: 'EGP', label: 'EGP - Egyptian Pound (E£)' },
  { value: 'CAD', label: 'CAD - Canadian Dollar (C$)' },
  { value: 'AUD', label: 'AUD - Australian Dollar (A$)' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar (NZ$)' },
  { value: 'CHF', label: 'CHF - Swiss Franc (CHF)' },
  { value: 'JPY', label: 'JPY - Japanese Yen (¥)' },
  { value: 'CNY', label: 'CNY - Chinese Yuan (¥)' },
  { value: 'INR', label: 'INR - Indian Rupee (₹)' },
  { value: 'AED', label: 'AED - UAE Dirham (د.إ)' },
  { value: 'SAR', label: 'SAR - Saudi Riyal (﷼)' },
  { value: 'SGD', label: 'SGD - Singapore Dollar (S$)' },
  { value: 'HKD', label: 'HKD - Hong Kong Dollar (HK$)' },
  { value: 'SEK', label: 'SEK - Swedish Krona (kr)' },
  { value: 'NOK', label: 'NOK - Norwegian Krone (kr)' },
  { value: 'DKK', label: 'DKK - Danish Krone (kr)' },
  { value: 'PLN', label: 'PLN - Polish Zloty (zł)' },
  { value: 'BRL', label: 'BRL - Brazilian Real (R$)' },
  { value: 'MXN', label: 'MXN - Mexican Peso ($)' },
]

export const COUNTRY_OPTIONS = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo (DRC)', 'Congo (Republic)', 'Costa Rica', "Côte d'Ivoire", 'Croatia', 'Cuba', 'Cyprus',
  'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia',
  'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden',
  'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
]
