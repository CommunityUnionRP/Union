$(document).ready(() => {
    window.currentChoiceMenu;
    var menus = {
        "accept_sell_biz": {
            text: "Carter Slade предлагает Вам купить бизнес 'Закусочная' за 10000$.",
            on: (values) => {
                menus["accept_sell_biz"].text = `${values.owner} предлагает Вам купить бизнес '${values.type}' за ${values.price}$.`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "biz.sell.accept");
            },
            no: () => {
                mp.trigger("events.callRemote", "biz.sell.cancel");
            },
        },
        "accept_trade": {
            text: "Carter Slade хочет с Вами торговаться.",
            on: (values) => {
                menus["accept_trade"].text = `${values.name} хочет с Вами торговаться.`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "trade.offer.agree");
            },
            no: () => {
                mp.trigger("events.callRemote", "trade.offer.cancel");
            },
        },
        "accept_invite": {
            text: "Carter Slade предлагает Вам вступить в Правительство.",
            on: (values) => {
                menus["accept_invite"].text = `${values.name} предлагает Вам вступить в ${values.faction}.`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "factions.offer.agree");
            },
            no: () => {
                mp.trigger("events.callRemote", "factions.offer.cancel");
            },
        },
        "accept_health": {
            text: "Carter Slade предлагает Вам лечение за 9999$.",
            on: (values) => {
                menus["accept_health"].text = `${values.name} предлагает Вам лечение за ${values.price}$.`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "hospital.health.agree");
            },
            no: () => {
                mp.trigger("events.callRemote", "hospital.health.cancel");
            },
        },
        "acccept_trash_team": {
            text: "Tomat Petruchkin предлагает Вам вступить в Бригаду.",
            on: (values) => {
                menus["acccept_trash_team"].text = `${values.name} предлагает Вам вступить в Бригаду.`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "trash.team.agree");
            },
            no: () => {
                mp.trigger("events.callRemote", "trash.team.cancel");
            },
        },
        "acccept_gopostal_team": {
            text: "Tomat Petruchkin предлагает Вам вступить в Группу.",
            on: (values) => {
                menus["acccept_gopostal_team"].text = `${values.name} предлагает Вам вступить в Группу.`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "gopostal.team.agree");
            },
            no: () => {
                mp.trigger("events.callRemote", "gopostal.team.cancel");
            },
        },
        "accept_job_builder": {
            text: "Вы хотите начать работу <Работа>?",
            on: (values) => {
                menus["accept_job_builder"].text = `Вы хотите ${values.name}`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "job.builder.agree");
            },
            no: () => {
                mp.trigger("client.job.cursor.cancel");
            },
        },
        "accept_job_taxi": {
            text: "Вы хотите начать работу <Работа>?",
            on: (values) => {
                menus["accept_job_taxi"].text = `Вы хотите ${values.name}`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "job.taxi.agree");
            },
            no: () => {
                mp.trigger("client.job.cursor.cancel");
            },
        },
        "accept_job_waterfront": {
            text: "Вы хотите начать работу <Работа>?",
            on: (values) => {
                menus["accept_job_waterfront"].text = `Вы хотите ${values.name}`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "job.waterfront.agree");
            },
            no: () => {
                mp.trigger("client.job.cursor.cancel");
            },
        },
        "accept_job_pizza": {
            text: "Вы хотите начать работу <Работа>?",
            on: (values) => {
                menus["accept_job_pizza"].text = `Вы хотите ${values.name}`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "job.pizza.agree");
            },
            no: () => {
                mp.trigger("client.job.cursor.cancel");
            },
        },
        "accept_job_postal": {
            text: "Вы хотите начать работу <Работа>?",
            on: (values) => {
                menus["accept_job_postal"].text = `Вы хотите ${values.name}`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "job.gopostal.agree");
            },
            no: () => {
                mp.trigger("client.job.cursor.cancel");
            },
        },
        "accept_job_trash": {
            text: "Вы хотите начать работу <Работа>?",
            on: (values) => {
                menus["accept_job_trash"].text = `Вы хотите ${values.name}`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "job.trash.agree");
            },
            no: () => {
                mp.trigger("client.job.cursor.cancel");
            },
        },
        "invite_inhouse_confirm": {
            text: "Carter Slade приглашает Вас в свой дом.",
            on: (values) => {
                houseMenu.__vue__.exitMenu();
                menus["invite_inhouse_confirm"].text = `${values.name} приглашает Вас в свой дом.`;
            },
            yes: () => {
                houseMenu.__vue__.exitMenu();
                mp.trigger("events.callRemote", "house.invite.agree");
            },
            no: () => {
                mp.trigger("events.callRemote", "house.invite.cancel");
            }
        },
        "sellhousegov_confirm": {
            text: "Вы действительно хотите продать свой дом государству за $100.",
            on: (values) => {
                houseMenu.__vue__.exitMenu();
                menus["sellhousegov_confirm"].text = `Вы действительно хотите продать свой дом государству за $${values.price}.`;
            },
            yes: () => {
                houseMenu.__vue__.exitMenu();
                mp.trigger("events.callRemote", "house.sellgov.agree");
            },
            no: () => {}
        },
        "sellhouseplayer_confirm": {
            text: "Вы действительно хотите продать свой дом Carter за $100?",
            on: (values) => {
                houseMenu.__vue__.exitMenu();
                menus["sellhouseplayer_confirm"].text = `Вы действительно хотите продать свой дом ${values.name} за $${values.price}?`;
            },
            yes: () => {
                houseMenu.__vue__.exitMenu();
                mp.trigger("events.callRemote", "house.sellplayer.agree");
            },
            no: () => {
                mp.trigger("events.callRemote", "house.sellplayer.cancel");
            }
        },
        "buyhouseplayer_confirm": {
            text: "Carter предлагает Вам купить его Дом 1 за $1000.",
            on: (values) => {
                houseMenu.__vue__.exitMenu();
                menus["buyhouseplayer_confirm"].text = `${values.name} предлагает Вам купить его Дом ${values.houseid} за $${values.price}.`;
            },
            yes: () => {
                houseMenu.__vue__.exitMenu();
                mp.trigger("events.callRemote", "house.buyhouseplayer.agree");
            },
            no: () => {
                mp.trigger("events.callRemote", "house.buyhouseplayer.cancel");
            }
        },
        "accept_familiar": {
            text: "Гражданин хочет с Вами познакомиться.",
            yes: () => {
                mp.trigger("events.callRemote", "familiar.offer.agree");
            },
            no: () => {
                mp.trigger("events.callRemote", "familiar.offer.cancel");
            },
        },
        "accept_delete_character": {
            text: "Удалить персонажа Alex Cortez?",
            on: (values) => {
                menus["accept_delete_character"].text = `Удалить персонажа ${values.name}?`;
                menus["accept_delete_character"].name = values.name;
            },
            yes: () => {
                var name = menus["accept_delete_character"].name;
                mp.trigger("events.callRemote", "deleteCharacter", name);
            },
            no: () => {},
        },
        "accept_respawn": {
            text: "Желаете возродиться?",
            yes: () => {
                mp.trigger("events.callRemote", "hospital.respawn");
            },
            no: () => {},
        },
        "sellcarplayer_confirm": {
            text: "Вы действительно хотите продать Infernus Carter Slade за $100?",
            on: (values) => {
                menus["sellcarplayer_confirm"].text = `Вы действительно хотите продать ${values.model} ${values.name} за $${values.price}?`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "car.sellplayer.agree");
            },
            no: () => {
                mp.trigger("events.callRemote", "car.sellplayer.cancel");
            }
        },
        "buycarplayer_confirm": {
            text: "Carter предлагает Вам купить Infernus за $1000.",
            on: (values) => {
                menus["buycarplayer_confirm"].text = `${values.name} предлагает Вам купить ${values.model} за $${values.price}.`;
            },
            yes: () => {
                mp.trigger("events.callRemote", "car.buycarplayer.agree");
            },
            no: () => {
                mp.trigger("events.callRemote", "car.buycarplayer.cancel");
            }
        },
        "accept_fix_car": {
            text: "Вы уверены, что хотите доставить транспорт за 50$?",
            on: (sqlId) => {
                menus["accept_fix_car"].text = `Вы уверены, что хотите доставить транспорт за 50$?`;
                menus["accept_fix_car"].sqlid = sqlId;
            },
            yes: () => {
                var sqlid = menus["accept_fix_car"].sqlid;
                mp.trigger("events.callRemote", "car.fix.accept", sqlid);
            },
            no: () => {
                
            },
        }
    };

    var timerId;
    window.choiceMenuAPI = {
        show: (name, values) => {
            var menu = menus[name];
            if (!menu) return;
            currentChoiceMenu = menu;

            $(".choiceMenu").slideDown("fast");
            if (menu.on && values) menu.on(JSON.parse(values));
            $(".choiceMenu .text").html(menu.text);

            $('.choiceMenu').css('left', Math.max(0, (($(window).width() - $('.choiceMenu').outerWidth()) / 2) + $(window).scrollTop()) + 'px');
            $('.choiceMenu').css('top', '10vh');

            var times = 9;
            $(".choiceMenu .cancel").text(`Закрыть (${times}с)`);
            clearInterval(timerId);
            timerId = setInterval(() => {
                times--;
                $(".choiceMenu .cancel").text(`Закрыть (${times}с)`);
                if (times < 1) {
                    clearInterval(timerId);
                    choiceMenuAPI.hide();
                }
            }, 1000);

            $(".choiceMenu .cancel").on("click", () => {
                currentChoiceMenu.no();
                choiceMenuAPI.hide();
            });
            $(".choiceMenu .agree").on("click", () => {
                currentChoiceMenu.yes();
                choiceMenuAPI.hide();
            });
            $(document).keydown(choiceMenuAPI.handler);

            promptAPI.showByName("choiceMenu_help");
        },
        hide: () => {
            $(".choiceMenu .cancel").off("click");
            $(".choiceMenu .agree").off("click");
            $(document).unbind('keydown', choiceMenuAPI.handler);
            currentChoiceMenu = null;
            $(".choiceMenu").slideUp("fast");
            clearInterval(timerId);
            promptAPI.hide();
        },
        handler: (e) => {
            if (window.medicTablet.active() || window.pdTablet.active() || window.telephone.active() || window.armyTablet.active() || window.sheriffTablet.active() || window.fibTablet.active() || window.playerMenu.active() || chatAPI.active() || consoleAPI.active() || modalAPI.active()) return;
            if (e.keyCode == 78) { // N
                currentChoiceMenu.no();
                choiceMenuAPI.hide();
            } else if (e.keyCode == 89) { // Y
                currentChoiceMenu.yes();
                choiceMenuAPI.hide();
            }
        },
    };
});
