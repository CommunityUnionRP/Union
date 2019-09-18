$(document).ready(() => {
    const SHOW_TIME = 10000;

    var prompts = {
        "select_menu": {
            text: "Используйте <span>&uarr;</span> <span>&darr;</span> <span>&crarr;</span> для выбора пункта в меню.",
            showTime: 60000
        },
        "vehicle_engine": {
            text: "Нажмите <span>2</span>, чтобы завести двигатель автомобиля."
        },
        "vehicle_repair": {
            text: "Автомобиль поломался. Необходимо вызвать механика."
        },
        "choiceMenu_help": {
            text: "Используйте клавиши <span>y</span> и <span>n</span>",
            header: "Диалог предложения",
        },
        "documents_help": {
            text: "Нажмите <span>e</span> для закрытия",
            header: "Документы",
        },
        "health_help": {
            text: "Приобрести медикаменты можно в больнице.",
            header: "Лечение",
        },
        "police_service_recovery_carkeys": {
            text: "Вызовите службу, чтобы пригнать авто к участку.",
            header: "Восстановление ключей",
        },
    }

    window.promptAPI = {
        showByName: (name) => {
            var info = prompts[name];
            if (!info) return;
            var showTime = SHOW_TIME;
            if (info.showTime) showTime = info.showTime;

            promptAPI.show(info.text, info.header, showTime);
        },
        show: (text, header = "Подсказка", showTime = SHOW_TIME) => {
            $(".prompt .header").text(header);
            $(".prompt .text").html(text);

            if (chatAPI.isLeft()) {
                $('.prompt').css('left', '');
                $('.prompt').css('top', '1vh');
                $('.prompt').css('right', '1vh');
                $('.prompt').css('bottom', '');
            } else {
                $('.prompt').css('left', '1vh');
                $('.prompt').css('top', '1vh');
                $('.prompt').css('right', '');
                $('.prompt').css('bottom', '');
            }

            var height = Math.abs(parseFloat($(".prompt .header").height()) + parseFloat($(".prompt .text").height()));
            $(".prompt .body").height(height);

            $(".prompt").slideDown("fast");
            setTimeout(() => {
                promptAPI.hide();
            }, showTime);
        },
        hide: () => {
            $(".prompt").slideUp("fast");
        }
    };
});
