/* global showNotification */
$(document).ready(() => {
  // create user button
  const createUserForm = $('#createUserForm');
  createUserForm.on('submit', (e) => {
    if (createUserForm[0].checkValidity()) {
      const userObject = {
        user: {
          name: $('#userNameInput').val(),
        },
      };
      $.ajax({
        method: 'PUT',
        url: '/users',
        contentType: 'application/json',
        data: JSON.stringify(userObject),
      })
        .done((msg) => {
          showNotification(msg.message, 'success', false, '/');
        })
        .fail((msg) => {
          showNotification(msg.message, 'danger');
        });
    }
    createUserForm[0].classList.add('was-validated');
    e.preventDefault();
    e.stopPropagation();
  });

  // admin panel buttons
  const starCrawlingForm = $('#startCrawlingForm');
  starCrawlingForm.on('submit', (e) => {
    if (starCrawlingForm[0].checkValidity()) {
      $.ajax({
        method: 'POST',
        url: '/crawler/init/allrecipes',
        contentType: 'application/json',
        data: JSON.stringify({
          beginIndex: $('#inputBeginIndex').val(),
          endIndex: $('#inputEndIndex').val(),
        }),
      })
        .done((msg) => {
          showNotification(msg.message, 'success');
        })
        .fail((msg) => {
          showNotification(msg.message, 'danger');
        });
    }
    starCrawlingForm[0].classList.add('was-validated');
    e.preventDefault();
    e.stopPropagation();
  });

  const startUpdatingForm = $('#startUpdatingForm');
  startUpdatingForm.on('submit', (e) => {
    if (startUpdatingForm[0].checkValidity()) {
      $.ajax({
        method: 'POST',
        url: '/crawler/init/allrecipes',
        contentType: 'application/json',
        data: JSON.stringify({
          continueErrorCount: $('#inputErrorsToStop').val(),
        }),
      })
        .done((msg) => {
          showNotification(msg.message, 'success');
        })
        .fail((msg) => {
          showNotification(msg.message, 'danger');
        });
    }
    startUpdatingForm[0].classList.add('was-validated');
    e.preventDefault();
    e.stopPropagation();
  });

  $('#resetRecipesBtn').click(() => {
    $.ajax({
      method: 'DELETE',
      url: '/recipes',
    })
      .done((msg) => {
        showNotification(msg.message, 'success');
      })
      .fail((msg) => {
        showNotification(msg.message, 'danger');
      });
  });

  $('#resetIndexBtn').click(() => {
    $.ajax({
      method: 'DELETE',
      url: '/crawler/index',
    })
      .done((msg) => {
        showNotification(msg.message, 'success');
      })
      .fail((msg) => {
        showNotification(msg.message, 'danger');
      });
  });

  // user info buttons
  const updateUserForm = $('#updateUserForm');
  const keyIdMap = {
    calories: 'calories',
    proteinContent: 'protein',
    sugarContent: 'sugar',
    sodiumContent: 'sodium',
    fiberContent: 'fiber',
    fatContent: 'fat',
    carbohydrateContent: 'carbohydrate',
    cholesterolContent: 'cholesterol',
  };
  updateUserForm.on('submit', (e) => {
    const userId = $('body').attr('data-user');
    const userObject = {
      name: $('#userNameInput').val(),
      dailyTarget: {},
    };

    Object.entries(keyIdMap).forEach((item) => {
      const key = item[0];
      const id = item[1];

      const deleteCheckboxId = `#${id}DeleteCheckbox`;
      const inputValueId = `#${id}ValueInput`;
      const strategyId = `#${id}StrategyInput`;
      const inputValue = $(inputValueId).val();

      // if user is not deleting the field and the field is not empty, add to dailyTarget
      if (!$(deleteCheckboxId).is(':checked') && inputValue) {
        const goalObject = {
          value: parseInt(inputValue, 10),
          strategy: $(strategyId).val(),
        };
        userObject.dailyTarget[key] = goalObject;
      }
    });

    if (updateUserForm[0].checkValidity()) {
      $.ajax({
        method: 'PUT',
        url: '/users/edit',
        contentType: 'application/json',
        data: JSON.stringify({
          user: userObject,
          id: userId,
        }),
      })
        .done((msg) => {
          showNotification(msg.message, 'success', true);
        })
        .fail((msg) => {
          showNotification(msg.message, 'danger');
        });
    }
    updateUserForm[0].classList.add('was-validated');
    e.preventDefault();
    e.stopPropagation();
  });

  // filtered dishes button
  $('#deleteFilteredDishesBtn').click(() => {
    const userId = $('body').attr('data-user');
    const dishesToDelete = [];
    // get all the selected dishes
    $('.filtered-dish-delete-checkbox').each((index, checkbox) => {
      if (checkbox.checked) {
        dishesToDelete.push(checkbox.getAttribute('data-dish-id'));
      }
    });

    $.ajax({
      method: 'PUT',
      url: '/users/filtered/dishes/remove',
      contentType: 'application/json',
      data: JSON.stringify({
        userId,
        dishes: dishesToDelete,
      }),
    })
      .done((msg) => {
        showNotification(msg.message, 'success', true);
      })
      .fail((msg) => {
        showNotification(msg.message, 'danger');
      });
  });
});
