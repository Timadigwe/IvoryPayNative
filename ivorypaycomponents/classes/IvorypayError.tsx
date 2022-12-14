/**
 * IvoryPay Error
 */

export default class IIvoryPayError{
  /**
   * Error message
   * @var string
   */
  message: string;

  /**
   * Error code
   * @var number
   */
  errCode: number;

  /**
   *
   * @param message The Error message gotten from IvoryPay
   * @param errCode The Error code
   */
  constructor(message: string, errCode: number) {
    this.message = message;
    this.errCode = errCode;
  }
}
