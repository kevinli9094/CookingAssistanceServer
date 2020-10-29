/* eslint-disable no-unused-vars, no-param-reassign */
// show notification popup
const showNotification = (msg, type, reloadPage, redirect) => {
  // defaults to false
  reloadPage = reloadPage || false;

  // defaults to null
  redirect = redirect || null;

  // Check for message or fallback to unknown
  if (!msg) {
    msg = 'Unknown error has occured. Check inputs.';
  }

  $('#notify_message').removeClass();
  $('#notify_message').addClass(`alert-${type}`);
  $('#notify_message').html(msg);
  $('#notify_message').slideDown(600).delay(2500).slideUp(600, () => {
    if (redirect) {
      window.location = redirect;
    }
    if (reloadPage === true) {
      window.location.reload();
    }
  });
};

const isEmptyString = (str) => (str.length === 0 || !str.trim());

const visibleField = {
  calories: null,
  carbohydrate: 'g',
  cholesterol: 'mg',
  fat: 'g',
  fiber: 'g',
  protein: 'g',
  saturatedFat: 'g',
  sodium: 'mg',
  sugar: 'g',
};
