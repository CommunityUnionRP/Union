const instructionButtonsDrawler = require("gamemode/scripts/helpers/instructionButtonsDrawler.js");
const { escapeHtml } = require("gamemode/scripts/helpers/stringHelper.js");
const { createPed } = require("gamemode/scripts/helpers/pedHelper.js");

const localPlayer = mp.players.local;
const info = {
	spawn: { position: new mp.Vector3(123.2, -229.06, 54.56), heading: 350 },
	mothers: [ 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 45 ],
	fathers: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 42, 44, 43 ],
	peds: [],
	headOverlaysMenu: [
		// Female
		[
			{ text: "Причёска" },
			{ text: "Брови" },
			{ text: "Дефекты кожи" },
			{ text: "Старение кожи" },
			{ text: "Тип кожи" },
			{ text: "Родинки и веснушки" },
			{ text: "Повреждения кожи" },
			{ text: "Цвет глаз" },
			{ text: "Макияж глаз" },
			{ text: "Румяна" },
			{ text: "Помада" },
		],
		// Male
		[
			{ text: "Причёска" },
			{ text: "Брови" },
			{ text: "Волосы на лице" },
			{ text: "Дефекты кожи" },
			{ text: "Старение кожи" },
			{ text: "Тип кожи" },
			{ text: "Родинки и веснушки" },
			{ text: "Повреждения кожи" },
			{ text: "Цвет глаз" },
			{ text: "Макияж глаз" },
			{ text: "Помада" },
		]
	],
	clothesMenu: [
		// Female
		[
			{ text: "Торс", values: [ "Майка", "Футболка", "Рубашка", "Кофта" ] },
			{ text: "Ноги", values: [ "Джинсы", "Брюки", "Юбка", "Шорты" ] },
			{ text: "Обувь", values: [ "Кроссовки", "Сланцы", "Туфли" ] }
		],
		// Male
		[
			{ text: "Торс", values: [ "Футболка", "Свитшот", "Рубашка", "Майка" ] },
			{ text: "Ноги", values: [ "Джинсы", "Шорты", "Штаны" ] },
			{ text: "Обувь", values: [ "Кроссовки", "Сланцы" ] }
		]
	],
	values: {
		hair: [
			// Female
			[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23 ],
			// Male
			[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22 ]
		],
		eyeColors: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
		headOverlays: [
			// Female
			[ 2, 0, 3, 6, 9, 7, 4, 5, 8 ],
			// Male
			[ 2, 1, 0, 3, 6, 9, 7, 4, 8 ]
		],
		headOverlaysLabels: {
			0: [ "Нет", "Краснуха", "Корь", "Пятна", "Сыпь", "Угри", "Налет", "Гнойники", "Прыщики", "Большие прыщи", "Прыщи", "Сыпь на щеках", "Сыпь на лице", "Расковырянные прыщи", "Пубертат", "Язва", "Сыпь на подбородке", "С двумя лицами", "Зона Т", "Сальная кожа", "Шрамы", "Шрамы от прыщей", "Шрамы от больших прыщей", "Герпес", "Лишай" ],
			3: [ "Нет", "Морщины в углах глаз", "Первые признаки старения", "Средний возраст", "Морщины", "Депрессия", "Преклонный возраст", "Старость", "Обветренная кожа", "Морщинистая кожа", "Обвисшая кожа", "Тяжелая жизнь", "Винтаж", "Пенсионный возраст", "Наркомания", "Престарелость" ],
			6: [ "Нет", "Румянец", "Раздражение от щетины", "Покраснение", "Солнечный ожог", "Синяки", "Алкоголизм", "Пятна", "Тотем", "Кровеносные сосуды", "Повреждения", "Бледная", "Мертвенно-бледная" ],
			7: [ "Нет", "Неровная", "Наждак", "Пятнистая", "Грубая", "Жёсткая", "Шероховатая", "Загрубелая", "Неровная", "Со складками", "Потрескавшаяся", "Твёрдая" ],
			9: [ "Нет", "Ангелочек", "Повсюду", "Местами", "Единичные", "На переносице", "Куколка", "Фея", "Загорелая", "Родинки", "Ряд", "Как у модели", "Редкие", "Веснушки", "Капельки дождя", "Удвоенность", "С одной стороны", "Пары", "Бородавки" ]
		},
		makeups: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 32, 34, 35, 36, 37, 38, 39, 40, 41 ],
		blushes: [ 0, 1, 2, 3, 4, 5, 6 ],
		hairColors: [],
		lipstickColors: [],
		makeupColors: [],
		clothes: [
			/* 
		{ torso: 4, top: { drawable: 16, texture: 2 }, legs: { drawable: 1, texture: 4 }, feets: { drawable: 3, texture: 0 } },
		 */
			// Female
			[
				[ // Торс
					{ drawable: 16, texture: 2, torso: 15 },
					{ drawable: 23, texture: 1, torso: 4 },
					{ drawable: 9, texture: 9, torso: 0 },
					{ drawable: 3, texture: 1, torso: 3 }
				],
				[ // Ноги
					{ drawable: 1, texture: 4 },
					{ drawable: 37, texture: 0 },
					{ drawable: 36, texture: 2 },
					{ drawable: 16, texture: 4 }
				],
				[ // Обувь
					{ drawable: 3, texture: 0 },
					{ drawable: 16, texture: 6 },
					{ drawable: 6, texture: 0 }
				]
			],
			/* 
			{ torso: 0, top: { drawable: 1, texture: 1 }, legs: { drawable: 1, texture: 1 }, feets: { drawable: 1, texture: 2 } },
		 */
			// Male
			[
				[ // Торс
					{ drawable: 1, texture: 1, torso: 0 },
					{ drawable: 8, texture: 14, torso: 8 },
					{ drawable: 12, texture: 5, torso: 12 },
					{ drawable: 5, texture: 2, torso: 5 }
				],
				[ // Ноги
					{ drawable: 1, texture: 1 },
					{ drawable: 15, texture: 3 },
					{ drawable: 5, texture: 4 }
				],
				[ // Обувь
					{ drawable: 1, texture: 2 },
					{ drawable: 16, texture: 10 }
				]
			]
		],
	}
};

const editData = {};

let currentAppearanceItem;
let isPedRotationEnabled = false;

function resetEditData() {
	editData.selectedGender = 0
	editData.fatherIndex = 0;
	editData.motherIndex = 0;
	editData.shapeMix = 0.5;
	editData.skinMix = 0.5;
	editData.faceFeatures = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	editData.appearance = {
		hairIndex: [
			// Female
			4,
			// Male
			4
		],
		hairColorIndex: 0,
		eyeColorIndex: 0,
		headOverlays: {}
	};

	for (let i = 0; i < 10; i++) {
		editData.appearance.headOverlays[i] = { value: i === 2 ? 1 : 255, opacity: 1, colorIndex: isHeadOverlayHasColor(i) ? 0 : -1 }
	}

	editData.clothes = [];

	for (let i = 0; i < 2; i++) {
		editData.clothes[i] = {
			topIndex: 0,
			legsIndex: 0,
			shoesIndex: 0
		};
	}
}

mp.events.add("render", () => {
	if (!isPedRotationEnabled) {
		return;
	}

	handlePedRotation();
});

mp.events.add("regCharacter", (characterName) => {
	const clothes = info.values.clothes[editData.selectedGender];
	const pedClothes = editData.clothes[editData.selectedGender];
	const data = {
		characterName,
		gender: editData.selectedGender,
		father: info.fathers[editData.fatherIndex],
		mother: info.mothers[editData.motherIndex],
		shapeMix: editData.shapeMix,
		skinMix: editData.skinMix,
		faceFeatures: editData.faceFeatures.map((faceFeature) => Math.round(faceFeature*100)/100),
		appearance: {
			hair: info.values.hair[editData.selectedGender][editData.appearance.hairIndex[editData.selectedGender]],
			hairColor: info.values.hairColors[editData.appearance.hairColorIndex],
			eyeColor: info.values.eyeColors[editData.appearance.eyeColorIndex],
			headOverlays: info.values.headOverlays[editData.selectedGender].map((headOverlayId) => {
				const headOverlay = editData.appearance.headOverlays[headOverlayId];
				const color = headOverlay.colorIndex === -1 ? 0 : getHeadOverlayColors(headOverlayId)[headOverlay.colorIndex];

				return { id: headOverlayId, value: headOverlay.value, opacity: headOverlay.opacity, color };
			})
		},
		clothes: {
			top: clothes[0][pedClothes.topIndex],
			legs: clothes[1][pedClothes.legsIndex],
			shoes: clothes[2][pedClothes.shoesIndex],
		},
		skills: localPlayer.skills || [2, 2, 2, 2, 2, 2, 2]
	};

	mp.events.callRemote("regCharacter", JSON.stringify(data));
});

mp.events.add("character_creation::init", async () => {
	if (info.values.hairColors.length === 0) {
		initColors();
	}

	resetEditData();

	localPlayer.position = info.spawn.position;
	localPlayer.setVisible(false, false);
	localPlayer.freezePosition(true);
	editData.selectedGender = 0;

	instructionButtonsDrawler.init();

	mp.game.ui.requestAdditionalText("HAR_MNU", 9);

	mp.events.call("hideEnterAccount");
	menu.execute("hideWindow(.characterInfo')");
	menu.execute("hideWindow('#createCharacter')");
	menu.execute("hideWindow('#selectorCharacters')");
	mp.events.call("focusOnPlayer", localPlayer.position, -10);
	mp.events.call("effect", "MP_job_load", 1);

	await initPeds();
	toggleGender();
	
	mp.gui.cursor.visible = false;
	mp.events.call("selectMenu.show", "character_main");
});

mp.events.add("character_creation::continue", () => {
	backToMainMenu(7);
});

mp.events.add("character_creation::stop", () => {
	localPlayer.setVisible(true, false);
	instructionButtonsDrawler.dispose();

	for (const ped of info.peds) {
		ped.destroy();
	}
});
								
mp.events.add("selectMenu.itemSelected", (menuName, itemName, itemValue, itemIndex) => {
	if (menuName === "character_main") {
		if (itemName === "Наследственность") {
			mp.events.call("selectMenu.show", "character_parents");
			showCharacterSkills();
			mp.events.call("focusOnHead", localPlayer.position, -10);
		} else if (itemName === "Характеристики") {
			mp.events.call("selectMenu.show", "character_faceFeatures");
			mp.events.call("focusOnHead", localPlayer.position, -10);
			showRotateButtons();
		} else if (itemName === "Внешний вид") {
			const items = [...info.headOverlaysMenu[editData.selectedGender], { text: "Вернуться" }];

			mapHeadOverlayItems(items);

			currentAppearanceItem = items[0].text;

			mp.events.call("selectMenu.setSpecialItems", "character_look", items);
			mp.events.call("selectMenu.show", "character_look");
			mp.events.call("focusOnHead", localPlayer.position, -10);
			showButtons(true, true);
		} else if (itemName === "Одежда") {
			const items = [...info.clothesMenu[editData.selectedGender], { text: "Вернуться" }];
			const clothes = editData.clothes[editData.selectedGender];

			items[0].valueIndex = clothes.topIndex;
			items[1].valueIndex = clothes.legsIndex;
			items[2].valueIndex = clothes.shoesIndex;

			mp.events.call("selectMenu.setSpecialItems", "character_clothes", items);
			mp.events.call("selectMenu.show", "character_clothes");
			mp.events.call("focusOnBody", localPlayer.position, -10);
		} else if (itemName === "Далее") {
			mp.events.call("selectMenu.hide");
			menu.execute(`regCharacterHandler()`);
		}
	} else if (menuName === "character_parents") {
		if (itemName === "Вернуться") {
			backToMainMenu(3);
		}
	} else if (menuName === "character_faceFeatures") {
		if (itemName === "Вернуться") {
			backToMainMenu(4);
		}
	} else if (menuName === "character_look") {
		if (itemName === "Вернуться") {
			backToMainMenu(5);
		}
	} else if (menuName === "character_clothes") {
		if (itemName === "Вернуться") {
			backToMainMenu(6);
		}
	}
});

mp.events.add("selectMenu.itemFocusChanged", (menuName, itemName, itemValue, itemIndex, valueIndex) => {
	if (menuName === "character_look") {
		currentAppearanceItem = itemName;
		showButtons(true, ...getButtonsState(itemName));
	} else if (menuName === "character_clothes") {
		if (itemName === "Торс") {
			mp.events.call("focusOnBody", localPlayer.position, -10);
		} else if (itemName === "Ноги") {
			mp.events.call("focusOnLegs", localPlayer.position, -10);
		} else if (itemName === "Обувь") {
			mp.events.call("focusOnFeets", localPlayer.position, -10);
		}
	}
});

mp.events.add("selectMenu.backspacePressed", (menuName) => {
	if (menuName === "character_parents") {
		backToMainMenu(3);
	} else if (menuName === "character_faceFeatures") {
		backToMainMenu(4);
	} else if (menuName === "character_look") {
		backToMainMenu(5);
	} else if (menuName === "character_clothes") {
		backToMainMenu(6);
	}
});

mp.events.add("selectMenu.itemValueChanged", (menuName, itemName, itemValue, itemIndex, valueIndex) => {
	if (menuName === "character_main") {
		if (itemName === "Пол") {
			toggleGender();
		}
	} else if (menuName === "character_parents") {
		if (itemName === "Мама") {
			editData.motherIndex = valueIndex;

			setPedsCurrentHeadBlendData();
			menu.execute(`setMotherImage('${valueIndex}')`);
			showCharacterSkills();
		} else if (itemName === "Папа") {
			editData.fatherIndex = valueIndex;

			setPedsCurrentHeadBlendData();
			menu.execute(`setFatherImage('${valueIndex}')`);
			showCharacterSkills();
		} else if (itemName === "Сходство") {
			editData.shapeMix = (valueIndex * 2) / 100;

			setPedsCurrentHeadBlendData();
			showCharacterSkills();
		} else if (itemName === "Цвет кожи") {
			editData.skinMix = (valueIndex * 2) / 100;

			setPedsCurrentHeadBlendData();
			showCharacterSkills();
		}
	} else if (menuName === "character_faceFeatures") {
		const value = valueIndex * 0.02 - 1;

		editData.faceFeatures[itemIndex] = value;
		setPedsFaceFeature(itemIndex, value);
	} else if (menuName === "character_look") {
		if (itemName === "Причёска") {
			editData.appearance.hairIndex[editData.selectedGender] = valueIndex;

			setPedCurrentHair();
		} else if (itemName === "Цвет глаз") {
			editData.appearance.eyeColorIndex = valueIndex;

			setPedsCurrentEyeColor();
		} else {
			const headOverlayId = getHeadOverlayIdByItemName(itemName);
			let value = valueIndex === 0 ? 255 : valueIndex - 1;

			if (valueIndex > 0) {
				if (headOverlayId === 4) {
					value = info.values.makeups[valueIndex - 1];
				} else if (headOverlayId === 5) {
					value = info.values.blushes[valueIndex - 1];
				}
			}

			editData.appearance.headOverlays[headOverlayId].value = value;

			setPedsCurrentHeadOverlay(headOverlayId);
		}
	} else if (menuName === "character_clothes") {
		if (itemName === "Торс") {
			editData.clothes[editData.selectedGender].topIndex = valueIndex;
		} else if (itemName === "Ноги") {
			editData.clothes[editData.selectedGender].legsIndex = valueIndex;
		} else if (itemName === "Обувь") {
			editData.clothes[editData.selectedGender].shoesIndex = valueIndex;
		}

		setPedCurrentClothes(editData.selectedGender);
	}
});

const Keys = {
	PageUp: 0x21,
	PageDown: 0x22,
	Q: 0x51,
	E: 0x45
};

// E
mp.keys.bind(Keys.E, true, () => { onKeyPressed(Keys.E); });
// Q
mp.keys.bind(Keys.Q, true, () => { onKeyPressed(Keys.Q); });
// PageUp
mp.keys.bind(Keys.PageUp, true, () => { onKeyPressed(Keys.PageUp); });
// PageDown
mp.keys.bind(Keys.PageDown, true, () => { onKeyPressed(Keys.PageDown); });

function onKeyPressed(key) {
	const [ isColorShowed, isOpacityShowed ] = getButtonsState(currentAppearanceItem);

	if (!instructionButtonsDrawler.isActive || (!isColorShowed && !isOpacityShowed)) {
		return;
	}

	if ((key === Keys.PageDown || key === Keys.PageUp) && isColorShowed) {
		const addValue = key === Keys.PageDown ? -1 : 1;

		if (currentAppearanceItem === "Причёска") {
			editData.appearance.hairColorIndex = getNextValidValue(info.values.hairColors, editData.appearance.hairColorIndex, addValue);

			setPedsCurrentHairColor();
		} else {
			const headOverlayId = getHeadOverlayIdByItemName(currentAppearanceItem);
			const colors = getHeadOverlayColors(headOverlayId);

			if (editData.appearance.headOverlays[headOverlayId].colorIndex === -1) {
				return;
			}

			editData.appearance.headOverlays[headOverlayId].colorIndex = getNextValidValue(colors, editData.appearance.headOverlays[headOverlayId].colorIndex, addValue);

			setPedsCurrentHeadOverlayColor(headOverlayId);
		}
	} else if((key === Keys.Q || key === Keys.E) && isOpacityShowed) {
		const headOverlayId = getHeadOverlayIdByItemName(currentAppearanceItem);

		editData.appearance.headOverlays[headOverlayId].opacity += key === Keys.Q ? -0.05 : 0.05;

		if (editData.appearance.headOverlays[headOverlayId].opacity > 1) {
			editData.appearance.headOverlays[headOverlayId].opacity = 1;
		} else if (editData.appearance.headOverlays[headOverlayId].opacity < 0) {
			editData.appearance.headOverlays[headOverlayId].opacity = 0;
		}

		setPedsCurrentHeadOverlay(headOverlayId);

	}
}

function backToMainMenu(itemIndex = 0) {
	if (isPedRotationEnabled) {
		isPedRotationEnabled = false;
		setPedsHeading(info.spawn.heading);
	}

	showButtons(false);
	mp.events.call(`selectMenu.show`, "character_main", itemIndex);
	hideWindow(".infoTable");
	mp.events.call("focusOnPlayer", localPlayer.position, -10);
}

async function initPeds() {
	info.peds = [];

	for (let i = 0; i < 2; i++) {
		const model = mp.game.joaat(i === 1 ? "MP_M_Freemode_01" : "MP_F_Freemode_01");
		const ped = await createPed(model, info.spawn.position, info.spawn.heading, localPlayer.dimension);

		ped.freezePosition(true);
		ped.setCollision(false, false);
		ped.setVisible(false, false);
		
		info.peds.push(ped);
	}

	setPedsCurrentClothes();
	setPedsCurrentHair();
	setPedsCurrentHairColor();
	setPedsCurrentHeadBlendData();
	setPedsCurrentFaceFeatures();
	setPedsCurrentEyeColor();
	setPedsCurrentHeadOverlays();
	setPedsCurrentHeadOverlaysColors();
}

function toggleGender() {
	const previousPed = getCurrentPed();

	editData.selectedGender = editData.selectedGender === 1 ? 0 : 1;

	const currentPed = getCurrentPed();

	previousPed.setVisible(false, false);
	currentPed.setVisible(true, false);
}

function setPedsCurrentClothes() {
	for (let i = 0; i < 2; i++) {
		setPedCurrentClothes(i);
	}
}

function setPedCurrentClothes(pedIndex) {
	const ped = info.peds[pedIndex];
	const clothes = info.values.clothes[pedIndex];
	const pedClothes = editData.clothes[pedIndex];
	const top = clothes[0][pedClothes.topIndex];
	const legs = clothes[1][pedClothes.legsIndex];
	const shoes = clothes[2][pedClothes.shoesIndex];
		
	ped.setComponentVariation(3, top.torso, 0, 0);
	ped.setComponentVariation(4, legs.drawable, legs.texture, 0);
	ped.setComponentVariation(6, shoes.drawable, shoes.texture, 0);
	ped.setComponentVariation(8, pedIndex === 0 ? 14 : 15, 0, 0);
	ped.setComponentVariation(11, top.drawable, top.texture, 0);

	// ped.setComponentVariation(2, info.values.hair[i][editData.appearance.hairIndex[i]], ped.getTextureVariation(2), 2);
	// ped.setComponentVariation(3, clothes.torso, 0, 0);
	// ped.setComponentVariation(4, clothes.legs.drawable, clothes.legs.texture, 0);
	// ped.setComponentVariation(6, clothes.feets.drawable, clothes.feets.texture, 0);
	// ped.setComponentVariation(11, clothes.top.drawable, clothes.top.texture, 0);
}

function getCurrentPed() {
	return info.peds[editData.selectedGender];
}

function setPedsCurrentHeadBlendData() {
	const mother = info.mothers[editData.motherIndex];
	const father = info.fathers[editData.fatherIndex];

	for (const ped of info.peds) {
		ped.setHeadBlendData(mother, father, 0, mother, father, 0, editData.shapeMix, editData.skinMix, 0, false);
	}
}

function setPedsCurrentHairColor() {
	const color = info.values.hairColors[editData.appearance.hairColorIndex];

	for (const ped of info.peds) {
		ped.setHairColor(color, color);
	}
}

function setPedsCurrentFaceFeatures() {
	for (let i = 0; i < editData.faceFeatures.length; i++) {
		setPedsFaceFeature(i, editData.faceFeatures[i]);
	}
}

function setPedsFaceFeature(index, value) {
	for (const ped of info.peds) {
		ped.setFaceFeature(index, value);
	}
}

function setPedsCurrentHair() {
	for (let i = 0; i < 2; i++) {
		const ped = info.peds[i];
		const hairs = info.values.hair[i];
		const currentHairIndex = editData.appearance.hairIndex[i];

		ped.setComponentVariation(2, hairs[currentHairIndex], ped.getTextureVariation(2), 2);
	}	
}

function setPedCurrentHair() {
	const ped = info.peds[editData.selectedGender];
	const hairs = info.values.hair[editData.selectedGender];
	const currentHairIndex = editData.appearance.hairIndex[editData.selectedGender];

	ped.setComponentVariation(2, hairs[currentHairIndex], ped.getTextureVariation(2), 2);
}

function setPedsCurrentEyeColor() {
	for (const ped of info.peds) {
		ped.setEyeColor(info.values.eyeColors[editData.appearance.eyeColorIndex]);
	}
}

function setPedsCurrentHeadOverlays() {
	for (let i = 0; i < info.peds.length; i++) {
		const ped = info.peds[i];

		for (const headOverlayId of info.values.headOverlays[i]) {
			const headOverlay = editData.appearance.headOverlays[headOverlayId];

			ped.setHeadOverlay(headOverlayId, headOverlay.value, headOverlay.opacity);
		}
	}
}

function setPedsCurrentHeadOverlay(headOverlayId) {
	for (let i = 0; i < info.peds.length; i++) {
		if (info.values.headOverlays[i].indexOf(headOverlayId) < 0) {
			continue;
		}

		const ped = info.peds[i];
		const headOverlay = editData.appearance.headOverlays[headOverlayId];

		ped.setHeadOverlay(headOverlayId, headOverlay.value, headOverlay.opacity);
	}
}

function setPedsCurrentHeadOverlaysColors() {
	for (let i = 0; i < info.peds.length; i++) {
		const ped = info.peds[i];

		for (const headOverlayId of info.values.headOverlays[i]) {
			const headOverlay = editData.appearance.headOverlays[headOverlayId];

			if (headOverlay.colorIndex === -1) {
				continue;
			}

			const color = getHeadOverlayColors(headOverlayId)[headOverlay.colorIndex];

			ped.setHeadOverlayColor(headOverlayId, getHeadOverlayColorType(headOverlayId), color, color);
		}
	}
}

function setPedsCurrentHeadOverlayColor(headOverlayId) {
	for (let i = 0; i < info.peds.length; i++) {
		if (info.values.headOverlays[i].indexOf(headOverlayId) < 0) {
			continue;
		}

		const ped = info.peds[i];
		const headOverlay = editData.appearance.headOverlays[headOverlayId];

		if (headOverlay.colorIndex === -1) {
			continue;
		}

		const color = getHeadOverlayColors(headOverlayId)[headOverlay.colorIndex];

		ped.setHeadOverlayColor(headOverlayId, getHeadOverlayColorType(headOverlayId), color, color);
	}
}

function showCharacterSkills() {
	mp.events.call("showCharacterSkills", editData.fatherIndex, editData.motherIndex);
}

function mapHeadOverlayItems(items) {
	items.map((item) => {
		if (item.text === "Вернуться") {
			return item;
		}

		if (item.text === "Причёска") {
			const labelTemplate = `CC_${(editData.selectedGender === 1 ? "M" : "F")}_HS_`;
			const currentHairIndex = editData.appearance.hairIndex[editData.selectedGender];
			let selectedIndex = 0;

			item.values = [];

			for (let i = 0; i < info.values.hair[editData.selectedGender].length; i++) {
				const hairValue = info.values.hair[editData.selectedGender][i];

				if (i === currentHairIndex) {
					selectedIndex = i;
				}

				const label = mp.game.ui.getLabelText(labelTemplate + hairValue.toString());

				item.values.push(escapeHtml(label));
			}

			item.valueIndex = selectedIndex;
		} else if (item.text === "Цвет глаз") {
			let selectedIndex = 0;

			item.values = [];

			for (let i = 0; i < info.values.eyeColors.length; i++) {
				if (i === editData.appearance.eyeColorIndex) {
					selectedIndex = i;
				}

				const label = mp.game.ui.getLabelText(`FACE_E_C_${info.values.eyeColors[i]}`);

				item.values.push(escapeHtml(label));
			}

			item.valueIndex = selectedIndex;
		} else {
			const headOverlayId = getHeadOverlayIdByItemName(item.text);
			const itemsCount = getHeadOverlayItemsCount(headOverlayId);
			const currentHeadOverlay = editData.appearance.headOverlays[headOverlayId];
			let selectedIndex = 0;

			item.values = [ ];

			for (let i = 0; i <= itemsCount; i++) {
				if (currentHeadOverlay.value === i - 1) {
					selectedIndex = i;
				}

				const label = getHeadOverlayLabel(headOverlayId, i);
				const text = info.values.headOverlaysLabels[headOverlayId] ? label : mp.game.ui.getLabelText(label);
				
				item.values.push(escapeHtml(text));
			}

			item.valueIndex = selectedIndex;
		}

		return item;
	});
}

function getHeadOverlayItemsCount(headOverlayId) {
	if (headOverlayId === 4) {
		return info.values.makeups.length;
	} else if (headOverlayId === 5) {
		return info.values.blushes.length;
	}

	return mp.game.ped.getNumHeadOverlayValues(headOverlayId);
}

function isHeadOverlayHasColor(headOverlayId) {
	return headOverlayId === 1 || headOverlayId === 2 || headOverlayId === 5 || headOverlayId === 8;
}

function getHeadOverlayIdByItemName(name) {
	switch (name) {
		case "Брови":
			return 2;
		case "Волосы на лице":
			return 1;
		case "Дефекты кожи":
			return 0;
		case "Старение кожи":
			return 3;
		case "Тип кожи":
			return 6;
		case "Родинки и веснушки":
			return 9;
		case "Повреждения кожи":
			return 7;
		case "Макияж глаз":
			return 4;
		case "Румяна":
			return 5;
		case "Помада":
			return 8;
	}
}

function getHeadOverlayLabel(headOverlayId, index) {
	switch (headOverlayId) {
		case 1: // Beard
			return index <= 19 ? `HAIR_BEARD${index}` : `BRD_HP_${index-20}`;
		case 2: // Eyebrows
			return index === 0 ? "NONE" : `CC_EYEBRW_${index-1}`;
		case 4: // Makeup
			return index === 0 ? "NONE" : `CC_MKUP_${info.values.makeups[index-1]}`;
		case 5: // Blush
			return index === 0 ? "NONE" : `CC_BLUSH_${info.values.blushes[index-1]}`;
		case 8: // Lipstick
			return index === 0 ? "NONE" : `CC_LIPSTICK_${index-1}`;
		default:
			return info.values.headOverlaysLabels[headOverlayId] ? info.values.headOverlaysLabels[headOverlayId][index] : "NONE";
	}
}

function showButtons(state, color = false, opacity = false) {
	if (!color && !opacity) {
		state = false;
	}

	if (state) {
		const buttons = [];

		if (color) {
			buttons.push({ altControl: "b_1009%b_1010", label: "face_ccol" });
		}

		if (opacity) {
			buttons.push({ altControl: "t_E%t_Q", label: "ITEM_B_OPACITY" });
		}

		instructionButtonsDrawler.setButtons(...buttons);
	}

	instructionButtonsDrawler.setActive(state);
}

function showRotateButtons() {
	instructionButtonsDrawler.setButtons({ altControl: "t_E%t_Q", label: "FE_HLP24" });
	instructionButtonsDrawler.setActive(true);
	isPedRotationEnabled = true;
}

// [ color, opacity ]
function getButtonsState(itemName) {
	if (itemName === "Причёска") {
		return [ true, false ];
	} else if (itemName === "Цвет глаз" || itemName === "Вернуться") {
		return [ false, false ];
	} else if (itemName === "Брови" || itemName === "Волосы на лице" || itemName === "Помада" || itemName === "Румяна") {
		return [ true, true ];
	}

	return [ false, true ];
}

function initColors() {
	const maxColors = Math.max(mp.game.invoke("0xE5C0CF872C2AD150"), mp.game.invoke("0xD1F7CA1535D22818"));

	for (let i = 0; i < maxColors; i++) {
		if (mp.game.ped.isAValidHairColor(i)) {
			info.values.hairColors.push(i);
		}

		if (mp.game.ped.isAValidLipstickColor(i)) {
			info.values.lipstickColors.push(i);
		}

		if (mp.game.ped.isAValidBlushColor(i)) {
			info.values.makeupColors.push(i);
		}
	}
}

function getNextValidValue(collection, currentValue, additionValue) {
	let value = currentValue + additionValue;

	if (value < 0) {
		value = collection.length - 1;
	}

	if (value >= collection.length) {
		value = 0;
	}

	return value;
}

function getHeadOverlayColorType(headOverlayId) {
	switch (headOverlayId) {
		case 1: case 2: case 10:
			return 1;
		case 5: case 8:
			return 2;
		default:
			return 0;
	}
}

function getHeadOverlayColors(headOverlayId) {
	switch (headOverlayId) {
		case 1:
		case 2:
			return info.values.hairColors;
		case 5:
			return info.values.makeupColors;
		case 8:
			return info.values.lipstickColors;
		default:
			return [];
	}
}

function handlePedRotation() {
	const leftPressed = mp.game.controls.isDisabledControlPressed(2, 205);
	const rightPressed = mp.game.controls.isDisabledControlPressed(2, 206);

	if (!leftPressed && !rightPressed) {
		return;
	}

	let heading = info.peds[0].getHeading();

	heading += leftPressed ? -1.5 : 1.5;
	
	if (heading > 360) {
		heading = 0;
	} else if (heading < 0) {
		heading = 360;
	}

	setPedsHeading(heading);
}

function setPedsHeading(value) {
	for (const ped of info.peds) {
		ped.setHeading(value);
	}
}

let menu;

exports = (m) => {
	menu = m;
}
