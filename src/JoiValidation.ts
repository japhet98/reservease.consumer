import { InternalApiResponse } from './InternalApiResponse';

export class JoiValidation<T> {
  private readonly Schema: any;

  constructor(schema: any) {
    this.Schema = schema;
  }

  public async Validate(data: any) {
    try {
      const value = await this.Schema.validateAsync(data);
      return new InternalApiResponse<T>(true, value);
    } catch (err) {
      const errorData: any = null;
      return new InternalApiResponse<T>(false, errorData, this.FormatJoiError(err));
    }
  }
  private FormatJoiError(error: any) {
    return `Validation error: ${error.details.map((x: any) => x.message).join(', ')}`;
  }
}
