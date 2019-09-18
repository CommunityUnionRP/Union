const HelperInfo = {
  main: {
    open: false,
    file: "helper_main",
    head: "Помощь",
    buttons: [{ text: "Начало игры"}, { text: "Работы"}, { text: "Организации"}, { text: "Закрыть"}]
  },
  second: {
    file: "help_menu",
    buttons: [
     { head: "Начало игры", text: "Для начала вам следует купить машину в автосалоне премиум класса." },
     { head: "Работы", text: "Работы сидят и ждут вас с лаской, торопитесь!"},
     { head: "Организации", text: "Организации для настоящих тру-рпшников, уходи."},
     { head: "Начало игры", text: "Hola amigo! Сomo estuvo tu vuelo? Ладно, ладно не переживай… Приветствую тебя в нашем солнечном штате! Для полного удобства проживания у нас в штате, ты можешь использовать меню на клавишу М. Именно там, можешь узнать всю необходимую информацию, а также воспользоваться дополнительными настройками своего персонажа. Ты спросишь, а как я смогу открыть инвентарь? Ответ будет очень прост, тебе нужно нажать на клавишу I. Если тебе понадобятся деньги, ты можешь устроиться на работу, информацию о всех работах можешь узнать также в меню. Ладно, не буду тебя задерживать, если тебе понадобится транспорт, то через дорогу ты можешь арендовать скутер. Приятного путешествия по нашему штату." }
    ]
  },
  blips: [
    mp.blips.new(280, new mp.Vector3(-1028.10, -2738.47, 13.80), { alpha: 255, scale: 0.7, color: 3, name: "Помощник", shortRange: true }),
    mp.blips.new(280, new mp.Vector3(562.88, -1750.25, 29.28), { alpha: 255, scale: 0.7, color: 3, name: "Помощник", shortRange: true }),
    mp.blips.new(280, new mp.Vector3(1538.44, 3766.79, 34.06), { alpha: 255, scale: 0.7, color: 3, name: "Помощник", shortRange: true }),
    mp.blips.new(280, new mp.Vector3(-169.76, 6439.63, 31.92), { alpha: 255, scale: 0.7, color: 3, name: "Помощник", shortRange: true }),
  ],
  peds: [
    mp.peds.new(-1382092357, new mp.Vector3(-1028.10, -2738.47, 13.80), 106.0, (streamPed) => { streamPed.setAlpha(50); }, 0),
    mp.peds.new(-1382092357, new mp.Vector3(562.88, -1750.25, 29.28), 230.38, (streamPed) => { streamPed.setAlpha(50); }, 0),
    mp.peds.new(-1382092357, new mp.Vector3(1538.44, 3766.79, 34.06), 32.22, (streamPed) => { streamPed.setAlpha(50); }, 0),
    mp.peds.new(-1382092357, new mp.Vector3(-169.76, 6439.63, 31.92), 188.19, (streamPed) => { streamPed.setAlpha(50); }, 0),
  ],
  colshape: [
    mp.colshapes.newSphere(-1028.10, -2738.47, 13.80, 1.5),
    mp.colshapes.newSphere(562.88, -1750.25, 29.28, 1.5),
    mp.colshapes.newSphere(1538.44, 3766.79, 34.06, 1.5),
    mp.colshapes.newSphere(-169.76, 6439.63, 31.92, 1.5),
  ],
  keydown_E: false
};

mp.events.add('playerEnterColshape', (shape) => {
 if (HelperInfo.colshape.includes(shape) && !mp.players.local.vehicle) {
   mp.events.call("prompt.show", `Нажмите <span>Е</span> для взаимодействия`);
   HelperInfo.keydown_E = true;
 }
});
mp.events.add('playerExitColshape', (shape) => {
  if (HelperInfo.colshape.includes(shape)) {
    HelperInfo.keydown_E = false;
    if (HelperInfo.main.open) {
      mp.events.call("selectMenu.hide", HelperInfo.main.file);
      HelperInfo.main.open = false;
    }
  }
});

mp.keys.bind(0x45, false, function () { // E key
  if (!mp.players.local.vehicle && HelperInfo.keydown_E && !HelperInfo.main.open) {
    // fastShow(HelperInfo.main.file, HelperInfo.main.head, HelperInfo.main.buttons);
    HelperInfo.main.open = true;
    mp.events.call("modal.show", HelperInfo.second.file, HelperInfo.second.buttons[3]);
  }
});

mp.events.add('update.help.main.open', (status) => {
    HelperInfo.main.open = status;
});

mp.events.add("selectMenu.itemSelected", (menuName, itemName, itemValue, itemIndex) => {
	if (menuName === HelperInfo.main.file) {
    if (itemName === HelperInfo.main.buttons[3].text) {
      mp.events.call("selectMenu.hide", HelperInfo.main.file);
      HelperInfo.main.open = false;
      return;
    }
    for (let i = 0; i < HelperInfo.main.buttons.length; i++) {
      if (itemName === HelperInfo.main.buttons[i].text) {
        // HelperInfo.main.open = false;
        mp.events.call("selectMenu.hide", HelperInfo.main.file);
        mp.events.call("modal.show", HelperInfo.second.file, HelperInfo.second.buttons[i]);
      }
    }
	}
});

function fastShow(file, head, buttons) {
  mp.events.call("selectMenu.setHeader", file, head);
  mp.events.call("selectMenu.setSpecialItems", file, buttons);
  mp.events.call("selectMenu.show", file);
}
