import { InternalApiResponse } from './InternalApiResponse';

export class PhoneNumberFormat {
  public static Validate(phoneNumber: string): InternalApiResponse<string> {
    const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    const resp = regex.test(phoneNumber);
    if (resp) {
      let newPhone = phoneNumber;
      if (phoneNumber.substring(0, 1).toString() === '0') newPhone = `233${phoneNumber.substring(1)}`;
      if (phoneNumber.substring(0, 1).toString() === '+') newPhone = phoneNumber.substring(1);
      return new InternalApiResponse<string>(true, newPhone, 'Successful');
    }
    return new InternalApiResponse<string>(false, phoneNumber, 'Failed');
  }
}
