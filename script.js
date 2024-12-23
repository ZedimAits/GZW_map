var data = [];
var markers = [];
var map = L.map("map", { crs: L.CRS.Simple, minZoom: -5 });
var bounds = [
    [0, 0],
    [5029, 9027],
];

var image = L.imageOverlay("GZW_Map.jpg", bounds, { interactive: true }).addTo(
    map
);

map.fitBounds(bounds);

parseData();

var edit_obj = { bool: false };
var del_obj = { bool: false };
var col_obj = { bool: false };
var bool_arr = [edit_obj, del_obj, col_obj];
var btn_arr = [];

image.on("click", onMapClick);

createClick("✏️", "edit", edit_obj, "Edit Mode");
createClick("❌", "del", del_obj, "Delete Mode");
createClick("🎨", "col", col_obj, "Color Mode");

var download = document.createElement("div");
download.innerHTML = "💻";
download.className = "click";
download.title = "Download Markers"
download.id = "download"
download.onclick = downloadClick;

var upload = document.createElement("div");
upload.innerHTML = "📤";
upload.className = "click";
upload.title = "Upload Markers"
upload.onclick = uploadClick;

document.getElementsByClassName("leaflet-top leaflet-left")[0]
    .appendChild(download);

document.getElementsByClassName("leaflet-top leaflet-left")[0]
    .appendChild(upload);

    
function update() {
    localStorage.setItem("data", JSON.stringify(data));
    markers.forEach((e) => {
        e.remove();
    });
    data.forEach((e) => {
        var marker = L.marker(e.pos).addTo(map);
        markers.push(marker);
        marker.bindPopup(e.text);
        marker._icon.style.filter = "hue-rotate(" + e.col + "deg)";

        marker.on("click", (f) => {
            if (col_obj.bool) {
                var input = prompt("0-360deg: ");
                e.col = input;
                update();
            }
            else if (del_obj.bool) {
                data = data.filter((g) => g != e);
                update();
            }
        });
    });
}

function parseData() {
    var stor = localStorage.getItem("data");
    if (stor != null) {
        data = JSON.parse(localStorage.getItem("data"));
    }
    update();
}

function downloadClick(){
    var file = new Blob([JSON.stringify(data)], { type: "text/plain" });
    var a = document.createElement("a");
    var url = URL.createObjectURL(file);
    a.href = url;
    a.download = "markers.txt";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function uploadClick() {
    console.log("moin")
    // Create a file input element
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";

    // Listen for file selection
    input.onchange = function (event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();

            reader.onload = function (e) {
                try {
                    var parsedData = JSON.parse(e.target.result);

                    if (Array.isArray(parsedData)) {
                        data = parsedData;
                        update();
                    } else {
                        alert("Invalid file format. Please upload a valid markers file.");
                    }
                } catch (err) {
                    alert("Error parsing file. Ensure it contains valid JSON.");
                }
            };

            reader.readAsText(file);
        }
    };

    input.click();
}

function deleteEditMode(btn){
    btn.className = btn.className.replace(" editMode", "");
}

function onMapClick(e) {
    if (edit_obj.bool) {
        var text = prompt("Enter Text (<br> line break; <b>...</b> Bold):");
        var obj = { text: text, pos: e.latlng, col: "" };
        data.push(obj);
        update();
    }
}

function createClick(name, id, bool, title) {
    var container = document.getElementsByClassName(
        "leaflet-top leaflet-left"
    )[0];
    var btn = document.createElement("div");
    btn.innerHTML = name;
    btn.id = id;
    btn.title = title;
    btn.className = "click";

    btn_arr.push(btn);

    btn.onclick = () => {
        var edit = bool.bool;
        bool_arr.forEach(e => e.bool = false);
        btn_arr.forEach(e => deleteEditMode(e));

        if (!edit) {
            setTimeout(() => {
                bool.bool = true;
            }, 100);
            btn.className += " editMode";
        } else {
            bool.bool = false;
            deleteEditMode(btn);
        }
    };
    container.appendChild(btn);
}
