//CONFIG
var BOT_TOKEN = "6247591191:AAGONOvAjYJG5vbMYZOevSmlXyWWjRqnLns" //BOT TOKEN ANDA
var SS_URL = "https://docs.google.com/spreadsheets/d/1aeAnildGc6aRAoWJ1e_vrv0v2ymBUH6cj5pCkDtSKo4/edit?hl=id#gid=0" //URL SPREADSHEET
var SHEET_NAME = "laporan" //NAMA SHEET
var USERS = [
	1124120566 

] //CHAT ID, bisa lebih dari 1


//BEGIN
var SHEET = SpreadsheetApp.openByUrl(SS_URL).getSheetByName(SHEET_NAME);
var priceList = [
  { item: "Item 1", price: "Rp. 1.000-10.000" },
  { item: "Item 2", price: "Rp. 10.000-20.000" },
  { item: "Item 3", price: "Rp. 20.000-30.000" },
  { item: "Item 4", price: "Rp. 30.000-50.000" },
  { item: "Item 5", price: "Rp. 50.000-1.000.000" }
];

// You can access the prices using the index or iterate over the list
for (var i = 0; i < priceList.length; i++) {
  var item = priceList[i].item;
  var price = priceList[i].price;
  console.log(item + ": " + price);
}


function doGet(e) {
	return HtmlService.createHtmlOutput('<h1>OK</h1>')
}

function doPost(e) {
	if (e.postData.type == "application/json") {
		let update = JSON.parse(e.postData.contents);
		if (update) {
			commands(update)
			return true
		}
	}
}

function commands(update) {

	let chatId = update.message.chat.id;
	let first_name = update.message.chat.first_name;
	let text = update.message.text || '';
	let tanggal = new Date().toLocaleString();

	if (USERS.includes(chatId)) {

		if (text.startsWith("/start")) {
			sendMessage({
				chat_id: chatId,
				text: "Mulai laporan dengan cara \n/new [harga] [#kategori] [item1, item2 dst]"
			})
		} else if (text.startsWith("/new")) {
			let item,
				harga,
				kategori,
				stext = text.split(' ')

			harga = eval(stext[1]);
			kategori = stext[2].startsWith('#') ? stext[2].replace('#', '') : '';
			stext.splice(0, 3);
			item = stext.join(' ')


			if (harga && kategori && item) {
				insert_value([
					tanggal,
					kategori,
					item,
					harga,
					chatId,
					first_name
				], SHEET)

				sendMessage({
					chat_id: chatId,
					text: 'Laporan sukses.'
				})

			} else {
				sendMessage({
					chat_id: chatId,
					text: 'Gagal. Pastikan sesuai format. \n/new [harga] [#kategori] [item1, item2 dst]'
				})
			}
		}
	}
}

function sendMessage(postdata) {
	var options = {
		'method': 'post',
		'contentType': 'application/json',
		'payload': JSON.stringify(postdata),
		'muteHttpExceptions': true
	};
	UrlFetchApp.fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', options);
}