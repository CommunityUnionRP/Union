$(document).ready(() => {
    var modals = {
        "character_reg": {
            header: "Новый персонаж",
            location: "center",
            noClose: true,
            content: `Для завершения создания персонажа остался последний шаг.<br/>
                        Придумайте имя в формате "Имя Фамилия".<br/>


                        <br/><br />

                        <span>Введите имя:</span>
                        <input type="text" placeholder="Имя персонажа" class="characterName"/>
                        <br/><br/>
                        <center><button onclick="regCharacterHandler()">Создать</button></center>`,
            on: () => {
                modals["character_reg"].off();
                $(".modal .characterName").on("keydown", (e) => {
                    if (e.keyCode == 13) regCharacterHandler();
                });
            },
            off: () => {
                $(".modal .characterName").off("keydown");
            },
        },
        "closed_mode": {
            header: "Закрытый доступ",
            location: "center",
            content: `Над сервером проводятся тех. работы.<br/>
                        Информация в Discord: <span style='color: #0bf'>discord.gg/jFFMb9G.</span><br/>


                        <br/><br />

                        <span>Введите пароль:</span>
                        <input type="text" placeholder="PIN" class="pin"/>
                        <br/><br/>
                        <center><button onclick="closedModeHandler()">Войти</button></center>`,
            on: () => {
                modals["closed_mode"].off();
                $(".modal .pin").on("keydown", (e) => {
                    if (e.keyCode == 13) closedModeHandler();
                });
            },
            off: () => {
                $(".modal .pin").off("keydown");
            }
        },
        "biz_balance_add": {
            header: "Пополнение кассы",
            location: "center",
            content: `Зарплата персоналу платится из кассы.<br/>


                        <br/><br />

                        <span>Введите сумму:</span>
                        <input type="text" placeholder="Сумма" class="sum"/>
                        <br/><br/>
                        <center><button>Пополнить</button></center>`,
            on: () => {
                modals["biz_balance_add"].off();
                setOnlyInt(".modal .sum");
                var handler = () => {
                    var sum = parseInt($(".modal .sum").val().trim());
                    if (isNaN(sum) || sum <= 0) return lightTextFieldError(".modal .sum", `Неверная сумма!`);
                    if (!isFlood()) {
                        mp.eventCallRemote("biz.balance.add", sum);
                        modalAPI.hide();
                    }
                };
                $(".modal .sum").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                clearOnlyInt(".modal .sum");
                $(".modal .sum").off("keydown");
                $(".modal button").off("click");
            },
        },
        "biz_balance_take": {
            header: "Снятие с кассы",
            location: "center",
            content: `Зарплата персоналу платится из кассы.<br/>


                        <br/><br />

                        <span>Введите сумму:</span>
                        <input type="text" placeholder="Сумма" class="sum"/>
                        <br/><br/>
                        <center><button>Снять</button></center>`,
            on: () => {
                modals["biz_balance_take"].off();
                setOnlyInt(".modal .sum");
                var handler = () => {
                    var sum = parseInt($(".modal .sum").val().trim());
                    if (isNaN(sum) || sum <= 0) return lightTextFieldError(".modal .sum", `Неверная сумма!`);
                    if (!isFlood()) {
                        mp.eventCallRemote("biz.balance.take", sum);
                        modalAPI.hide();
                    }
                };
                $(".modal .sum").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                clearOnlyInt(".modal .sum");
                $(".modal .sum").off("keydown");
                $(".modal button").off("click");
            },
        },
        "biz_products_buy": {
            header: "Закупка товара",
            location: "center",
            content: `Вы собираетесь заказать товар для бизнеса.<br/>
                        У Вас в наличии: <span class="yellow money">0$</span><br/>
                        Цена за 1 ед.: <span class="yellow productPrice">0$</span><br/>
                        Всего: <span class="yellow sum">0$</span><br/>
                        Склад: <span class="yellow store">0/0 ед.</span>


                        <br/><br />

                        <span>Введите количество для закупки:</span>
                        <input type="text" placeholder="Товар" class="products"/>
                        <br/><br/>
                        <center><button>Закупить</button></center>`,
            on: (values) => {
                modals["biz_products_buy"].off();
                setOnlyInt(".modal .products");

                var money = parseInt(clientStorage.money);
                var bizProductPrice = parseInt(values.productPrice);
                var bizProducts = parseInt(values.products);
                var bizMaxProducts = parseInt(values.maxProducts);

                $(".modal .money").text(`${money}$`);
                $(".modal .productPrice").text(`${bizProductPrice}$`);
                $(".modal .store").text(`${bizProducts} из ${bizMaxProducts} ед.`);

                var handler = () => {
                    var products = parseInt($(".modal .products").val().trim());
                    var sum = parseInt($(".modal .sum").text());


                    if (isNaN(products) || products <= 0) return lightTextFieldError(".modal .products", `Неверный товар!`);

                    if (bizProducts + products > bizMaxProducts)
                        return lightTextFieldError(".modal .products", `Склад не может вместить более ${bizMaxProducts} ед.!`);
                    if (money < sum) return lightTextFieldError(".modal .products", `У Вас недостаточно средств!`);
                    if (!isFlood()) {
                        mp.eventCallRemote("biz.products.buy", products);
                        modalAPI.hide();
                    }
                };
                $(".modal .products").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                    else {
                        setTimeout(() => {
                            var products = parseInt($(".modal .products").val().trim()) || 0;

                            $(".modal .sum").text(`${products * bizProductPrice}$`);;
                        }, 50);
                    }
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                clearOnlyInt(".modal .products");
                $(".modal .products").off("keydown");
                $(".modal button").off("click");
            },

        },
        "biz_products_sell": {
            header: "Списание товара",
            location: "center",
            content: `Вы собираетесь списать товар со склада.<br/>
                        У Вас в наличии: <span class="yellow money">0$</span><br/>
                        Цена за 1 ед.: <span class="yellow productPrice">0$</span>
                        <span class="red productPriceSell">- 0%</span><br/>
                        Всего: <span class="yellow sum">0$</span><br/>
                        Склад: <span class="yellow store">0/0 ед.</span>


                        <br/><br />

                        <span>Введите количество для списания:</span>
                        <input type="text" placeholder="Товар" class="products"/>
                        <br/><br/>
                        <center><button>Списать</button></center>`,
            on: (values) => {
                modals["biz_products_sell"].off();
                setOnlyInt(".modal .products");

                var money = parseInt(clientStorage.money);
                var bizProductPriceSell = parseFloat(values.productPriceSell).toFixed(2);
                var bizProductPrice = parseInt(values.productPrice);
                var bizProducts = parseInt(values.products);
                var bizMaxProducts = parseInt(values.maxProducts);

                $(".modal .money").text(`${money}$`);
                $(".modal .productPrice").text(`${bizProductPrice}$`);
                $(".modal .productPriceSell").text(`- ${parseInt(100 - bizProductPriceSell * 100)}%`);
                $(".modal .store").text(`${bizProducts} из ${bizMaxProducts} ед.`);

                var handler = () => {
                    var products = parseInt($(".modal .products").val().trim());
                    var sum = parseInt($(".modal .sum").text());


                    if (isNaN(products) || products <= 0) return lightTextFieldError(".modal .products", `Неверный товар!`);

                    if (products > bizProducts)
                        return lightTextFieldError(".modal .products", `Склад содержит ${bizProducts} ед.!`);
                    if (!isFlood()) {
                        mp.eventCallRemote("biz.products.sell", products);
                        modalAPI.hide();
                    }
                };
                $(".modal .products").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                    else {
                        setTimeout(() => {
                            var products = parseInt($(".modal .products").val().trim()) || 0;
                            var sum = parseInt(products * bizProductPrice * bizProductPriceSell);

                            $(".modal .sum").text(`${sum}$`);;
                        }, 50);
                    }
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                clearOnlyInt(".modal .products");
                $(".modal .products").off("keydown");
                $(".modal button").off("click");
            },

        },
        "biz_products_price": {
            header: "Цена товара",
            location: "center",
            content: `Вы собираетесь изменить цену товара.<br/>
                        Цена за 1 ед.: <span class="yellow productPrice">0$</span>

                        <br/><br />

                        <span>Введите цену:</span>
                        <input type="text" placeholder="Цена" class="newProductPrice"/>
                        <br/><br/>
                        <center><button>Изменить</button></center>`,
            on: (values) => {
                modals["biz_products_price"].off();
                setOnlyInt(".modal .newProductPrice");

                var bizProductPrice = parseInt(values.productPrice);

                $(".modal .productPrice").text(`${bizProductPrice}$`);

                var handler = () => {
                    var productPrice = parseInt($(".modal .newProductPrice").val().trim());

                    if (isNaN(productPrice) || productPrice <= 0) return lightTextFieldError(".modal .newProductPrice", `Неверное значение!`);

                    if (!isFlood()) {
                        mp.eventCallRemote("biz.products.price", productPrice);
                        modalAPI.hide();
                    }
                };
                $(".modal .newProductPrice").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                clearOnlyInt(".modal .newProductPrice");
                $(".modal .newProductPrice").off("keydown");
                $(".modal button").off("click");
            },

        },
        "biz_sell_to_player": {
            header: "Продажа бизнеса",
            location: "center",
            content: `Вы собираетесь продать бизнес другому гражданину.<br/>
                        Тип: <span class="yellow type">-</span><br/>
                        Касса: <span class="yellow balance">0$</span><br/>
                        Персонал: <span class="yellow staff">0 чел.</span><br/>
                        Склад: <span class="yellow store">0 из 0 ед.</span>

                        <br/><br />

                        <span>Введите имя покупателя:</span>
                        <input type="text" placeholder="Имя Фамилия" class="buyerName"/>

                        <span>Введите сумма:</span>
                        <input type="text" placeholder="Цена" class="price"/>
                        <br/><br/>
                        <center><button>Продать</button></center>`,
            on: (values) => {
                modals["biz_sell_to_player"].off();
                setOnlyInt(".modal .price");

                $(".modal .type").text(`${values.type}`);
                $(".modal .balance").text(`${values.balance}$`);
                $(".modal .staff").text(`${values.staff} чел.`);
                $(".modal .store").text(`${values.products} из ${values.maxProducts} ед.`);

                var handler = () => {
                    var price = parseInt($(".modal .price").val().trim());
                    if (isNaN(price) || price <= 0) return lightTextFieldError(".modal .price", `Неверная цена!`);

                    var buyerName = $(".modal .buyerName").val().trim();
                    var reg = /^([A-Z][a-z]{1,19}) ([A-Z][a-z]{1,19})$/;
                    if (!reg.test(buyerName)) return lightTextFieldError(".modal .buyerName", "Имя неверно!");

                    if (!isFlood()) {
                        mp.eventCallRemote("biz.sell", [buyerName, price]);
                    }
                };
                $(".modal .price").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                clearOnlyInt(".modal .price");
                $(".modal .price").off("keydown");
                $(".modal button").off("click");
            }
        },
        "biz_sell_to_gov": {
            header: "Продажа бизнеса",
            location: "center",
            content: `Вы собираетесь продать бизнес государству.<br/>
                        Тип: <span class="yellow type">-</span><br/>
                        Касса: <span class="yellow balance">0$</span><br/>
                        Персонал: <span class="yellow staff">0 чел.</span><br/>
                        Склад: <span class="yellow store">0 из 0 ед.</span><br/>

                        <br/>
                        Цена: <span class="yellow price">0$</span>
                        <span class="red ratio">- 0%</span>
                        <br/>

                        <center><button>Продать</button></center>`,
            on: (values) => {
                modals["biz_sell_to_gov"].off();

                $(".modal .type").text(`${values.type}`);
                $(".modal .balance").text(`${values.balance}$`);
                $(".modal .staff").text(`${values.staff} чел.`);
                $(".modal .store").text(`${values.products} из ${values.maxProducts} ед.`);
                $(".modal .price").text(`${values.price}$`);
                $(".modal .ratio").text(`- ${parseInt(100 - values.ratio * 100)}%`);

                var handler = () => {
                    if (!isFlood()) {
                        mp.eventCallRemote("biz.sellToGov");
                        modalAPI.hide();
                    }
                };
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                $(".modal button").off("click");
            }
        },
        "biz_buy": {
            header: "Покупка бизнеса",
            location: "center",
            content: `Вы собираетесь купить бизнес.<br/>
                        Тип: <span class="yellow type">-</span><br/>
                        Персонал: <span class="yellow staff">0 чел.</span><br/>
                        Склад: <span class="yellow store">0 из 0 ед.</span><br/>

                        <br/>
                        Цена: <span class="yellow price">0$</span>
                        <br/>

                        <center><button>Купить</button></center>`,
            on: (values) => {
                modals["biz_buy"].off();

                $(".modal .type").text(`${values.type}`);
                $(".modal .staff").text(`${values.staff} чел.`);
                $(".modal .store").text(`${values.products} из ${values.maxProducts} ед.`);
                $(".modal .price").text(`${values.price}$`);

                var handler = () => {
                    if (!isFlood()) {
                        mp.eventCallRemote("biz.buy");
                        modalAPI.hide();
                    }
                };
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                $(".modal button").off("click");
            }
        },
        "give_wanted": {
            header: "Розыск",
            location: "center",
            content: `Выдача розыска нарушителю.<br/>

                        Преступник: <span class="yellow playerName">Carter Slade</span><br/>
                        Розыск: <span class="yellow wantedVal">5 зв.</span><br/>
                        <br/><br />

                        <span>Введите уровень розыска:</span>
                        <input type="text" placeholder="Розыск" class="wanted"/>
                        <span>Введите причину:</span>
                        <input type="text" placeholder="Причина" class="reason"/>
                        <br/><br/>
                        <center><button>Выдать</button></center>`,
            on: (values) => {
                modals["give_wanted"].off();
                setOnlyInt(".modal .wanted");

                var playerId = parseInt(values.playerId);
                var playerName = values.playerName;
                var wantedVal = parseInt(values.wanted);

                $(".modal .playerName").text(`${playerName}`);
                $(".modal .wantedVal").text(`${wantedVal} зв.`);

                var handler = () => {
                    var wanted = parseInt($(".modal .wanted").val().trim());
                    var reason = $(".modal .reason").val().trim();
                    if (isNaN(wanted) || wanted <= 0) return lightTextFieldError(".modal .wanted", `Неверный уровень розыска!`);
                    if (!reason || reason.length == 0) return lightTextFieldError(".modal .reason", `Укажите причину!`);
                    if (reason.length > 30) reason = reason.substr(0, 30) + "...";
                    if (!isFlood()) {
                        mp.eventCallRemote("giveWanted", [playerId, wanted, reason]);
                        modalAPI.hide();
                    }
                };
                $(".modal .wanted").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal .reason").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                clearOnlyInt(".modal .wanted");
                $(".modal .wanted").off("keydown");
                $(".modal .reason").off("keydown");
                $(".modal button").off("click");
            },
        },
        "give_fine": {
            header: "Штраф",
            location: "center",
            content: `Выписка штрафа нарушителю.<br/>

                        Преступник: <span class="yellow playerName">Carter Slade</span><br/>
                        Розыск: <span class="yellow wantedVal">5 зв.</span><br/>
                        <br/><br />

                        <span>Введите сумму штрафа:</span>
                        <input type="text" placeholder="Сумма" class="sum"/>
                        <span>Введите причину:</span>
                        <input type="text" placeholder="Причина" class="reason"/>
                        <br/><br/>
                        <center><button>Выписать</button></center>`,
            on: (values) => {
                modals["give_fine"].off();
                setOnlyInt(".modal .sum");

                var playerId = parseInt(values.playerId);
                var playerName = values.playerName;
                var wantedVal = parseInt(values.wanted);

                $(".modal .playerName").text(`${playerName}`);
                $(".modal .wantedVal").text(`${wantedVal} зв.`);

                var handler = () => {
                    var sum = parseInt($(".modal .sum").val().trim());
                    var reason = $(".modal .reason").val().trim();
                    if (isNaN(sum) || sum <= 0 || sum > 5000) return lightTextFieldError(".modal .sum", `Неверная сумма!`);
                    if (!reason || reason.length == 0) return lightTextFieldError(".modal .reason", `Укажите причину!`);
                    if (reason.length > 30) reason = reason.substr(0, 30) + "...";
                    if (!isFlood()) {
                        mp.eventCallRemote("giveFine", [playerId, sum, reason]);
                        modalAPI.hide();
                    }
                };
                $(".modal .sum").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal .reason").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                clearOnlyInt(".modal .sum");
                $(".modal .sum").off("keydown");
                $(".modal .reason").off("keydown");
                $(".modal button").off("click");
            },
        },
        "clear_fine": {
            header: "Оплата штрафа",
            location: "center",
            content: `
                        Номер штрафа: <span class="yellow id">№1</span><br/>
                        Инспектор: <span class="yellow cop">Жетон 00002</span><br/>
                        Причина: <span class="yellow reason">Мешает спать соседям.</span><br/>
                        Сумма: <span class="red price">$10000.</span><br/>
                        Дата: <span class="yellow date">21:17 06.03.2019</span><br/>
                        <br/><br />

                        <center><button>Оплатить</button></center>`,
            on: (values) => {
                modals["clear_fine"].off();

                var playerId = parseInt(values.playerId);
                var playerName = values.playerName;
                var wantedVal = parseInt(values.wanted);


                $(".modal .id").text(`№${values.id}`);
                $(".modal .cop").text(`Жетон ${getPaddingNumber(values.cop)}`);
                $(".modal .reason").text(values.reason);
                $(".modal .price").text(`$${values.price}`);
                $(".modal .date").text(convertMillsToDate(values.date * 1000));

                var handler = () => {
                    var money = clientStorage.money;
                    if (money < values.price) return nError(`Необходимо: $${values.price}`);
                    if (!isFlood()) {
                        mp.eventCallRemote("policeService.clearFine");
                        modalAPI.hide();
                    }
                };
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                $(".modal button").off("click");
            },
        },
        "invite_player_inhouse": {
            header: "Приглашение",
            location: "center",
            content: `Пригласить игрока в дом<br/><br />
                        <span>Введите ID / Имя игрока:</span>
                        <input type="text" placeholder="ID / Имя" class="player"/>
                        <br/><br/>
                        <center><button>Пригласить</button></center>`,
            on: (values) => {
                modals["invite_player_inhouse"].off();
                houseMenu.__vue__.exitMenu();

                var handler = () => {
                    var player = $(".modal .player").val().trim();
                    if (!player || !player.length) return lightTextFieldError(".modal .player", `Такого игрока не существует!`);
                    if (!isFlood()) {
                        mp.eventCallRemote("invitePlayerInHouse", [player]);
                        modalAPI.hide();
                    }
                };
                $(".modal .player").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {

                mp.eventCallRemote("houseMenuHandler");
                clearOnlyInt(".modal .wanted");
                $(".modal .player").off("keydown");
                $(".modal button").off("click");
            },
        },
        "sell_player_house": {
            header: "Продажа дома",
            location: "center",
            content: `Введите кому Вы хотите продать дом?<br/><br />
                        <span>Введите ID / Имя игрока:</span>
                        <input type="text" placeholder="ID / Имя" class="player"/>
                        <br/>
                        <span>Введите цену за которую вы хотите продать:</span>
                        <input type="text" placeholder="Цена" class="price"/>
                        <br/><br/>
                        <center><button>Продать</button></center>`,
            on: (values) => {
                modals["sell_player_house"].off();
                setOnlyInt(".modal .price");
                houseMenu.__vue__.exitMenu();

                var handler = () => {
                    var player = $(".modal .player").val().trim();
                    if (!player.length) return lightTextFieldError(".modal .player", `Игрок не найден!`);

                    var price = $(".modal .price").val().trim();
                    if (!price) return lightTextFieldError(".modal .price", `Установите корректную цену!`);

                    if (!isFlood()) {
                        mp.eventCallRemote("sellHousePlayer", [player, price]);
                        modalAPI.hide();
                    }
                };
                $(".modal .player").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal .price").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                clearOnlyInt(".modal .price");
                $(".modal .player").off("keydown");
                $(".modal .price").off("keydown");
                $(".modal button").off("click");
            },
        },
        "sell_player_car": {
            header: "Продажа авто",
            location: "center",
            content: `Введите кому Вы хотите продать авто?<br/><br />
                        <span>Введите ID / Имя игрока:</span>
                        <input type="text" placeholder="ID / Имя" class="player"/>
                        <br/>
                        <span>Введите цену за которую вы хотите продать:</span>
                        <input type="text" placeholder="Цена" class="price"/>
                        <br/><br/>
                        <center><button>Продать</button></center>`,
            on: (values) => {
                modals["sell_player_car"].off();
                setOnlyInt(".modal .price");

                var handler = () => {
                    var player = $(".modal .player").val().trim();
                    if (!player.length) return lightTextFieldError(".modal .player", `Игрок не найден!`);

                    var price = $(".modal .price").val().trim();
                    if (!price) return lightTextFieldError(".modal .price", `Установите корректную цену!`);

                    if (!isFlood()) {
                        mp.eventCallRemote("sellCarPlayer", [player, price, values.sqlId]);
                        modalAPI.hide();
                    }
                };
                $(".modal .player").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal .price").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                clearOnlyInt(".modal .price");
                $(".modal .player").off("keydown");
                $(".modal .price").off("keydown");
                $(".modal button").off("click");
            },
        },
        "help_menu": {
            header: "Помощь",
            location: "right-middle",
            content: `<span class="omega text"></span>`,
            on: (values) => {
                $(".modal .header").text(`${values.head}`);
                $(".modal .text").text(`${values.text}`);
            },
            off: () => {
                $(".modal button").off("click");
                mp.trigger('update.help.main.open', false);
            }
        },
        "bank_money_put": {
            header: "Пополнение баланса", // Вывод средств
            location: "center",
            content: `Баланс <a style="color: green;" class="balance_bank"></a><br/><br/>
                        <span>Введите сумму:</span>
                        <input type="text" class="mbank_put"/>
                        <br/><br/>
                        <center><button>Пополнить</button></center>`,
            on: (values) => {
                setOnlyInt(".modal .mbank_put");
                var handler = () => {
                    var money = $(".modal .mbank_put").val().trim();
                    mp.trigger("put.bank.money", money);
                };
                $(".modal .balance_bank").text(`$${values.money}`);
                $(".modal .mbank_put").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                $(".modal button").off("click");
                mp.trigger('update.bank.main.open', false);
            },
        },
        "item_split": {
            header: "Разделение",
            location: "center",
            content: `Вы собираетесь разделить предмет.<br/>
                        Предмет: <span class="yellow name">Деньги</span><br/>
                        Количество: <span class="yellow count">1000$</span>
                        <span class="red newCount">- 100$</span><br/>
                        Остаток: <span class="yellow diff">900$</span><br/>


                        <br/><br />

                        <span>Введите количество для разделения:</span>
                        <input type="text" placeholder="Количество" class="countVal"/>
                        <br/><br/>
                        <center><button>Разделить</button></center>`,
            on: (values) => {
                modals["item_split"].off();
                setOnlyInt(".modal .countVal");

                var item = inventoryAPI.getItem(values.itemSqlId);
                if (!item) {
                    modalAPI.hide();
                    return nError(`Предмет для разделения не найден!`);
                }
                $(`.modal .name`).text(clientStorage.inventoryItems[item.itemId - 1].name);
                var itemIds = [4, 37, 38, 39, 40, 55, 56, 57, 58];
                var index = itemIds.indexOf(item.itemId);
                if (index == -1) {
                    modalAPI.hide();
                    return nError(`Неверный тип предмета для разделения!`);
                }
                var units = ["$", "ед.", "ед.", "шт.", "шт.", "шт.", "шт.", "г.", "г.", "г.", "г."];
                var u = units[index];

                if (item.params.ammo) {
                    var count = item.params.ammo;
                    var newCount = parseInt(item.params.ammo / 2);
                } else {
                    var count = item.params.count;
                    var newCount = parseInt(item.params.count / 2);
                }

                $(".modal .count").text(`${count} ${u}`);
                $(".modal .newCount").text(`- ${newCount} ${u}`);
                $(".modal .countVal").val(newCount);
                $(".modal .diff").text(count - newCount + ` ${u}`);

                var handler = () => {
                    var countVal = parseInt($(".modal .countVal").val().trim());

                    if (isNaN(countVal) || countVal <= 0) return lightTextFieldError(".modal .countVal", `Неверное количество!`);

                    if (countVal >= count)
                        return lightTextFieldError(".modal .countVal", `Не более ${count} !`);
                    if (!isFlood()) {
                        mp.eventCallRemote("item.split", [values.itemSqlId, countVal]);
                        modalAPI.hide();
                    }
                };
                $(".modal .countVal").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                    else {
                        setTimeout(() => {
                            var countVal = Math.clamp(parseInt($(".modal .countVal").val().trim()), 1, count - 1) || 1;
                            $(".modal .countVal").val(countVal);

                            $(".modal .newCount").text(`- ${countVal} ${u}`);
                            $(".modal .diff").text(`${count - countVal} ${u}`);
                        }, 50);
                    }
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                clearOnlyInt(".modal .countVal");
                $(".modal .countVal").off("keydown");
                $(".modal button").off("click");
                mp.trigger('update.bank.main.open', false);
            },
        },
        "bank_money_take": {
            header: "Вывод из баланса", // Вывод средств
            location: "center",
            content: `Баланс <a style="color: green;" class="balance_bank"></a><br/><br/>
                        <span>Введите сумму:</span>
                        <input type="text" class="mbank_take"/>
                        <br/><br/>
                        <center><button>Вывести</button></center>`,
            on: (values) => {
                setOnlyInt(".modal .mbank_take");
                var handler = () => {
                    var money = $(".modal .mbank_take").val().trim();
                    mp.trigger("take.bank.money", money);
                };
                $(".modal .balance_bank").text(`$${values.money}`);
                $(".modal .mbank_take").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                $(".modal button").off("click");
                mp.trigger('update.bank.main.open', false);
            },
        },
        "bank_money_transfer": {
            header: "Перевод средств", // Вывод средств
            location: "center",
            content: `Баланс <a style="color: green;" class="balance_bank"></a><br/><br/>
                      <span>Введите Имя игрока:</span>
                      <input type="text" placeholder="Имя Фамилия" class="mbank_transfer_name"/>
                      <br/>
                      <span>Введите сумму для перевода:</span>
                      <input type="text" placeholder="Сумма" class="mbank_transfer"/>
                      <br/><br/>
                      <center><button>Перевести</button></center>`,
            on: (values) => {
                setOnlyInt(".modal .mbank_transfer");
                var handler = () => {
                    var money = $(".modal .mbank_transfer").val().trim();
                    var name = $(".modal .mbank_transfer_name").val().trim();
                    mp.trigger("transfer.bank.money", name, money);
                };
                $(".modal .balance_bank").text(`$${values.money}`);
                $(".modal .mbank_transfer").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal .mbank_transfer_name").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                $(".modal button").off("click");
                mp.trigger('update.bank.main.open', false);
            },
        },
        "bank_money_house_give": {
            header: "Пополнение счёта дома", // Пополнение средств
            location: "center",
            content: `Дом <a class="number_bhouse"></a><br/>
                      Баланс счёта: <a style="color: green;" class="balance_bank"></a><br/>
                      Баланс счёта дома: <a style="color: green;" class="balance_bank_house"></a><br/><br/>
                      <span>Введите сумму для пополнения:</span>
                      <input type="text" placeholder="Сумма" class="mbank_hbank_add"/>
                      <br/><br/>
                      <center><button>Пополнить</button></center>`,
            on: (values) => {
              setOnlyInt(".modal .mbank_hbank_add");
              var handler = () => {
                  var money = $(".modal .mbank_hbank_add").val().trim();
                  mp.trigger("give.bank.money.house", money, values.house);
              };
              $(".modal .balance_bank").text(`$${values.money}`);
              $(".modal .number_bhouse").text(`${values.house}`);
              $(".modal .balance_bank_house").text(`${values.bhouse}`);
              // Оплата за час:<a style="color: green;" class="price_hour"> $40, $50, $60</a><br/><br/>
              // $(".modal .price_hour").text(`${values.hour}`);
              $(".modal .mbank_hbank_add").on("keydown", (e) => {
                  if (e.keyCode == 13) handler();
              });
              $(".modal button").on("click", () => {
                  handler();
              });
            },
            off: () => {
                $(".modal button").off("click");
                mp.trigger('update.bank.main.open', false);
            },
        },
        "throw_from_vehicle": {
            header: "Выкинуть из транспорта",
            location: "center",
            content: `Количество пассажиров: <a style="color: yellow;" class="people_count"></a><br/><br/>
                        <span>Введите ID игрока:</span>
                        <input type="text" class="idthrow_input"/>
                        <br/><br/>
                        <center><button>Выкинуть</button></center>`,
            on: (values) => {
                setOnlyInt(".modal .idthrow_input");
                var handler = () => {
                    var id = $(".modal .idthrow_input").val().trim();
                    mp.trigger("throw.fromvehicle.withkey", id);
                };
                $(".modal .people_count").text(`${values.count}`);
                $(".modal .idthrow_input").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                $(".modal button").off("click");
                mp.trigger('update.bank.main.open', false);
            },
        },
        "bank_money_house_take": {
            header: "Вывод из счёта дома", // Вывод средств
            location: "center",
            content: `Дом <a class="number_bhouse"></a><br/>
                      Баланс счёта: <a style="color: green;" class="balance_bank"></a><br/>
                      Баланс счёта дома: <a style="color: green;" class="balance_bank_house"></a><br/><br/>
                      <span>Введите сумму:</span>
                      <input type="text" class="mbank_take_house"/>
                      <br/><br/>
                      <center><button>Вывести</button></center>`,
            on: (values) => {
                setOnlyInt(".modal .mbank_take_house");
                var handler = () => {
                    var money = $(".modal .mbank_take_house").val().trim();
                    mp.trigger("take.bank.money.house", money, values.house);
                };
                $(".modal .balance_bank").text(`$${values.money}`);
                $(".modal .number_bhouse").text(`${values.house}`);
                $(".modal .balance_bank_house").text(`${values.bhouse}`);
                $(".modal .mbank_take_house").on("keydown", (e) => {
                    if (e.keyCode == 13) handler();
                });
                $(".modal button").on("click", () => {
                    handler();
                });
            },
            off: () => {
                $(".modal button").off("click");
                mp.trigger('update.bank.main.open', false);
            },
        },
    };
    window.modalAPI = {
        show: (name, values = null) => {
            var modal = modals[name];
            if (!modal) return;

            modal.name = name;
            window.currentModal = modal;
            $(".modal .header").text(modal.header);
            $(".modal .text").html(modal.content);
            modal.on(JSON.parse(values));

            switch (modal.location) {
                case 'left-top':
                    $('.modal').css('left', '1vh');
                    $('.modal').css('top', '1vh');
                    $('.modal').css('right', '');
                    $('.modal').css('bottom', '');
                    break;
                case 'left-middle':
                    $('.modal').css('left', '10vh');
                    $('.modal').css('top', '25vh');
                    $('.modal').css('right', '');
                    $('.modal').css('bottom', '');
                    break;
                case 'right-middle':
                    $('.modal').css('left', '');
                    $('.modal').css('top', '25vh');
                    $('.modal').css('right', '10vh');
                    $('.modal').css('bottom', '');
                    break;
                case 'top':
                    $('.modal').css('left', Math.max(0, (($(window).width() - $('.modal').outerWidth()) / 2) + $(window).scrollTop()) + 'px');
                    $('.modal').css('top', '10vh');
                    $('.modal').css('right', '');
                    $('.modal').css('bottom', '');
                    break;
                case 'center':
                    $('.modal').css('left', Math.max(0, (($(window).width() - $('.modal').outerWidth()) / 2) + $(window).scrollTop()) + 'px');
                    $('.modal').css('top', ($(window).height() / 2 - $(".modal").height() / 2) + "px");
                    $('.modal').css('right', '');
                    $('.modal').css('bottom', '');
                    break;
            }
            if (modal.noClose) $(".modal .close").hide();
            else $(".modal .close").show();

            $(".modal").slideDown("fast");

            var height = Math.abs(parseFloat($(".modal .header").height()) + parseFloat($(".modal .text").height()));
            var marginHeader = parseFloat($(".modal .header").css("margin-top")) * 2.5;
            $(".modal .body").height(height + marginHeader);

            $(".modal input[type='text']").eq(0).focus();
            setCursor(true);
            mp.trigger('setBlockControl', true);
        },
        hide: () => {
            setCursor(false);
            mp.trigger('setBlockControl', false);
            window.currentModal.off();
            window.currentModal = null;
            $(".modal").slideUp("fast");
        },
        active: () => {
            return $(".modal").css("display") != "none";
        },
    };
    // window.modalAPI.show("help_menu", '{ "head": "Работы", "text": "Тут много информации, лучше беги, а то оно тебя сожрет. C. Есенин"}');
});
