$(document).ready(() => {
    $("#authenticationApp .login .switch input").on("click", () => {
        window.autoLogin = !window.autoLogin;
    });

    $("#authenticationApp .registration input").on("keyup", (e) => {
        if (e.keyCode == 13) { //enter
            regAccountHandler(-1);
        }
    });

    $("#authenticationApp .login input").on("keyup", (e) => {
        if (e.keyCode == 13) { //enter
            authAccountHandler();
        }
    });

    $("#authenticationApp .recovery input").on("keyup", (e) => {
        if (e.keyCode == 13) { //enter
            recoveryAccountHandler();
        }
    });
});

function showAuthAccount(loginOrEmail = null, password = null) {
    if (loginOrEmail && password) {
        $(".authentication .login .loginOrEmail").val(loginOrEmail);
        $(".authentication .login .password").val(password);
        $(".authentication .login .switch input").attr("checked", true);
        window.autoLogin = true;
    } else {
        clearForm(".login");
    }
    showWelcomeScreen();
    setCursor(true);
}

function clearForm(form) {
    $(form).find("input[type='text']").each((index, input) => {
        $(input).val("");
    });
    $(form).find("input[type='password']").each((index, input) => {
        $(input).val("");
    });
}

function regAccountHandler(emailCode) {
    var data = {
        //name: $(`#authenticationApp .registration .name`).val().trim(),
        //surname: $(`#authenticationApp .registration .surname`).val().trim(),
        //country: $(`#authenticationApp .registration .country`).val().trim(),
        //city: $(`#authenticationApp .registration .city`).val().trim(),
        login: $(`#authenticationApp .registration .login`).val().trim(),
        email: $(`#authenticationApp .registration .email`).val().trim(),
        password: $(`#authenticationApp .registration .password`).val().trim(),
        promocode: $(`#authenticationApp .registration .promocode`).val().trim(),
        //sex: authenticationApp.$data.cursex,
    };
    
    var r = /^[0-9a-zA-Z]{0,20}$/i;
    if (!r.test(data.promocode)) {
        return lightTextFieldError("#authenticationApp .registration .promocode", "Некорректный промокод!");
    }

    /*if (data.name.length == 0) {
          return lightTextFieldError("#authenticationApp .registration .name", "Введите имя!");
    }

    if (data.surname.length == 0) {
          return lightTextFieldError("#authenticationApp .registration .surname", "Введите фамилию!");
    }

    if (data.country.length == 0) {
          return lightTextFieldError("#authenticationApp .registration .country", "Введите страну!");
    }

    if (data.city.length == 0) {
          return lightTextFieldError("#authenticationApp .registration .city", "Введите город!");
    }*/

    if (data.login.length == 0) {
        return lightTextFieldError("#authenticationApp .registration .login", "Введите логин!");
    }
    if (data.email.length == 0) {
        return lightTextFieldError("#authenticationApp .registration .email", "Введите Email!");
    }
    if (data.password.length == 0) {
        return lightTextFieldError("#authenticationApp .registration .password", "Введите пароль!");
    }
    var password2 = $(`#authenticationApp .registration .password2`).val().trim();
    if (password2.length == 0) {
        return lightTextFieldError("#authenticationApp .registration .password2", "Повторите пароль!");
    }

    /*if (data.name.length < 3 || data.name.length > 30) {
          return lightTextFieldError("#authenticationApp .registration .name", "Имя должно состоять из 3-30 символов!");
    }

    if (data.surname.length < 3 || data.surname.length > 30) {
          return lightTextFieldError("#authenticationApp .registration .surname", "Фамилия должна состоять из 3-30 символов!");
    }

    if (data.country.length < 3 || data.country.length > 20) {
          return lightTextFieldError("#authenticationApp .registration .country", "Страна должна состоять из 3-20 символов!");
    }

    if (data.city.length < 3 || data.city.length > 20) {
          return lightTextFieldError("#authenticationApp .registration .city", "Город должна состоять из 3-20 символов!");
    }*/

    if (data.login.length < 5 || data.login.length > 20) {
        return lightTextFieldError("#authenticationApp .registration .login", "Логин должен состоять из 5-20 символов!");
    }
    if (data.email.length > 40) {
        return lightTextFieldError("#authenticationApp .registration .email", "Email должен быть менее 40 символов!");
    }
    var r = /^[0-9a-z_\.-]{5,20}$/i;
    if (!r.test(data.login)) {
        return lightTextFieldError("#authenticationApp .registration .login", "Некорректный логин!");
    }

    if (data.password.length < 6 || data.password.length > 20) {
        return lightTextFieldError("#authenticationApp .registration .password", "Пароль должен состоять из 6-20 символов!");
    }

    var r = /^[0-9a-z-_\.]+\@[0-9a-z-_]{1,}\.[a-z]{1,}$/i;
    if (!r.test(data.email)) {
        return lightTextFieldError("#authenticationApp .registration .email", "Некорректный email!");
    }
    if (password2 != data.password) {
        return lightTextFieldError("#authenticationApp .registration .password2", "Пароли не совпадают!");
    }

    if (emailCode) data.emailCode = emailCode;
    mp.trigger(`regAccount`, JSON.stringify(data));
}

function sendEmailCode() {
    if (isFlood()) return;
    if (window.confirmEmailSent) return mp.trigger(`nError`, `Код уже отправлен!`);
    var email = $(`#authenticationApp .registration .email`).val().trim();
    var login = $(`#authenticationApp .registration .login`).val().trim();
    mp.trigger(`sendEmailCode`, email, login);
}

function initConfirmEmailHandler() {
    var handler = () => {
        if (isFlood()) return;
        var code = parseInt($("#authenticationApp .confirmEmail .code").val().trim());
        if (isNaN(code) || (code + "").length != 6) {
            return lightTextFieldError($("#authenticationApp .confirmEmail .code"), "Неверный код!");
        }

        regAccountHandler(code);
    };
    $('#authenticationApp .confirmEmail .code').slideDown();
    $("#authenticationApp .confirmEmail .code").focus();
    $("#authenticationApp .confirmEmail .code").off("keyup");
    $("#authenticationApp .confirmEmail .code").on("keyup", (e) => {
        if (e.keyCode == 13) { //enter
            handler();
        }
    });

    window.confirmEmailSent = true;
    $("#authenticationApp .confirmEmail .confirm-btn").off();
    $("#authenticationApp .confirmEmail .confirm-btn").click(handler);
}

function showRecoveryCodeTextField() {
    var handler = () => {
        if (isFlood()) return;
        var code = parseInt($("#authenticationApp .recovery .code").val().trim());
        if (isNaN(code) || (code + "").length != 6) {
            return lightTextFieldError($("#authenticationApp .recovery .code"), "Неверный код!");
        }
        var loginOrEmail = $('#authenticationApp .recovery .loginOrEmail').val().trim();
        mp.trigger(`confirmRecoveryCode`, loginOrEmail, code);
    };
    $('#authenticationApp .recovery .loginOrEmail').attr('readonly', 'true');
    $('#authenticationApp .recovery .code').slideDown();
    $("#authenticationApp .recovery .code").focus();
    $("#authenticationApp .recovery .code").off("keyup");
    $("#authenticationApp .recovery .code").on("keyup", (e) => {
        if (e.keyCode == 13) { //enter
            handler();
        }
    });

    window.recoveryCodeSent = true;
    $("#authenticationApp .recovery .send-button a").text("Восстановить");
    $("#authenticationApp .recovery .send-button").attr("onclick", "");
    $("#authenticationApp .recovery .send-button").on("click", handler);
}

function regAccountSuccess() {
    mp.trigger(`nSuccess`, `Учетная запись зарегистрирована!`);
    authenticationApp.showAuthAccount();
    clearForm("#authenticationApp .registration");
    $("#authenticationApp .registration .button").attr("onclick", "");
    $("#authenticationApp .registration .button").on("click", () => {
        mp.trigger(`nError`, `Вы уже зарегистрировали учетную запись!`);
    });
}

function recoveryAccountHandler() {
    var loginOrEmail = $(`#authenticationApp .recovery .loginOrEmail`).val().trim();
    if (!loginOrEmail || loginOrEmail.length == 0) {
        return lightTextFieldError("#authenticationApp .recovery .loginOrEmail", "Заполните поле!");
    }
    var regLogin = /^[0-9a-z_\.-]{5,20}$/i;
    var regEmail = /^[0-9a-z-_\.]+\@[0-9a-z-_]{1,}\.[a-z]{1,}$/i;
    if (!regLogin.test(loginOrEmail) && !regEmail.test(loginOrEmail)) {
        return lightTextFieldError("#authenticationApp .recovery .loginOrEmail", "Некорректное значение!");
    }

    mp.trigger("recoveryAccount", loginOrEmail);
}

function recoveryCodeSuccess() {
    var handler = () => {
        if (isFlood()) return;
        var password = $("#authenticationApp .recovery .password").val().trim();
        var password2 = $("#authenticationApp .recovery .password2").val().trim();

        if (password.length == 0) {
            return lightTextFieldError("#authenticationApp .recovery .password", "Введите пароль!");
        }
        if (password2.length == 0) {
            return lightTextFieldError("#authenticationApp .recovery .password2", "Повторите пароль!");
        }
        if (password.length < 6 || password.length > 20) {
            return lightTextFieldError("#authenticationApp .recovery .password", "Пароль должен состоять из 6-20 символов!");
        }
        if (password2 != password) {
            return lightTextFieldError("#authenticationApp .recovery .password2", "Пароли не совпадают!");
        }

        var loginOrEmail = $('#authenticationApp .recovery .loginOrEmail').val().trim();
        mp.trigger(`recoveryAccountNewPassword`, password);
    };
    $("#authenticationApp .recovery .code").slideUp();
    $("#authenticationApp .recovery .password").slideDown();
    $("#authenticationApp .recovery .password2").slideDown();
    $("#authenticationApp .recovery .password").focus();
    $("#authenticationApp .recovery input").off("keyup");
    $("#authenticationApp .recovery input").on("keyup", (e) => {
        if (e.keyCode == 13) { //enter
            handler();
        }
    });
    $("#authenticationApp .recovery .input-description a").text("Пароль будет изменён на новый.");

    $("#authenticationApp .recovery .send-button").off("click");
    $("#authenticationApp .recovery .send-button").on("click", handler);
}

function recoveryNewPasswordSuccess() {
    var handler = () => {
        mp.trigger(`nError`, `Вы уже восстановили учетную запись!`);
    };
    mp.trigger(`nSuccess`, `Пароль успешно изменён!`);
    $("#authenticationApp .recovery .password").val("");
    $("#authenticationApp .recovery .password").slideUp();
    $("#authenticationApp .recovery .password").focus();
    $("#authenticationApp .recovery input").off("keyup");
    $("#authenticationApp input").on("keyup", (e) => {
        if (e.keyCode == 13) { //enter
            handler();
        }
    });

    $("#authenticationApp .recovery .password2").val("");
    $("#authenticationApp .recovery .password2").slideUp();
    $("#authenticationApp .recovery .loginOrEmail").val("");
    $("#authenticationApp .recovery .loginOrEmail").removeAttr("readonly");
    $("#authenticationApp .recovery .input-description a").text("На Ваш email будет отправлен проверочный код.");

    $("#authenticationApp .recovery .send-button").off("click");
    $("#authenticationApp .recovery .send-button").on("click", handler);
}

function authAccountHandler() {
    if (isFlood()) return;
    var loginOrEmail = $(".authentication .login .loginOrEmail").val().trim();
    if (!loginOrEmail || loginOrEmail.length == 0) {
        lightTextField(".authentication .login .loginOrEmail", "#b44");
        return nError(`Заполните поле!`);
    }
    var regLogin = /^[0-9a-z_\.-]{5,20}$/i;
    var regEmail = /^[0-9a-z-_\.]+\@[0-9a-z-_]{1,}\.[a-z]{1,}$/i;
    if (!regLogin.test(loginOrEmail) && !regEmail.test(loginOrEmail)) {
        lightTextField(".authentication .login .loginOrEmail", "#b44");
        return nError(`Некорректное значение!`);
    }

    var password = $(".authentication .login .password").val().trim();
    if (password.length < 6 || password.length > 20) {
        lightTextField(".authentication .login .password", "#b44");
        return nError(`Неверный пароль!`);
    }

    mp.trigger(`account.setAutoLogin`, window.autoLogin, loginOrEmail, password);

    mp.trigger("authAccount", loginOrEmail, password);
}

const nameRegex = /^([A-Z][a-z]{1,15})$/;

function regCharacterHandler() {
	const firstName = selectMenuAPI.getValue("character_main", "Имя").trim();
	const lastName = selectMenuAPI.getValue("character_main", "Фамилия").trim();

	if (!nameRegex.test(firstName)) {
		selectMenuAPI.show("character_main", 7);
		nInfo(`Используйте шаблон 'Имя'`);
    return nError(`Имя '${firstName}' некорректно!`);
	}

	if (!nameRegex.test(lastName)) {
		selectMenuAPI.show("character_main", 7);
		nInfo(`Используйте шаблон 'Фамилия'`);
    return nError(`Фамилия '${lastName}' некорректна!`);
	}

	mp.trigger("regCharacter", `${firstName} ${lastName}`);
}

function showSelectorCharacters(data) {
    data = JSON.parse(data);
    $(`#selectorCharacters .user-block`).hide();
    $(`#selectorCharacters .donate`).text(data.donate);

    var access = [true, data.isAchievements, data.isDonate];
    var classes = [".free", ".achievements", ".donate-slot"];
    for (var i = 0; i < 3; i++) {
        var character = data.characters[i];
        if (character) {
            var slot = $(`#selectorCharacters .busy:eq(0)`).clone();
            $(`#selectorCharacters`).append(slot);

            var levelRest = convertMinutesToLevelRest(character.minutes);
            var maxExp = convertLevelToMaxExp(levelRest.level);
            if (!character.faction) character.faction = "-";

            slot.find(".regDate").text(convertMillsToDate(character.regDate * 1000));
            slot.find(".hours").text(parseInt(character.minutes / 60));
            slot.find(".playerName").text(character.name);
            slot.find(".level").text(levelRest.level);
            slot.find(".exp").text(levelRest.rest + "/" + maxExp);
            slot.find(".faction").text(character.faction);
            slot.find(".money").text(character.money + "$");
            slot.find(".bank").text(character.bank + "$");
            slot.find(".auth-btn").attr("onclick", `choiceMenuAPI.hide(); mp.trigger('authCharacter', ${i})`);
            slot.find(".delete-button").attr("onclick", `choiceMenuAPI.show('accept_delete_character', '{"name": "${character.name}"}')`);

            slot.show();
        } else {
            var c = classes[0];
            if (!access[i]) c = classes[i];
            var slot = $(`#selectorCharacters ${c}:eq(0)`).clone();
            $(`#selectorCharacters`).append(slot);

            if (classes.indexOf(c) == 1)
                slot.find(".open-btn").attr("onclick", `mp.trigger('events.callRemote', 'characters.openSlot', 'achievements')`);
            else if (classes.indexOf(c) == 2)
            slot.find(".open-btn").attr("onclick", `mp.trigger('events.callRemote', 'characters.openSlot', 'donate')`);

            slot.show();
        }
    }


    /*$(`#selectorCharacters .user-block`).eq(0).remove();
    $(`#selectorCharacters .user-block`).eq(0).remove();
    $(`#selectorCharacters .user-block`).eq(0).remove();*/
    //var userBlocks = $(`#selectorCharacters .user-block`);
    //for (var i = 4; i < userBlocks.length; i++) userBlocks.eq(i).remove();
    $(`#selectorCharacters`).fadeIn("fast");
}

function closedModeHandler() {
    var pin = $(".modal .pin").val().trim();
    if (!pin) return lightTextFieldError(".modal .pin", "Введите PIN!");
    if (isFlood()) return;
    mp.trigger("closedMode.open", pin);
}

function showCharacterInfo(values) {
    values = JSON.parse(values);
    for (var i = 0; i < values.length; i++) {
        $(".characterInfo tr").eq(i).children("td").eq(1).text(values[i]);
    }
    $(".characterInfo").slideDown('fast');
}

function showCreateCharacterButton() {
    $("#createCharacter").show();
    $('#createCharacter').css('left', Math.max(0, (($(window).width() - $('#createCharacter').outerWidth()) / 2) + $(window).scrollTop()) + 'px');
}

function createCharacter() {
    if (clientStorage.charactersCount >= clientStorage.maxCharacters)
        return nError("У Вас макс. количество персонажей!");
    mp.trigger("events.callRemote", "newCharacter", 1);
}
