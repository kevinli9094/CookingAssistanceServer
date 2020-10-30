/* global showNotification isEmptyString visibleField */
$(document).ready(() => {
  // functions for modal's confirm buttons
  const deleteRecipe = () => {
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
  };

  const resetIndex = () => {
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
  };

  const deleteUser = () => {
    const userId = $('#navBar').attr('data-user');
    $.ajax({
      method: 'DELETE',
      url: '/users',
      contentType: 'application/json',
      data: JSON.stringify({
        userId,
      }),
    })
      .done((msg) => {
        showNotification(msg.message, 'success', false, '/');
      })
      .fail((msg) => {
        showNotification(msg.message, 'danger');
      });
  };

  const modalConfirmFunctionMap = {
    deleteRecipe, resetIndex, deleteUser,
  };

  // setup bootstrap model
  const modal = $('#modal');
  modal.on('show.bs.modal', (event) => {
    const button = $(event.relatedTarget); // Button that triggered the modal
    const title = button.data('title');
    const message = button.data('message');
    const functionName = button.data('function');

    modal.find('.modal-title').text(title);
    modal.find('.modal-body').text(message);

    modal.find('#modalConfirmBtn').off('click').click(() => {
      modalConfirmFunctionMap[functionName]();
    });
  });

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
          beginIndex: parseInt($('#inputBeginIndex').val(), 10),
          endIndex: parseInt($('#inputEndIndex').val(), 10),
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
          continueErrorCount: parseInt($('#inputErrorsToStop').val(), 10),
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
    const userId = $('#navBar').attr('data-user');
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

  // filtered dishes delete button
  $('#deleteFilteredDishesBtn').click(() => {
    const userId = $('#navBar').attr('data-user');
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

  // filtered dishes delete button
  $('#deleteIngredientsBtn').click(() => {
    const userId = $('#navBar').attr('data-user');
    const ingredientsToDelete = [];
    // get all the selected ingredients
    $('.ingredient-delete-checkbox').each((index, checkbox) => {
      if (checkbox.checked) {
        ingredientsToDelete.push(checkbox.getAttribute('data-ingredient'));
      }
    });

    $.ajax({
      method: 'PUT',
      url: '/users/ingredients/remove',
      contentType: 'application/json',
      data: JSON.stringify({
        userId,
        ingredients: ingredientsToDelete,
      }),
    })
      .done((msg) => {
        showNotification(msg.message, 'success', true);
      })
      .fail((msg) => {
        showNotification(msg.message, 'danger');
      });
  });

  $('#addIngredintsBtn').click(() => {
    const userId = $('#navBar').attr('data-user');
    const input = $('#ingredientsInput').val();

    if (isEmptyString(input)) {
      showNotification('Ingredients field is empty.', 'warning');
      return;
    }

    const inputs = input.split('+');

    $.ajax({
      method: 'PUT',
      url: '/users/ingredients/add',
      contentType: 'application/json',
      data: JSON.stringify({
        userId,
        ingredients: inputs,
      }),
    })
      .done((msg) => {
        showNotification(msg.message, 'success', true);
      })
      .fail((msg) => {
        showNotification(msg.message, 'danger');
      });
  });

  // search page
  const maxRequirement = Object.keys(visibleField).length;
  let requirementCount = 0;

  if (requirementCount >= maxRequirement) {
    $('#addRequirementBtn').fadeOut();
  }

  $('#addRequirementBtn').click(() => {
    // clone element adn insert right before add button
    const clone = $('#requirements > .d-none')
      .clone(true)
      .removeClass('d-none')
      .hide();

    clone.insertBefore('#addRequirementBtn');
    clone.fadeIn();
    requirementCount += 1;
    // remove add button if it reaches max
    if (requirementCount >= maxRequirement) {
      $('#addRequirementBtn').fadeOut();
    }
  });

  $('.removeRowBtn').click((event) => {
    const container = $(event.currentTarget).parent();
    container.remove();
    requirementCount -= 1;

    if (requirementCount < maxRequirement) {
      $('#addRequirementBtn').fadeIn();
    }
  });

  $('.requirement-field').change((event) => {
    const selectedValue = $(event.currentTarget).val();
    const unit = visibleField[selectedValue];

    $(event.currentTarget)
      .parent()
      .find('label')
      .text(unit);
  });

  const buildSearchUrl = (page) => {
    let url = '/page/search';

    // append user Id
    const userId = $('#navBar').attr('data-user');
    if (userId) {
      url += `/${userId}`;
    }

    // append query
    url += '?';

    // append page query
    url += `page=${page}`;

    // append item per page
    const limit = $('#limitInput').val();
    url += `&limit=${limit}`;

    // append query
    const searchQuery = $('#queryInput').val();
    if (!isEmptyString(searchQuery)) {
      url += `&searchQuery=${searchQuery.replace(/ /g, '+')}`;
    }

    // append minRating
    const minRating = $('#minRatingInput').val();
    if (minRating) {
      url += `&minRating=${minRating}`;
    }

    // append requirement
    $('.requirementForm').each((index, element) => {
      const field = $(element).find('.requirementField').val();
      const strategy = $(element).find('.requirementStrategy').val();
      const value = $(element).find('.requirementValue').val();

      if (field && strategy && value) {
        url += `&${field}[strategy]=${strategy}&${field}[value]=${value}`;
      }
    });

    return url;
  };

  $('.page-link').click((event) => {
    const page = $(event.currentTarget).attr('data-page');
    if (page) {
      const url = buildSearchUrl(page);
      window.location.href = url;
    }
  });

  $('#searchBtn').click(() => {
    const url = buildSearchUrl(1);
    window.location.href = url;
  });

  $('.addDishBtn').click((event) => {
    event.stopPropagation();
    const userId = $('#navBar').attr('data-user');
    // get recipe name and id
    const container = $(event.currentTarget).closest('.row');
    const id = container.data('dish');
    const name = container.find('.recipeName').text();

    // update database
    $.ajax({
      method: 'PUT',
      url: '/users/selected/dishes/add',
      contentType: 'application/json',
      data: JSON.stringify({
        userId,
        dishes: [id],
      }),
    })
      .done((msg) => {
        showNotification(msg.message, 'success');

        // clone, replace, and add to end
        const clone = $('.selected-dish:first')
          .clone(true)
          .attr('data-dish', id)
          .removeClass('d-none')
          .hide();

        clone.find('label').text(name);

        clone.appendTo('#navList');

        clone.fadeIn();

        // remove item
        container.parent().fadeOut('normal', (parentEvent) => {
          $(parentEvent.currentTarget).remove();
        });
      })
      .fail((msg) => {
        showNotification(msg.message, 'danger');
      });
  });

  // remove selected dish
  $('.removeSelectedDishBtn').click((event) => {
    const userId = $('#navBar').attr('data-user');
    // get recipe id
    const id = $(event.currentTarget).parent().data('dish');

    // update database
    $.ajax({
      method: 'PUT',
      url: '/users/selected/dishes/remove',
      contentType: 'application/json',
      data: JSON.stringify({
        userId,
        dishes: [id],
      }),
    })
      .done((msg) => {
        showNotification(msg.message, 'success');

        // remove parent
        $(event.currentTarget).parent().fadeOut('normal', (parentEvent) => {
          $(parentEvent.currentTarget).remove();
        });
      })
      .fail((msg) => {
        showNotification(msg.message, 'danger');
      });
  });

  $('.filterDishBtn').click((event) => {
    event.stopPropagation();
    const userId = $('#navBar').attr('data-user');
    // get recipe name and id
    const container = $(event.currentTarget).closest('.row');
    const id = container.data('dish');

    // update database
    $.ajax({
      method: 'PUT',
      url: '/users/filtered/dishes/add',
      contentType: 'application/json',
      data: JSON.stringify({
        userId,
        dishes: [id],
      }),
    })
      .done((msg) => {
        showNotification(msg.message, 'success');

        // remove item
        container.parent().fadeOut('normal', (parentEvent) => {
          $(parentEvent.currentTarget).remove();
        });
      })
      .fail((msg) => {
        showNotification(msg.message, 'danger');
      });
  });

  $('.recipeItem').click((event) => {
    const dishId = $(event.currentTarget).find('.row').data('dish');

    window.location = `/page/recipe/${dishId}`;
  });
});
