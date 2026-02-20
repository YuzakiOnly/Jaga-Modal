export const countryCodes = [
    { value: "+62", label: "Indonesia (+62)", countryCode: "ID" },
    { value: "+1", label: "USA (+1)", countryCode: "US" },
    { value: "+44", label: "UK (+44)", countryCode: "GB" },
    { value: "+60", label: "Malaysia (+60)", countryCode: "MY" },
    { value: "+65", label: "Singapore (+65)", countryCode: "SG" },
    { value: "+63", label: "Philippines (+63)", countryCode: "PH" },
    { value: "+66", label: "Thailand (+66)", countryCode: "TH" },
    { value: "+84", label: "Vietnam (+84)", countryCode: "VN" },
    { value: "+81", label: "Japan (+81)", countryCode: "JP" },
    { value: "+82", label: "South Korea (+82)", countryCode: "KR" },
    { value: "+86", label: "China (+86)", countryCode: "CN" },
    { value: "+91", label: "India (+91)", countryCode: "IN" },
    { value: "+61", label: "Australia (+61)", countryCode: "AU" },
    { value: "+49", label: "Germany (+49)", countryCode: "DE" },
    { value: "+33", label: "France (+33)", countryCode: "FR" },
    { value: "+39", label: "Italy (+39)", countryCode: "IT" },
    { value: "+34", label: "Spain (+34)", countryCode: "ES" },
    { value: "+55", label: "Brazil (+55)", countryCode: "BR" },
    { value: "+52", label: "Mexico (+52)", countryCode: "MX" },
    { value: "+7", label: "Russia (+7)", countryCode: "RU" },
];

export const getCountryByValue = (value) => {
    return countryCodes.find(c => c.value === value) || countryCodes[0];
};

export const getCountryByCode = (code) => {
    return countryCodes.find(c => c.countryCode === code) || countryCodes[0];
};