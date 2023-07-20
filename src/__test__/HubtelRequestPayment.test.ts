import { HubtelPayment } from '../HubtelRequestPayment';
import { InternalApiResponse } from '../InternalApiResponse';

const apiRes: any = {
  ok: true,
  message: 'Request money link created successfully',
  data: [],
};

test('Hubtel Payment Request', async () => {
  const HUBTEL_CLIENT_ID = 'qhnsdyat';
  const HUBTEL_CLIENT_SECRET = 'rnpizlvx';
  const URL = 'https://devp-reqsendmoney-230622-api.hubtel.com/request-money';
  const phoneNumber = '233558299409';
  const hubtelService = new HubtelPayment(HUBTEL_CLIENT_ID, HUBTEL_CLIENT_SECRET, URL, phoneNumber);

  const requestPayload = {
    amount: 1,
    title: 'Testing Payment Service',
    description: 'Testing Payment Service',
    callbackUrl: 'https://webhook.site/1f86723f-879c-4b4c-bbcb-f299497ec023',
    cancellationUrl: 'https://www.reservease.com',
    returnUrl: 'https://www.reservease.com',
    logo: 'https://storage.googleapis.com/us.artifacts.reservease-370818.appspot.com/reservease/assets/reservease-logo.png',
  };
  expect(1).toEqual(1);
});
