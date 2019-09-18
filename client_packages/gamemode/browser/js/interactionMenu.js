$(document).ready(() => {
    var playerItems = [{
            text: "Познакомиться",
            icon: "handshake.png"
        },
        {
            text: "Обмен",
            icon: "trade.png"
        },
        {
            text: "Показать документы",
            icon: "card.png"
        },
    ];
    var vehicleItems = [{
        text: "Заправить"
    }, ];

    window.interactionMenuAPI = {
        showPlayerMenu: (data = null) => {
            data = JSON.parse(data);
            $("#interactionMenu").empty();
            for (var i = 0; i < playerItems.length; i++) {
                var info = playerItems[i];
                var iconName = (info.icon) ? info.icon : "default.png";
                var itemEl = $(`<div class="interaction_item"><div class="icon"><img src="img/interactionMenu/${iconName}"/>
                    </div><div class="text">${info.text}</div></div>
                `);
                $("#interactionMenu").append(itemEl);
            }
            addictivePlayerItems(data);
            slideItems();
            initPlayerItemsHandler();

            $("#interactionMenu").fadeIn("fast");
        },
        showVehicleMenu: (data = null) => {
            data = JSON.parse(data);
            $("#interactionMenu").empty();
            for (var i = 0; i < vehicleItems.length; i++) {
                var info = vehicleItems[i];
                var iconName = (info.icon) ? info.icon : "default.png";
                var itemEl = $(`<div class="interaction_item"><div class="icon"><img src="img/interactionMenu/${iconName}"/>
                    </div><div class="text">${info.text}</div></div>
                `);
                $("#interactionMenu").append(itemEl);
            }
            addictiveVehicleItems(data);
            slideItems();
            initVehicleItemsHandler();

            $("#interactionMenu").fadeIn("fast");
        },
        addItem: (iconName, text) => {
            var itemEl = $(`<div class="interaction_item"><div class="icon"><img src="img/interactionMenu/${iconName}"/>
                 </div><div class="text">${text}</div></div>
             `);
            $("#interactionMenu").append(itemEl);
        },
        addBeforeItem: (iconName, text) => {
            var itemEl = $(`<div class="interaction_item"><div class="icon"><img src="img/interactionMenu/${iconName}"/>
                 </div><div class="text">${text}</div></div>
             `);
            $("#interactionMenu").prepend(itemEl);
        },
        active: () => {
            return $("#interactionMenu").css("display") != "none";
        },
        clear: () => {
             $("#interactionMenu").empty();
        },
        hide: () => {
            $("#interactionMenu").fadeOut("fast");
            lastAction = null;
        },
        move: (x, y) => {
            //debug(`interactionMenuAPI.move: ${x} ${y}`)
            $("#interactionMenu").css("left", x + "%");
            $("#interactionMenu").css("top", y + "%");
        },
    };

    /* for tests */
    //interactionMenuAPI.showVehicleMenu();
});

var lastAction;

/* Чтобы пункты меню не были на одном уровне от левого края. */
function slideItems() {
    var itemsCount = $("#interactionMenu .interaction_item").length;
    var slidePx = 10;
    for (var i = 0; i < parseInt((itemsCount - 1) / 2); i++) {
        var itemElA = $($("#interactionMenu .interaction_item")[1 + i]);
        var itemElB = $($("#interactionMenu .interaction_item")[itemsCount - i - 2]);
        itemElA.css("margin-left", slidePx + "px");
        itemElB.css("margin-left", slidePx + "px");
        slidePx += 10;
    }
}

/* Добавляем/удаляем пункты, в зависимости от данных. */
function addictivePlayerItems(data) {
    if (!data) data = {};
    if (data.action == "showDocuments") {
        $("#interactionMenu").empty();
        var items = [{
                text: "Паспорт",
                icon: "card.png"
            },
            {
                text: "Лицензии",
                icon: "card.png"
            },
            {
                text: "Выписка из тира",
                icon: "card.png"
            },
            {
                text: "Трудовая",
                icon: "card.png"
            },
        ];
        var factions = [2, 3, 4, 5, 6, 7]; // организации с удостоверениями
        if (factions.indexOf(clientStorage.faction) != -1) items.push({
            text: "Удостоверение",
            icon: "card.png"
        });
        for (var i = 0; i < items.length; i++) {
            var info = items[i];
            var iconName = (info.icon) ? info.icon : "default.png";
            interactionMenuAPI.addItem(iconName, info.text);
        }
    } else if (data.action == "showLeader") {
        $("#interactionMenu").empty();
        var items = [{
                text: "Пригласить в организацию",
                icon: "default.png"
            },
            {
                text: "Повысить в должности",
                icon: "default.png"
            },
            {
                text: "Понизить в должности",
                icon: "default.png"
            },
            {
                text: "Уволить из организации",
                icon: "default.png"
            },
        ];
        for (var i = 0; i < items.length; i++) {
            var info = items[i];
            var iconName = (info.icon) ? info.icon : "default.png";
            interactionMenuAPI.addItem(iconName, info.text);
        }
    } else if (data.action == "showFaction") {
        $("#interactionMenu").empty();
        var list = {
            '1': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '2': [{
                    text: "Наручники",
                    icon: "default.png"
                },
                {
                    text: "Розыск",
                    icon: "default.png"
                },
                {
                    text: "Вести за собой",
                    icon: "default.png"
                },
                {
                    text: "Посадить в авто",
                    icon: "default.png"
                },
                {
                    text: "Арестовать",
                    icon: "default.png"
                },
                {
                    text: "Штраф",
                    icon: "default.png"
                },
            ],
            '3': [{
                    text: "Наручники",
                    icon: "default.png"
                },
                {
                    text: "Розыск",
                    icon: "default.png"
                },
                {
                    text: "Вести за собой",
                    icon: "default.png"
                },
                {
                    text: "Посадить в авто",
                    icon: "default.png"
                },
                {
                    text: "Арестовать",
                    icon: "default.png"
                },
                {
                    text: "Штраф",
                    icon: "default.png"
                },
            ],
            '4': [{
                    text: "Наручники",
                    icon: "default.png"
                },
                {
                    text: "Розыск",
                    icon: "default.png"
                },
                {
                    text: "Вести за собой",
                    icon: "default.png"
                },
                {
                    text: "Посадить в авто",
                    icon: "default.png"
                },
                {
                    text: "Арестовать",
                    icon: "default.png"
                },
                // {
                //     text: "Прикрепить жучок",
                //     icon: "default.png"
                // },
                // {
                //     text: "Обыскать",
                //     icon: "default.png"
                // },
            ],
            '5': [{
                    text: "Вылечить",
                    icon: "default.png"
                },
                {
                    text: "Показать удостоверение",
                    icon: "default.png"
                }
            ],
            '6': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '7': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '8': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '9': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '10': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '11': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '12': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '13': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '14': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '15': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '16': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '17': [{
                text: "todo",
                icon: "default.png"
            }, ],
        };
        if (list[clientStorage.faction]) {
            var items = list[clientStorage.faction];
            for (var i = 0; i < items.length; i++) {
                var info = items[i];
                var iconName = (info.icon) ? info.icon : "default.png";
                interactionMenuAPI.addItem(iconName, info.text);
            }
        }
    } else if (data.action == "showLocal") {
        $("#interactionMenu").empty();
        var items = [{
                text: "Эмоции",
                icon: "default.png"
            },
            {
                text: "Походка",
                icon: "default.png"
            },
            {
                text: "Анимации",
                icon: "default.png"
            },
        ];
        for (var i = 0; i < items.length; i++) {
            var info = items[i];
            var iconName = (info.icon) ? info.icon : "default.png";
            interactionMenuAPI.addItem(iconName, info.text);
        }
    } else if (data.action == "showEmotions") {
        $("#interactionMenu").empty();
        var items = [{
                text: "Обычный",
                icon: "default.png"
            },
            {
                text: "Угрюмый",
                icon: "default.png"
            },
            {
                text: "Сердитый",
                icon: "default.png"
            },
            {
                text: "Счастливый",
                icon: "default.png"
            },
            {
                text: "Стресс",
                icon: "default.png"
            },
            {
                text: "Надутый",
                icon: "default.png"
            },
        ];
        for (var i = 0; i < items.length; i++) {
            var info = items[i];
            var iconName = (info.icon) ? info.icon : "default.png";
            interactionMenuAPI.addItem(iconName, info.text);
        }
    } else if (data.action == "showWalking") {
        $("#interactionMenu").empty();
        var items = [{
                text: "Нормальная",
                icon: "default.png"
            },
            {
                text: "Храбрый",
                icon: "default.png"
            },
            {
                text: "Уверенный",
                icon: "default.png"
            },
            {
                text: "Гангстер",
                icon: "default.png"
            },
            {
                text: "Быстрый",
                icon: "default.png"
            },
            {
                text: "Грустный",
                icon: "default.png"
            },
            {
                text: "Крылатый",
                icon: "default.png"
            },
        ];
        for (var i = 0; i < items.length; i++) {
            var info = items[i];
            var iconName = (info.icon) ? info.icon : "default.png";
            interactionMenuAPI.addItem(iconName, info.text);
        }
    } else if (data.action == "showAnimations") {
        $("#interactionMenu").empty();

        var list = {
            '-1': [{
                    text: "Жесты",
                    icon: "default.png"
                },
                {
                    text: "Спорт",
                    icon: "default.png"
                },
                {
                    text: "Поза лёжа",
                    icon: "default.png"
                },
                {
                    text: "Поза сидя",
                    icon: "default.png"
                },
                {
                    text: "Испугано",
                    icon: "default.png"
                },
                {
                    text: "Танец",
                    icon: "default.png"
                },
                {
                    text: "Курение",
                    icon: "default.png"
                },
            ],
            '0': [{
                    text: "Показывает фак",
                    icon: "default.png"
                },
                {
                    text: "Рок двумя руками",
                    icon: "default.png"
                },
                {
                    text: "Рок одной рукой",
                    icon: "default.png"
                },
                {
                    text: "Два пальца",
                    icon: "default.png"
                },
                {
                    text: "Бурные аплодисменты",
                    icon: "default.png"
                },
                {
                    text: "Анимация дрочки",
                    icon: "default.png"
                },
            ],
            '1': [{
                    text: "Подтягивания",
                    icon: "default.png"
                },
                {
                    text: "Тягает штангу лёжа",
                    icon: "default.png"
                },
                {
                    text: "Тягает штангу стоя",
                    icon: "default.png"
                },
                {
                    text: "Отжимания",
                    icon: "default.png"
                },
                {
                    text: "Качает пресс",
                    icon: "default.png"
                },
            ],
            '2': [{
                    text: "Спит",
                    icon: "default.png"
                },
                {
                    text: "Спит развалив руки",
                    icon: "default.png"
                },
                {
                    text: "Спит сжавшись в клубок",
                    icon: "default.png"
                },
            ],
            '3': [{
                    text: "Скорчился в клубок",
                    icon: "default.png"
                },
                {
                    text: "Сидит разглядывая что-то",
                    icon: "default.png"
                },
                {
                    text: "Сидит со стаканом и пьёт",
                    icon: "default.png"
                },
                {
                    text: "Сидит свободно раздвинув ноги",
                    icon: "default.png"
                },
                {
                    text: "Сидит рука на руке",
                    icon: "default.png"
                },
            ],
            '4': [{
                    text: "Стоя закрывается руками",
                    icon: "default.png"
                },
                {
                    text: "Закрывается руками и осм.",
                    icon: "default.png"
                },
                {
                    text: "Нагнувшись закрывается руками",
                    icon: "default.png"
                },
                {
                    text: "Нагнувшись осм. по сторонам",
                    icon: "default.png"
                },
                {
                    text: "Сжимается в клубок",
                    icon: "default.png"
                },
                {
                    text: "Сидя закрывается руками осм.",
                    icon: "default.png"
                },
                {
                    text: "Оглядывается по сторонам и трясётся",
                    icon: "default.png"
                },
                {
                    text: "Сидя на картах закрывшись кулаками",
                    icon: "default.png"
                },
                {
                    text: "Сидя на картах испугано злится",
                    icon: "default.png"
                },
            ],
            '5': [{
                    text: "Трясёт руками",
                    icon: "default.png"
                },
                {
                    text: "Облакотился на стену",
                    icon: "default.png"
                },
                {
                    text: "Танцует тряся тазом",
                    icon: "default.png"
                },
            ],
            '6': [{
                    text: "Берёт в руки сигарету",
                    icon: "default.png"
                },
            ],
        };

        if (list[data.index]) {
            var items = list[data.index];
            for (var i = 0; i < items.length; i++) {
                var info = items[i];
                var iconName = (info.icon) ? info.icon : "default.png";
                interactionMenuAPI.addItem(iconName, info.text);
            }
        }
    } else {
        if (clientStorage.faction > 0) {
            interactionMenuAPI.addItem("default.png", "Организация");
        }
        if (clientStorage.factionRank >= clientStorage.factionLastRank) {
            interactionMenuAPI.addItem("default.png", "Лидер");
        }
        if (clientStorage.trashLeader === 1) {
            interactionMenuAPI.addItem("default.png", "Пригласить в бригаду");
        }
        if (clientStorage.trashLeader === 2) {
            interactionMenuAPI.addItem("default.png", "Уволить из бригады");
        }
        if (clientStorage.gopostalLeader === 1) {
            interactionMenuAPI.addItem("default.png", "Пригласить в группу");
        }
        if (clientStorage.gopostalLeader === 2) {
            interactionMenuAPI.addItem("default.png", "Уволить из группы");
        }
        if (data.showTransferProducts) {
            interactionMenuAPI.addItem("default.png", "Передать товар");
        }
    }
}

/* Добавляем/удаляем пункты, в зависимости от данных. */
function addictiveVehicleItems(data) {
    if (!data) data = {};
    //debug(`data: ${JSON.stringify(data)}`)
    if (data.action == "showFaction") {
        $("#interactionMenu").empty();
        var list = {
            '1': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '2': [{
                    text: "Вскрыть",
                    icon: "default.png"
                },
                {
                    text: "Вытолкнуть",
                    icon: "default.png"
                },
            ],
            '3': [{
                    text: "Вскрыть",
                    icon: "default.png"
                },
                {
                    text: "Вытолкнуть",
                    icon: "default.png"
                },
            ],
            '4': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '5': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '6': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '7': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '8': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '9': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '10': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '11': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '12': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '13': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '14': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '15': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '16': [{
                text: "todo",
                icon: "default.png"
            }, ],
            '17': [{
                text: "todo",
                icon: "default.png"
            }, ],
        };
        if (list[clientStorage.faction]) {
            var items = list[clientStorage.faction];
            for (var i = 0; i < items.length; i++) {
                var info = items[i];
                var iconName = (info.icon) ? info.icon : "default.png";
                interactionMenuAPI.addItem(iconName, info.text);
            }
        }
    } else if (data.action == "removeFromVehicle") {
        $("#interactionMenu").empty();
        for (var i = 0; i < data.names.length; i++) {
            var name = data.names[i];
            var iconName = "default.png";
            interactionMenuAPI.addItem(iconName, name);
        }
        lastAction = "removeFromVehicle";
    } else if (clientStorage.faction > 0) {
        interactionMenuAPI.addItem("default.png", "Организация");
    }

    if (data.action == "showDoors") {
        interactionMenuAPI.addBeforeItem("default.png", "Двери");
    } else if (data.action == "showHood") {
        interactionMenuAPI.addBeforeItem("default.png", "Капот");
    } else if (data.action == "showBoot") {
        interactionMenuAPI.addBeforeItem("default.png", "Багажник");
        if (data.showProducts) interactionMenuAPI.addItem("default.png", "Товар");
    } else if (data.action == "showEnter") {
        $("#interactionMenu").empty();
        interactionMenuAPI.addItem("default.png", "Выкинуть из транспорта");
        interactionMenuAPI.addItem("default.png", "Открыть/Закрыть транспорт");
        // interactionMenuAPI.addItem("default.png", "Открыть/Закрыть капот");
        // interactionMenuAPI.addItem("default.png", "Открыть/Закрыть багажник");
    }
}

/* Установка обработчиков на пункты меню взаимодействия с игроком. */
function initPlayerItemsHandler() {
    $("#interactionMenu .interaction_item").each((index, el) => {
        $(el).click((e) => {
            onClickPlayerItem($(el).find(".text").text());
        });
    });
}

/* Установка обработчиков на пункты меню взаимодействия с авто. */
function initVehicleItemsHandler() {
    $("#interactionMenu .interaction_item").each((index, el) => {
        $(el).click((e) => {
            onClickVehicleItem($(el).find(".text").text());
        });
    });
}

/* Вызывается при клике на меню взаимодействия с игроком. */
function onClickPlayerItem(itemName) {
    //console.log(`onClickPlayerItem: ${itemName}`);
    if (itemName == "Показать документы") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showDocuments"
        }));
        return;
    } else if (itemName == "Лидер") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showLeader"
        }));
        return;
    } else if (itemName == "Организация") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showFaction"
        }));
        return;
    } else if (itemName == "Эмоции") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showEmotions"
        }));
        return;
    } else if (itemName == "Походка") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showWalking"
        }));
        return;
    } else if (itemName == "Анимации") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showAnimations",
            index: -1
        }));
        return;
    } else if (itemName == "Жесты") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showAnimations",
            index: 0
        }));
        return;
    } else if (itemName == "Спорт") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showAnimations",
            index: 1
        }));
        return;
    } else if (itemName == "Поза лёжа") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showAnimations",
            index: 2
        }));
        return;
    } else if (itemName == "Поза сидя") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showAnimations",
            index: 3
        }));
        return;
    } else if (itemName == "Испугано") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showAnimations",
            index: 4
        }));
        return;
    } else if (itemName == "Танец") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showAnimations",
            index: 5
        }));
        return;
    } else if (itemName == "Курение") {
        interactionMenuAPI.showPlayerMenu(JSON.stringify({
            action: "showAnimations",
            index: 6
        }));
        return;
    }

    mp.trigger(`interactionMenu.onClickPlayerItem`, itemName);
}

/* Вызывается при клике на меню взаимодействия с авто. */
function onClickVehicleItem(itemName) {
    //console.log(`onClickVehicleItem: ${itemName}`);
    if (itemName == "Организация") {
        interactionMenuAPI.showVehicleMenu(JSON.stringify({
            action: "showFaction"
        }));
        return;
    } else if (lastAction == "removeFromVehicle") {
        mp.trigger(`events.callRemote`, `removeFromVehicle`, itemName);
        interactionMenuAPI.hide();
    }
    mp.trigger(`interactionMenu.onClickVehicleItem`, itemName);
}
