// CONFIG
var BOT_TOKEN = "6247591191:AAGONOvAjYJG5vbMYZOevSmlXyWWjRqnLns"; //BOT TOKEN ANDA
var SS_URL = "https://docs.google.com/spreadsheets/d/1aeAnildGc6aRAoWJ1e_vrv0v2ymBUH6cj5pCkDtSKo4/edit?hl=id#gid=0"; //URL SPREADSHEET
var SHEET_NAME = "laporan"; //NAMA SHEET
var USERS = [
  1124120566
]; //CHAT ID, bisa lebih dari 1

// BEGIN
var SHEET = SpreadsheetApp.openByUrl(SS_URL).getSheetByName(SHEET_NAME);
var priceList = [
  { item: "Item 1", price: "Rp. 1.000-10.000" },
  { item: "Item 2", price: "Rp. 10.000-20.000" },
  { item: "Item 3", price: "Rp. 20.000-30.000" },
  { item: "Item 4", price: "Rp. 30.000-50.000" },
  { item: "Item 5", price: "Rp. 50.000-1.000.000" }
];

function formatPrice(price) {
  var formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  });
  return formatter.format(price);
}

// Format the prices with rupiah symbol
for (var i = 0; i < priceList.length; i++) {
  var item = priceList[i].item;
  var price = formatPrice(priceList[i].price);
  console.log(item + ": " + price);
}

function doGet(e) {
  return HtmlService.createHtmlOutput("<h1>OK</h1>");
}

function doPost(e) {
  if (e.postData.type == "application/json") {
    let update = JSON.parse(e.postData.contents);
    if (update) {
      commands(update);
      return true;
    }
  }
}

// ...

function commands(update) {
  let chatId = update.message.chat.id;
  let first_name = update.message.chat.first_name;
  let text = update.message.text || "";
  let tanggal = new Date().toLocaleString();

  if (USERS.includes(chatId)) {
    if (text.startsWith("/start")) {
      sendMessage({
        chat_id: chatId,
        text: "Halo, " + first_name + "! Selamat datang. Untuk memulai laporan, gunakan perintah:\n/new [harga] [#kategori] [item1, item2 dst]",
      });
    } else if (text.startsWith("/new")) {
      let item,
        harga,
        kategori,
        stext = text.split(" ");

      harga = eval(stext[1]);
      harga = formatPrice(harga); // Mengubah harga menjadi format rupiah
      kategori = stext[2].startsWith("#") ? stext[2].replace("#", "") : "";
      stext.splice(0, 3);
      item = stext.join(" ");

      if (harga && kategori && item) {
        insert_value(
          [
            tanggal,
            kategori,
            item,
            harga,
            chatId,
            first_name,
          ],
          SHEET
        );

        sendMessage({
          chat_id: chatId,
          text: "Laporan sukses.",
        });
      } else {
        sendMessage({
          chat_id: chatId,
          text: "Gagal. Pastikan sesuai format. \n/new [harga] [#kategori] [item1, item2 dst]",
        });
      }
    } else if (text.startsWith("/view")) {
      sendMessage({
        chat_id: chatId,
        text: "Berikut adalah link menuju spreadsheet:\n" + SS_URL,
      });
    } else if (text.startsWith("/menu")) {
      let commandsList = [
        "/new - Membuat laporan baru",
        "/view - melihat data yang sudah dibuat",
        "/hapusdata - menghapus data pada spreadsheet"
      ];

      let commandsText = "Pilih opsi:\n";
      for (let i = 0; i < commandsList.length; i++) {
        commandsText += commandsList[i] + "\n";
      }

      sendMessage({
        chat_id: chatId,
        text: commandsText,
      });
    } else if (text.startsWith("/hapusdata")) {
      // Call the function to clear the spreadsheet data
      clearData(SHEET);
      
      sendMessage({
        chat_id: chatId,
        text: "Data pada spreadsheet telah dihapus.",
      });
    }
  }
}

// Function to clear the spreadsheet data
function clearData(sheet) {
  sheet.clearContents();
}

function sendMessage(postdata) {
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(postdata),
    muteHttpExceptions: true,
  };
  UrlFetchApp.fetch("https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage", options);
}
