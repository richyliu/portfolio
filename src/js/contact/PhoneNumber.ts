/**
 * A PhoneNumber stores a formatted phone number in a way that is able to keep all numbers uniform.
 */
class PhoneNumber {
	/**
	 * The whole phone number as a string, with no formatting.
	 */
	public number: string;

	/**
	 * The country code. Defaults to 1.
	 */
	public countryCode: string;

	/**
	 * The area code of the phone number.
	 */
	public areaCode: string; // first 3/10 digits

	/**
	 * The middle three digits of a phone number.
	 */
	public prefix: string; // second 3/10 digits

	/**
	 * The last four digits of the phone number
	 */
	public lineNumber: string; // last 4 digits

	/**
	 * Creates a PhoneNumber.
	 * @param phoneNumber - Either a string or a number. They will be formatted such that they have at least 10 digits, with zeros filling from the left until there are 10 digits.
	 */
	constructor(phoneNumber: string | number) {
		if (typeof phoneNumber === "number") {
			phoneNumber = phoneNumber.toString(10);
		} else {
			phoneNumber = phoneNumber.replace(/\D/g, "");// Anything that's not a number is removed.
		}
		if (phoneNumber.length < 10) {
			phoneNumber = String("0").repeat(10 - phoneNumber.length) + phoneNumber;//add padding for phone numbers that start with zero that may have been stripped
		}
		this.number = phoneNumber;
		this.countryCode = phoneNumber.length < 10 ? "1" : phoneNumber.slice(0,phoneNumber.length - 10), 10;
		this.areaCode = phoneNumber.slice(-10, -7);
		this.prefix = phoneNumber.slice(-7, -4);
		this.lineNumber = phoneNumber.slice(-4);
	}

	/**
	 * Returns the phone number as a formatted string.
	 * @param intl - Whether to include the country code when the country code is +1 (USA). Area codes are always returned for non-us numbers.
	 */
	public getFormattedNumber(intl: boolean=false) {
		return ((intl || this.countryCode != "1") ? "+" + this.countryCode : "") + " (" + this.areaCode + ") " +
			this.prefix + "-" + this.lineNumber;
	}



}

export default PhoneNumber;
export {PhoneNumber};