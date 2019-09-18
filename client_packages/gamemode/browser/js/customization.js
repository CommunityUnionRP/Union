var customizationApp;

var colors = ["#ff0000", "#a20000", "#370000", "#000000", "#ec00b7", "#8e006e", "#530040", "#4800ff", "#2f00a8", "#1c0161", "#0096ff", "#005692"];

var mothers = [
    ["female_1", "Имя мамы 1"],
    ["female_2", "Имя мамы 2"],
    ["female_3", "Имя мамы 2"],
    ["female_4", "Имя мамы 3"],
    ["female_5", "Имя мамы 4"],
    ["female_6", "Имя мамы 5"],
    ["female_7", "Имя мамы 6"],
    ["female_8", "Имя мамы 7"],
    ["female_9", "Имя мамы 8"],
    ["female_10", "Имя мамы 9"],
    ["female_11", "Имя мамы 10"],
    ["female_12", "Имя мамы 11"],
    ["female_13", "Имя мамы 12"],
    ["female_14", "Имя мамы 13"],
    ["female_15", "Имя мамы 14"],
    ["female_16", "Имя мамы 15"],
    ["female_17", "Имя мамы 16"],
    ["female_18", "Имя мамы 17"],
    ["female_19", "Имя мамы 18"],
    ["female_20", "Имя мамы 19"],
    ["special_female_0", "Имя мамы 20"]
];

var fathers = [
    ["male_1", "Имя папы 1"],
    ["male_2", "Имя папы 2"],
    ["male_3", "Имя папы 3"],
    ["male_4", "Имя папы 4"],
    ["male_5", "Имя папы 5"],
    ["male_6", "Имя папы 6"],
    ["male_7", "Имя папы 7"],
    ["male_8", "Имя папы 8"],
    ["male_9", "Имя папы 9"],
    ["male_10", "Имя папы 10"],
    ["male_11", "Имя папы 11"],
    ["male_12", "Имя папы 12"],
    ["male_13", "Имя папы 13"],
    ["male_14", "Имя папы 14"],
    ["male_15", "Имя папы 15"],
    ["male_16", "Имя папы 16"],
    ["male_17", "Имя папы 17"],
    ["male_18", "Имя папы 18"],
    ["male_19", "Имя папы 19"],
    ["male_20", "Имя папы 20"],
    ["special_male_0", "Тонни"],
    ["special_male_1", "Нико"]
];

var characters = ["Характер 1", "Характер 2", "Характе 3", "Характер 4", "Характер 5", "Характер 6"];
var eyebrows = ["Широкие", "Узкие", "Крутые"];

var motherList = [];
for (var i = 0; i < mothers.length; i++) motherList[i] = mothers[i][1];
var fatherList = [];
for (var i = 0; i < fathers.length; i++) fatherList[i] = fathers[i][1];

var items = [
    ["Мама", "motherSelector", motherList, 0],
    ["Папа", "fatherSelector", fatherList, 0],
    ["Веншний вид"],
    ["Цвет кожи"],
    ["Характер", "characterSelector", characters, 0],
    ["Брови", "eyebrowsSelector", eyebrows, 0],

];

$(document).ready(function() {

    customizationApp = new Vue({
        el: '.customizationMenu',
        data: {
            selectedItem: 0,
            maxItem: 0,

            limit: 0,

            selectedColor: 0,
            maxColor: 0,
            limitColor: 0,

            motherPic: "img/customization/parent/male_18.png",
            fatherPic: "img/customization/parent/female_20.png"
        },
        methods: {

            selectItem: function(item) {
                if (customizationApp.$data.selectedItem !== item) {

                    $(".setting-item:eq(" + customizationApp.$data.selectedItem + ")").removeClass("setting-item-active");
                    $(".setting-item:eq(" + item + ")").addClass("setting-item-active");
                    customizationApp.$data.selectedItem = item;
                }
            },
            navigationTo: function(to) {
                if (to) {
                    moveMenuToBottom();
                } else {
                    moveMenuToTop();
                }
            },
            selectColor: function(color) {
                $(".color-selector-list div:eq(" + customizationApp.$data.selectedColor + ")").find("i").remove();
                customizationApp.$data.selectedColor = color;
                $(".color-selector-list div:eq(" + customizationApp.$data.selectedColor + ")").append("<i class='selected-block'></i>");
            },
            colorsTo: function(to) {
                if (to) {

                    $(".color-selector-list div:eq(" + customizationApp.$data.selectedColor + ")").find("i").remove();

                    customizationApp.$data.selectedColor++;
                    if (customizationApp.$data.selectedColor > customizationApp.$data.limitColor) {
                        customizationApp.$data.limitColor++;
                        if (customizationApp.$data.limitColor >= colors.length - 1) {
                            customizationApp.$data.limitColor = 8;
                        }
                        $(".color-selector-list div:eq(" + (customizationApp.$data.selectedColor - 9) + ")").hide();
                        $(".color-selector-list div:eq(" + customizationApp.$data.selectedColor + ")").show();

                        $(".color-selector-list div:eq(" + (customizationApp.$data.selectedColor - 8) + ")").addClass("first-selected-block");
                        $(".color-selector-list div:eq(" + (customizationApp.$data.selectedColor - 1) + ")").removeClass("last-selected-block");
                        $(".color-selector-list div:eq(" + customizationApp.$data.selectedColor + ")").addClass("last-selected-block");
                    }

                    if (customizationApp.$data.selectedColor > colors.length - 1) {
                        customizationApp.$data.selectedColor = 0;
                        customizationApp.$data.limitColor = 8;

                        for (var i = 0; i < colors.length; i++) {

                            $(".color-selector-list div:eq(" + i + ")").removeClass("first-selected-block");
                            $(".color-selector-list div:eq(" + i + ")").removeClass("last-selected-block");
                            if (i < 9) {

                                if (i == 0) $(".color-selector-list div:eq(" + i + ")").addClass("first-selected-block");
                                else if (i == 8) $(".color-selector-list div:eq(" + i + ")").addClass("last-selected-block");
                                $(".color-selector-list div:eq(" + i + ")").show();
                            } else $(".color-selector-list div:eq(" + i + ")").hide();
                        }
                    }
                    $(".color-selector-list div:eq(" + customizationApp.$data.selectedColor + ")").append("<i class='selected-block'></i>");
                } else {
                    $(".color-selector-list div:eq(" + customizationApp.$data.selectedColor + ")").find("i").remove();

                    customizationApp.$data.selectedColor--;

                    if (customizationApp.$data.selectedColor < (customizationApp.$data.limitColor - 8)) {
                        customizationApp.$data.limitColor = colors.length - 1;
                        $(".color-selector-list div:eq(" + (customizationApp.$data.selectedColor - 8) + ")").hide();
                        $(".color-selector-list div:eq(" + customizationApp.$data.selectedColor + ")").show();

                        $(".color-selector-list div:eq(" + customizationApp.$data.selectedColor + ")").addClass("first-selected-block");
                        $(".color-selector-list div:eq(" + (customizationApp.$data.selectedColor + 1) + ")").removeClass("first-selected-block");
                        $(".color-selector-list div:eq(" + (customizationApp.$data.selectedColor - 8) + ")").addClass("last-selected-block");
                    }

                    if (customizationApp.$data.selectedColor < 0) {
                        customizationApp.$data.selectedColor = colors.length - 1;

                        for (var i = 0; i < colors.length; i++) {

                            $(".color-selector-list div:eq(" + i + ")").removeClass("first-selected-block");
                            $(".color-selector-list div:eq(" + i + ")").removeClass("last-selected-block");

                            if (i > (colors.length - 9 - 1)) {
                                if (i == (colors.length - 9)) $(".color-selector-list div:eq(" + i + ")").addClass("first-selected-block");
                                else if (i == (colors.length - 1)) $(".color-selector-list div:eq(" + i + ")").addClass("last-selected-block");

                                $(".color-selector-list div:eq(" + i + ")").show();
                            } else $(".color-selector-list div:eq(" + i + ")").hide();
                        }
                    }

                    $(".color-selector-list div:eq(" + customizationApp.$data.selectedColor + ")").append("<i class='selected-block'></i>");
                }
            }
        },
        created: function() {
            for (var i = 0; i < items.length; i++) {

                var style = "";
                if (i >= 6) style += "display: none;";

                var settingsItem = "";
                if (items[i][1] === "motherSelector") {
                    settingsItem = `<span class="settings-selector">` + motherList[0] + `</span>`;
                } else if (items[i][1] === "fatherSelector") {
                    settingsItem = `<span class="settings-selector">` + fatherList[0] + `</span>`;
                } else if (items[i][1] === "characterSelector") {
                    settingsItem = `<span class="settings-selector">` + characters[0] + `</span>`;
                } else if (items[i][1] === "eyebrowsSelector") {
                    settingsItem = `<span class="settings-selector">` + eyebrows[0] + `</span>`;
                }

                $(".character-settings").append(`
                    <li class="setting-item" v-on:click="selectItem(` + i + `)" style="` + style + `">
                    <div>` + items[i][0] + settingsItem + `</div>
                    </li>`);
            }

            for (var i = 0; i < colors.length; i++) {

                var style = "";
                if (i >= 9) style += "display: none";

                $(".color-selector-list").append(`
                    <div class="color-block" v-on:click="selectColor(` + i + `)" style="background: ` + colors[i] + `;` + style + `;"></div>
                `);
            }
        }
    });

    customizationApp.$data.selectedItem = 0;
    customizationApp.$data.limitTop = 0;
    customizationApp.$data.limitBottom = 5;
    customizationApp.$data.maxItem = items.length;

    $(".setting-item:eq(" + customizationApp.$data.selectedItem + ")").addClass("setting-item-active");
    $(".color-selector-list div:eq(" + customizationApp.$data.selectedColor + ")").append("<i class='selected-block'></i>");
    $(".color-selector-list div:eq(0)").addClass("first-selected-block");
    $(".color-selector-list div:eq(8)").addClass("last-selected-block");

    customizationApp.$data.maxColor = colors.length;
    customizationApp.$data.limitColor = 8;

    $(document).keyup(function(event) {

        if (event.keyCode == 38) { // Up
            moveMenuToTop();
        } else if (event.keyCode == 40) { // Down
            moveMenuToBottom();
        } else if (event.keyCode == 37) { // Left
            selectorToLeft();
        } else if (event.keyCode == 39) { // Right
            selectorToRight();
        }
    });

    window.addEventListener('wheel', function(e) {
        var delta = e.deltaY || e.detail || e.wheelData;

        if (delta > 0) {
            moveMenuToBottom();
        } else if (delta < 0) {
            moveMenuToTop();
        }
    });
});

function moveMenuToTop() {

    $(".setting-item:eq(" + customizationApp.$data.selectedItem + ")").removeClass("setting-item-active");
    customizationApp.$data.selectedItem--;

    if (customizationApp.$data.selectedItem < customizationApp.$data.limitTop) {

        customizationApp.$data.limitBottom--;
        if (customizationApp.$data.limitTop-- < 0) {
            customizationApp.$data.limitTop = (customizationApp.$data.maxItem - 6);
        }

        for (var i = 0; i < customizationApp.$data.maxItem; i++) {

            if (i >= customizationApp.$data.limitTop && i <= customizationApp.$data.limitBottom) $(".setting-item:eq(" + i + ")").show();
            else $(".setting-item:eq(" + i + ")").hide();
        }
    }

    if (customizationApp.$data.selectedItem < 0) {
        customizationApp.$data.selectedItem = customizationApp.$data.maxItem - 1;
        customizationApp.$data.limitBottom = customizationApp.$data.selectedItem;
        customizationApp.$data.limitTop = customizationApp.$data.limitBottom - 5;

        // Перестариваем айтимы в зависимости
        for (var i = 0; i < customizationApp.$data.maxItem; i++) {

            if (i >= (customizationApp.$data.limitBottom - 5) && i <= customizationApp.$data.limitBottom) $(".setting-item:eq(" + i + ")").show();
            else $(".setting-item:eq(" + i + ")").hide();
        }
    }
    $(".setting-item:eq(" + customizationApp.$data.selectedItem + ")").addClass("setting-item-active");

}

function moveMenuToBottom() {

    $(".setting-item:eq(" + customizationApp.$data.selectedItem + ")").removeClass("setting-item-active");
    customizationApp.$data.selectedItem++;

    if (customizationApp.$data.selectedItem >= items.length) {
        customizationApp.$data.selectedItem = 0;
        customizationApp.$data.limitTop = 0;
        customizationApp.$data.limitBottom = 5;

        // Перестариваем айтимы в зависимости
        for (var i = 0; i < customizationApp.$data.maxItem; i++) {

            if (i >= 0 && i <= customizationApp.$data.limitBottom) $(".setting-item:eq(" + i + ")").show();
            else $(".setting-item:eq(" + i + ")").hide();
        }
    }
    $(".setting-item:eq(" + customizationApp.$data.selectedItem + ")").addClass("setting-item-active");

    if (customizationApp.$data.selectedItem > customizationApp.$data.limitBottom) {

        customizationApp.$data.limitTop++;
        if (customizationApp.$data.limitBottom++ > items.length) {
            customizationApp.$data.limitTop = 0;
            customizationApp.$data.limitBottom = 5;
        }

        for (var i = 0; i < customizationApp.$data.maxItem; i++) {

            if (i >= (customizationApp.$data.limitBottom - 5) && i <= customizationApp.$data.limitBottom) $(".setting-item:eq(" + i + ")").show();
            else $(".setting-item:eq(" + i + ")").hide();
        }
    }
}

function selectorToLeft() {

    var item = customizationApp.$data.selectedItem;
    if (
        items[item][1] === "motherSelector" ||
        items[item][1] === "fatherSelector" ||
        items[item][1] === "characterSelector" ||
        items[item][1] === "eyebrowsSelector"
    ) {

        items[item][3]--;
        if (items[item][3] < 0) {
            items[item][3] = items[item][2].length - 1;
        }

        $(".setting-item:eq(" + item + ")").find("span").text(items[item][2][items[item][3]]);

        if (items[item][1] === "motherSelector") {
            $('.family-preview img:first-child').attr('src', 'img/customization/parent/' + mothers[items[item][3]][0] + '.png');
        } else if (items[item][1] === "fatherSelector") {
            $('.family-preview img:last-child').attr('src', 'img/customization/parent/' + fathers[items[item][3]][0] + '.png');
        }
    }
}

function selectorToRight() {

    var item = customizationApp.$data.selectedItem;
    if (
        items[item][1] === "motherSelector" ||
        items[item][1] === "fatherSelector" ||
        items[item][1] === "characterSelector" ||
        items[item][1] === "eyebrowsSelector"
    ) {

        items[item][3]++;
        if (items[item][3] > items[item][2].length - 1) {
            items[item][3] = 0;
        }

        $(".setting-item:eq(" + item + ")").find("span").text(items[item][2][items[item][3]]);

        if (items[item][1] === "motherSelector") {
            $('.family-preview img:first-child').attr('src', 'img/customization/parent/' + mothers[items[item][3]][0] + '.png');
        } else if (items[item][1] === "fatherSelector") {
            $('.family-preview img:last-child').attr('src', 'img/customization/parent/' + fathers[items[item][3]][0] + '.png');
        }
    }
}
