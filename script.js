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
function onMapClick(e) {
    if (edit_obj.bool) {
        var text = prompt("Enter Text (<br> line break; <b>...</b> Bold):");
        var obj = { text: text, pos: e.latlng, col: "" };
        data.push(obj);
        update();
    }
}

image.on("click", onMapClick);

function createClick(name, id, bool) {
    var container = document.getElementsByClassName(
        "leaflet-top leaflet-left"
    )[0];
    var btn = document.createElement("div");
    btn.innerHTML = name;
    btn.id = id;
    btn.className = "click";
    btn.onclick = () => {
        if (!bool.bool) {
            setTimeout(() => {
                bool.bool = true;
            }, 100);
            btn.className += " editMode";
        } else {
            bool.bool = false;
            btn.className = btn.className.replace(" editMode", "");
        }
    };
    container.appendChild(btn);
}

createClick("✏️", "edit", edit_obj);
createClick("❌", "del", del_obj);
createClick("🎨", "col", col_obj);

var download = document.createElement("div");
download.innerHTML = "💻";
download.className = "click";
download.onclick = () => {
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
};
document
    .getElementsByClassName("leaflet-top leaflet-left")[0]
    .appendChild(download);

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
                f.target._icon.style.filter = "hue-rotate(" + input + "deg)";
            }
            if (del_obj.bool) {
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
