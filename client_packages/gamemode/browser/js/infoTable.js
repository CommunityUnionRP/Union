$(document).ready(() => {
    window.currentInfoTable = null;
    const ITEM_HEIGHT = 2.7;
    var infoTables = {
        "character_skills": {
            header: "Умения",
            location: "right-middle",
            items: [{
                    text: "Выносливость",
                    type: "progress",
                    value: 50
                },
                {
                    text: "Сила",
                    type: "progress",
                    value: 50
                },
                {
                    text: "Стрельба",
                    type: "progress"
                },
                {
                    text: "Скрытность",
                    type: "progress",
                    value: 60
                },
                {
                    text: "Полёт",
                    type: "progress"
                },
                {
                    text: "Вождение",
                    type: "progress",
                    value: 30
                },
                {
                    text: "Психика",
                    type: "progress"
                }
            ]
        },
        "character_info": {
            header: "О персонаже",
            location: "right-middle",
            items: [{
                    text: "Имя"
                },
                {
                    text: "Транспорт"
                },
                {
                    text: "Место жительства"
                },
                {
                    text: "Бизнес"
                },
                {
                    text: "Организация"
                },
                {
                    text: "Работа"
                },
                {
                    text: "Семейное положение"
                }
            ]
        },
        "house_info": {
            header: "О доме",
            location: "right-middle",
            items: [{
                    text: "Номер"
                },
                {
                    text: "Класс"
                },
                {
                    text: "Интерьер"
                },
                {
                    text: "Владелец"
                },
                {
                    text: "Гараж"
                },
                {
                    text: "Дверь"
                },
                {
                    text: "Цена"
                },
            ],
            on: (values) => {
                var items = infoTables["house_info"].items;
                var classes = globalConstants.houseClasses;
                var garages = globalConstants.garageClasses;
                var doors = globalConstants.doors;
                var params = [`№${values[0]}`, classes[values[1]], `№${values[2]}`, values[3], garages[values[4]],
                    doors[values[5]], `${values[6]}$`
                ];

                for (var i = 0; i < items.length; i++)
                    items[i].value = params[i];


                setTimeout(() => {
                    infoTableAPI.hide("house_info");
                }, 10000);
            },
        },
        "garage_info": {
            header: "О гараже",
            location: "right-middle",
            items: [{
                    text: "Дом"
                },
                {
                    text: "Класс"
                },
                {
                    text: "Вместимость"
                },
                {
                    text: "Двери"
                },
            ],
            on: (values) => {
                var items = infoTables["garage_info"].items;
                var garages = globalConstants.garageClasses;
                var maxCars = globalConstants.garageMaxCars;
                var doors = globalConstants.doors;
                var params = [`№${values[0]}`, garages[values[1]], `${maxCars[values[1]]} шт.`,
                    doors[values[2]]
                ];

                for (var i = 0; i < items.length; i++)
                    items[i].value = params[i];

                setTimeout(() => {
                    infoTableAPI.hide("garage_info");
                }, 5000);
            }
        },
        "biz_info": {
            header: "О бизнесе",
            location: "right-middle",
            items: [{
                    text: "Номер"
                },
                {
                    text: "Имя"
                },
                {
                    text: "Тип"
                },
                {
                    text: "Владелец"
                },
                {
                    text: "Товар"
                },
                {
                    text: "Цена 1 ед. товара"
                },
                {
                    text: "Касса"
                },
                {
                    text: "Статус"
                },
                {
                    text: "Персонал"
                },
                {
                    text: "Цена"
                },
            ],
            on: (values) => {
                var items = infoTables["biz_info"].items;
                var info = globalConstants.bizesInfo;
                var status = globalConstants.bizStatus;

                var params = [`№${values[0]}`, values[1], info[values[2] - 1].name, values[3], `${values[4]} из ${values[5]} ед.`,
                    `${values[6]}$`, `${values[7]}$`, status[values[8]], `${values[9]} чел.`, `${values[10]}$`
                ];

                for (var i = 0; i < items.length; i++)
                    items[i].value = params[i];

                setTimeout(() => {
                    infoTableAPI.hide("biz_info");
                }, 15000);
            },
        },
    };

    window.infoTableAPI = {
        show: (name, params = null) => {
            //alert(`infoTable.show: ${name} ${params}`);
            var infoTable = infoTables[name];
            if (!infoTable) return;

            infoTable.name = name;
            window.currentInfoTable = infoTable;
            if (params != null && params != 'null') infoTable.on(JSON.parse(params));

            var height = 6 + infoTable.items.length * ITEM_HEIGHT + "vh";
            $(".infoTable .body").height(height);
            $(".infoTable .header").text(infoTable.header);
            $(".infoTable .items").empty();

            for (var i = 0; i < infoTable.items.length; i++) {
                infoTableAPI.addLastTableItemToDOM(i);
            }
            infoTableAPI.markMaxParam();

            switch (infoTable.location) {
                case 'left-top':
                    $('.infoTable').css('left', '1vh');
                    $('.infoTable').css('top', '1vh');
                    $('.infoTable').css('right', '');
                    $('.infoTable').css('bottom', '');
                    break;
                case 'left-middle':
                    $('.infoTable').css('left', '10vh');
                    $('.infoTable').css('top', '25vh');
                    $('.infoTable').css('right', '');
                    $('.infoTable').css('bottom', '');
                    break;
                case 'right-middle':
                    $('.infoTable').css('left', '');
                    $('.infoTable').css('top', '25vh');
                    $('.infoTable').css('right', '10vh');
                    $('.infoTable').css('bottom', '');
                    break;
                case 'top':
                    $('.infoTable').css('left', Math.max(0, (($(window).width() - $('.infoTable').outerWidth()) / 2) + $(window).scrollLeft()) + 'px');
                    $('.infoTable').css('top', '10vh');
                    $('.infoTable').css('right', '');
                    $('.infoTable').css('bottom', '');
                    break;
            }

            $(".infoTable").slideDown("fast");
        },
        hide: (name) => {
            if (name && window.currentInfoTable.name != name) return;
            window.currentInfoTable = null;
            $(".infoTable").slideUp("fast");
        },
        active: () => {
            return $(".infoTable").css("display") != "none";
        },
        addLastTableItemToDOM: (i) => {
            if (!currentInfoTable) return;
            var item = currentInfoTable.items[i];
            if (!item) return;

            switch (item.type) {
                case "progress":
                    var value = item.value || 0;
                    var el = `<tr>
                                    <td>${item.text}</td>
                                    <td><div class="progress"><div class="filler" style="width: ${value}%"></div></div></td>
                              </tr>`;
                    $(".infoTable .items").append(el);

                    var width = parseFloat($(".infoTable .progress").css("width"));
                    var height = parseFloat($(".infoTable .progress").css("height"));
                    var offset = 3; //отступ между блоками прогресса
                    var blocksCount = 4; //коли-во блоков
                    var blockWidth = (width - (offset * (blocksCount - 1))) / blocksCount + "px";
                    var offsetWidth = parseFloat(blockWidth) + offset + "px";
                    var background = "#545c5d";

                    $(".infoTable .progress").css("background", `repeating-linear-gradient(90deg, ${background}, ${background} ${blockWidth}, rgba(0,0,0,0) ${blockWidth}, rgba(0,0,0,0) ${offsetWidth})`);
                    $(".infoTable .filler").css("background", `repeating-linear-gradient(90deg, #fff, #fff ${blockWidth}, rgba(0,0,0,0) ${blockWidth}, rgba(0,0,0,0) ${offsetWidth})`);
                    break;
                default:
                    var value = item.value || "-";
                    var el = `<tr>
                                    <td>${item.text}</td>
                                    <td align="right">${value}</td>
                              </tr>`;
                    $(".infoTable .items").append(el);
                    break;
            }
        },
        markMaxParam: () => {
            if (!currentInfoTable) return;
            var items = currentInfoTable.items;
            if (!items) return;
            var background = "#f3c516";
            var maxIndex = 0;
            for (var i = 1; i < items.length; i++) {
                if (!items[i].value) continue;
                if (items[i].value > items[maxIndex].value) maxIndex = i;
            }

            var width = parseFloat($(".infoTable .progress").css("width"));
            var height = parseFloat($(".infoTable .progress").css("height"));
            var offset = 3; //отступ между блоками прогресса
            var blocksCount = 4; //коли-во блоков
            var blockWidth = (width - (offset * (blocksCount - 1))) / blocksCount + "px";
            var offsetWidth = parseFloat(blockWidth) + offset + "px";
            $(".infoTable .items tr").eq(maxIndex).children("td").eq(1).children("div").children(".filler").css("background", `repeating-linear-gradient(90deg, ${background}, ${background} ${blockWidth}, rgba(0,0,0,0) ${blockWidth}, rgba(0,0,0,0) ${offsetWidth})`);
        },
        setValues: (infoTableName, values) => {
            values = JSON.parse(values);
            var infoTable = infoTables[infoTableName];
            if (!infoTable) return;
            for (var i = 0; i < infoTable.items.length; i++) {
                infoTable.items[i].value = values[i];
            }
            //infoTableAPI.hide();
            infoTableAPI.show(infoTableName);
        },
    };
});
