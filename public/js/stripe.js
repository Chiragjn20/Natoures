/* eslint-disable */
import axios from 'axios';

import { showAlert } from './alerts';

export const bookTour = async tourId => {
  const stripe = require('stripe')('pk_test_51LSJbOSFdm3GHz44q0wn12GrD5WnHeKWHBZ6ZGi6Ak2eXtRYDSu60qmeDuSrZIYn0wcr6iPlvAibAS99qFzfAyRT00W2xF7Hbe');
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
  
    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
