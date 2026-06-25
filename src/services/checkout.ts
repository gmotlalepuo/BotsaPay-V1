import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

type CheckoutReturnInput = {
  flow: 'topup' | 'qr-card';
  referenceId?: string;
};

function appendCheckoutSessionTemplate(url: string) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}session_id={CHECKOUT_SESSION_ID}`;
}

export function createCheckoutReturnUrls({ flow, referenceId }: CheckoutReturnInput) {
  const baseParams = {
    flow,
    ...(referenceId ? { referenceId } : {}),
  };

  const successUrl = Linking.createURL('/checkout/return', {
    queryParams: { ...baseParams, status: 'success' },
  });
  const cancelUrl = Linking.createURL('/checkout/return', {
    queryParams: { ...baseParams, status: 'cancelled' },
  });

  return {
    successUrl: flow === 'topup' ? appendCheckoutSessionTemplate(successUrl) : successUrl,
    cancelUrl,
    redirectUrl: Linking.createURL('/checkout/return'),
  };
}

export async function openCheckoutSession(checkoutUrl: string, redirectUrl: string) {
  return WebBrowser.openAuthSessionAsync(checkoutUrl, redirectUrl, {
    dismissButtonStyle: 'cancel',
    preferEphemeralSession: true,
  });
}

export function parseCheckoutReturnUrl(url: string) {
  const parsed = Linking.parse(url);
  const queryParams = parsed.queryParams ?? {};

  return {
    status: typeof queryParams.status === 'string' ? queryParams.status : undefined,
    flow: typeof queryParams.flow === 'string' ? queryParams.flow : undefined,
    referenceId: typeof queryParams.referenceId === 'string' ? queryParams.referenceId : undefined,
    sessionId: typeof queryParams.session_id === 'string' ? queryParams.session_id : undefined,
  };
}
