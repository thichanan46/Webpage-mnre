$(document).ready(function ($) {
  // เพิ่มแผนที่ 
  /* var map = L.map('map', {
      center: [16.45423958666, 102.66451734152011],
      zoom: 10,
      zoomControl: false 
    }); */

  //เลือกเบสแมพ
  new L.basemapsSwitcher([
    {
      layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map), //แผนที่ตั้งต้น
      icon: './img/street1.PNG',
      name: 'ค่าเริ่มต้น',
    },
    {
      layer: L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© OpenStreetMap contributors',
      }),
      icon: './img/sat1.png',
      name: 'ดาวเทียม'
    },
    /*     {
          layer: L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          }),
          icon: './img/stadia1.PNG',
          name: 'สเตเดีย'
        }, */
  ], { position: 'bottomleft' }).addTo(map);


  // เครื่องมือวัด
  var measureOptions = {
    position: 'bottomright',
    primaryLengthUnit: 'meters',
    secondaryLengthUnit: 'kilometers',
    primaryAreaUnit: 'sqmeters',
    secondaryAreaUnit: undefined,
    activeColor: '#0091ff',
    completedColor: '#0091ff'
  }
  measureControl = L.control.measure(measureOptions);
  measureControl.addTo(map);


  // กำหนด Element สำหรับแสดงผลตำแหน่ง
  const demoElement = document.getElementById("demo");
  let currentMarker = null; // ตัวแปรเก็บ Marker ปัจจุบัน

  // ฟังก์ชันสำหรับเรียกดูตำแหน่งปัจจุบัน
  function homeClick() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, errorCallback);
    } else {
      demoElement.innerHTML = "เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่งทางภูมิศาสตร์";
    }
  }

  // ฟังก์ชันสำหรับแสดงตำแหน่งที่ได้ใน Element
  function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // แสดงค่าละติจูดและลองจิจูดหลังกด
    demoElement.innerHTML = `ละติจูด: ${latitude} ลองจิจูด: ${longitude}`;

    // ลบหมุดเดิมก่อนเพิ่มหมุดใหม่
    if (currentMarker) {
      map.removeLayer(currentMarker);
    }

    // หน้า zoom ตำแหน่งปัจจุบัน
    map.setView([latitude, longitude], 18);

    // เพิ่ม Marker ที่ตำแหน่งของผู้ใช้
    currentMarker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup("นี่คือที่อยู่ของคุณ")
      .openPopup();
  }

  // ฟังก์ชันสำหรับจัดการกับข้อผิดพลาดในการดึงตำแหน่ง
  function errorCallback(error) {
    demoElement.innerHTML = "Error getting location: " + error.message;
  }

  // ผูกอีเวนต์คลิกให้กับปุ่ม "นี่คือที่อยู่ของคุณ"
  document.getElementById("home").addEventListener("click", homeClick);

  // คลื้กขวาขึ้นพิกัด
  map.on('contextmenu', function (e) {
    L.popup()
      .setLatLng(e.latlng)
      .setContent(`
        <div style="font-family: 'Noto Sans Thai'; font-size: 14px;">
           ละติจูด : ${e.latlng.lat.toFixed(6)} ลองจิจูด : ${e.latlng.lng.toFixed(6)}
        </div>`)
      .openOn(map);
  });


  /* ________________________________________________________________________________________________________________________________ */

  // เพิ่ม Label
  // ข้อมูลต่างๆ

  // ขอนแก่น
  var kkpv = new L.GeoJSON.AJAX("json/kk_province.geojson", {
    color: "#FFCC00",  // ตั้งสีของฟีเจอร์
    onEachFeature: function (feature, layer) {

      // สร้าง Label สำหรับแสดงชื่ออำเภอ
      layer.marker = L.marker(layer.getBounds().getCenter(), {
        icon: L.divIcon({
          className: 'label',
          html: `<span class='label-text'>${feature.properties.PROV_NAM_T}</span>`,
          iconSize: [100, 40]
        })
      });
    }
  });

  // ฟังก์ชันเปิด/ปิด Layer (รวมทั้ง Label) เมื่อกด checkbox
  function toggleKKPVLayer() {
    const checkbox = document.getElementById('kkpv_checkbox');
    if (checkbox.checked) {
      kkpv.addTo(map);  // เพิ่ม Layer
      // เพิ่ม marker (Label) สำหรับทุกฟีเจอร์
      kkpv.eachLayer(layer => {
        if (layer.marker) map.addLayer(layer.marker);
      });
    } else {
      map.removeLayer(kkpv);  // ลบ Layer
      // ลบ marker (Label) สำหรับทุกฟีเจอร์
      kkpv.eachLayer(layer => {
        if (layer.marker) map.removeLayer(layer.marker);
      });
    }
  };

  // อำเภอขอนแก่น
  var kk = new L.GeoJSON.AJAX("json/kk_area.geojson", {
    color: "#FF2929",  // ตั้งสีของฟีเจอร์
    onEachFeature: function (feature, layer) {

      // สร้าง Label สำหรับแสดงชื่ออำเภอ
      layer.marker = L.marker(layer.getBounds().getCenter(), {
        icon: L.divIcon({
          className: 'label',
          html: `<span class='label-text'>อ.${feature.properties.AMP_NAME_T}</span>`,
          iconSize: [100, 40]
        })
      });

      // คำนวณพื้นที่ (แปลงจากตารางเมตรเป็นตารางกิโลเมตร)
      var shapeArea = (feature.properties.Shape_Area / 1000000).toFixed(2);

      // สร้าง Popup แสดงข้อมูล
      var popupContent = `<b style='font-family: Noto Sans Thai; font-size: 16px;'>อำเภอ ${feature.properties.AMP_NAME_T} (${feature.properties.AMP_NAME_E})</b><br><span style='font-family: Noto Sans Thai; font-size: 14px;'><b>พื้นที่ :</b> ${shapeArea} ตารางกิโลเมตร</span>`;
      layer.bindPopup(popupContent);


      // เพิ่มการเปิด Popup เมื่อคลิกที่ Layer
      layer.on('click', function () {
        layer.openPopup();
      });

    }
  });

  // ฟังก์ชันเปิด/ปิด Layer (รวมทั้ง Label) เมื่อกด checkbox
  function toggleKKLayer() {
    const checkbox = document.getElementById('kk_checkbox');
    if (checkbox.checked) {
      kk.addTo(map);  // เพิ่ม Layer
      // เพิ่ม marker (Label) สำหรับทุกฟีเจอร์
      kk.eachLayer(layer => {
        if (layer.marker) map.addLayer(layer.marker);
      });
    } else {
      map.removeLayer(kk);  // ลบ Layer
      // ลบ marker (Label) สำหรับทุกฟีเจอร์
      kk.eachLayer(layer => {
        if (layer.marker) map.removeLayer(layer.marker);
      });
    }
  };

  // ประเทศไทย 
  var th = new L.GeoJSON.AJAX("json/thailand_area.geojson", {
    color: "#3D3BF3",  // ตั้งสีของฟีเจอร์
    onEachFeature: function (feature, layer) {

      // สร้าง Label สำหรับแต่ละฟีเจอร์ (ใช้ชื่อจังหวัด)
      layer.marker = L.marker(layer.getBounds().getCenter(), {
        icon: L.divIcon({
          className: 'label',
          html: `<span class='label-text'>จ.${feature.properties.ADM1_TH}</span>`,
          iconSize: [100, 40]
        })
      });
    }
  });

  // ฟังก์ชันเปิด/ปิด Layer (รวมทั้ง Label) เมื่อกด checkbox
  function toggleTHLayer() {
    const checkbox = document.getElementById('th_checkbox');
    if (checkbox.checked) {
      th.addTo(map);
      // เพิ่ม marker (Label) สำหรับทุกฟีเจอร์
      th.eachLayer(layer => {
        if (layer.marker) map.addLayer(layer.marker);
      });
    } else {
      map.removeLayer(th);
      // ลบ marker (Label) สำหรับทุกฟีเจอร์
      th.eachLayer(layer => {
        if (layer.marker) map.removeLayer(layer.marker);
      });
    }
  }

  // ป่าอนุรักษ์ 
  var panr = new L.GeoJSON.AJAX("json/paanurak_kk.geojson", {
    color: "#294B29",  // ตั้งสีของฟีเจอร์
    onEachFeature: function (feature, layer) {

      // สร้าง Label สำหรับแต่ละฟีเจอร์ (ใช้ชื่ออำเภอ)
      var label = L.divIcon({
        className: 'label',
        html: `<span class='label-text'>อุทยานแห่งชาติ${feature.properties.Name_TH}</span>`,
        iconSize: [100, 40]  // ขนาดของ Label
      });

      // แปลงจากตารางเมตรเป็นตารางกิโลเมตร
      var area = (feature.properties.Area / 1000000).toFixed(2);  // แปลงจากตารางเมตรเป็นตารางกิโลเมตร

      // สร้าง Popup แสดงข้อมูล
      var popupContent = `<b style='font-family: Noto Sans Thai; font-size: 16px;'>อุทยานแห่งชาติ${feature.properties.Name_TH} (${feature.properties.Name}) </b><br>
                          <span style='font-family: Noto Sans Thai; font-size: 14px;'><b>พื้นที่ :</b> ${area} ตารางกิโลเมตร</span>`;
      layer.bindPopup(popupContent);

      // คำนวณตำแหน่งกลางของฟีเจอร์และเพิ่ม marker จาก Labelที่สร้าง ลงแผนที่
      var center = layer.getBounds().getCenter();
      var marker = L.marker(center, { icon: label });
      layer.marker = marker;  // เก็บ marker ลงในฟีเจอร์ (เพื่อใช้ในภายหลัง)
    }
  });

  // ฟังก์ชันเปิด/ปิด Layer เมื่อกด checkbox
  function togglePaANuRakLayer() {
    const checkbox = document.getElementById('paanurak_checkbox');

    if (checkbox.checked) {
      panr.addTo(map);  // เพิ่ม Layer
      // เพิ่ม marker (Label) สำหรับทุกฟีเจอร์
      panr.eachLayer(function (layer) {
        if (layer.marker) {
          map.addLayer(layer.marker);
        }
      });
    } else {
      map.removeLayer(panr);  // ลบ Layer
      // ลบ marker (Label) สำหรับทุกฟีเจอร์
      panr.eachLayer(function (layer) {
        if (layer.marker) {
          map.removeLayer(layer.marker);
        }
      });
    }
  }

  // ป่าสงวน 
  var psgn = new L.GeoJSON.AJAX("json/pasaguan_kk.geojson", {
    color: "#89AC46",  // ตั้งสีของฟีเจอร์
    onEachFeature: function (feature, layer) {

      // สร้าง Label สำหรับแต่ละฟีเจอร์ (ใช้ชื่อฟีเจอร์)
      var label = L.divIcon({
        className: 'label',
        html: `<span class='label-text'>${feature.properties.FR_NAME}</span>`,
        iconSize: [100, 40]  // ขนาดของ Label
      });

      // คำนวณพื้นที่ (แปลงจากตารางเมตรเป็นตารางกิโลเมตร)
      var shapeArea = (feature.properties.SHAPE_AREA / 1000000).toFixed(2);

      // สร้าง Popup แสดงข้อมูล
      var popupContent = `<b style='font-family: Noto Sans Thai; font-size: 16px;'>ป่าสงวนแห่งชาติ${feature.properties.FR_NAME}</b><br><span style='font-family: Noto Sans Thai; font-size: 14px;'><b>พื้นที่ :</b> ${shapeArea} ตารางกิโลเมตร</span>`;
      layer.bindPopup(popupContent);

      // คำนวณตำแหน่งกลางของฟีเจอร์และเพิ่ม marker ลงแผนที่
      var center = layer.getBounds().getCenter();
      var marker = L.marker(center, { icon: label });
      layer.marker = marker;  // เก็บ marker ลงในฟีเจอร์ (เพื่อใช้ในภายหลัง)
    }
  });

  // ฟังก์ชันเปิด/ปิด Layer เมื่อกด checkbox
  function togglePaSanGuanLayer() {
    const checkbox = document.getElementById('pasanguan_checkbox');

    if (checkbox.checked) {
      psgn.addTo(map);  // เพิ่ม Layer
      // เพิ่ม marker (Label) สำหรับทุกฟีเจอร์
      psgn.eachLayer(function (layer) {
        if (layer.marker) {
          map.addLayer(layer.marker);
        }
      });
    } else {
      map.removeLayer(psgn);  // ลบ Layer
      // ลบ marker (Label) สำหรับทุกฟีเจอร์
      psgn.eachLayer(function (layer) {
        if (layer.marker) {
          map.removeLayer(layer.marker);
        }
      });
    }
  }

  // ป่าถาวร
  var ptwn = new L.GeoJSON.AJAX("json/patawonKK.geojson", {
    style: function () {
      return { color: "#89AC46" }; // กำหนดสีของฟีเจอร์
    },
    onEachFeature: function (feature, layer) {

      // สร้าง Label สำหรับแต่ละฟีเจอร์
      var label = L.divIcon({
        className: 'label',
        html: `<span class='label-text'>${feature.properties.FR_NAME}</span>`,
        iconSize: [100, 40]  // ขนาดของ Label
      });

      // คำนวณพื้นที่ (แปลงจากตารางเมตรเป็นตารางกิโลเมตร)
      var shapeArea = (feature.properties.SHAPE_Area / 1000000).toFixed(2);

      // สร้าง Popup แสดงข้อมูล
      var popupContent = `<b style='font-family: Noto Sans Thai; font-size: 16px;'>${feature.properties.FR_NAME}</b><br>
                        <span style='font-family: Noto Sans Thai; font-size: 14px;'><b>พื้นที่ :</b> ${shapeArea} ตารางกิโลเมตร</span>`;
      layer.bindPopup(popupContent);

      // คำนวณตำแหน่งกลางของฟีเจอร์และเพิ่ม marker ลงแผนที่
      var center = layer.getBounds().getCenter();
      var marker = L.marker(center, { icon: label });
      layer.marker = marker;  // เก็บ marker ลงในฟีเจอร์ (เพื่อใช้ในภายหลัง)
    }
  });

  // ฟังก์ชันเปิด/ปิด Layer เมื่อกด checkbox
  function togglePaTaWonLayer() {
    const checkbox = document.getElementById('patawon_checkbox');

    if (checkbox.checked) {
      ptwn.addTo(map);  // เพิ่ม Layer
      // เพิ่ม marker (Label) สำหรับทุกฟีเจอร์
      ptwn.eachLayer(function (layer) {
        if (layer.marker) {
          map.addLayer(layer.marker);
        }
      });
    } else {
      map.removeLayer(ptwn);  // ลบ Layer
      // ลบ marker (Label) สำหรับทุกฟีเจอร์
      ptwn.eachLayer(function (layer) {
        if (layer.marker) {
          map.removeLayer(layer.marker);
        }
      });
    }
  }

  // สวนป่า
  // รอเปลี่ยนไอคอน จุดช
  var sp = new L.GeoJSON.AJAX("json/suanpha_kk.geojson", {
    style: function (feature) {
      return { color: "#1E8449" }; // กำหนดสีของฟีเจอร์
    },
    onEachFeature: function (feature, layer) {

      // ตรวจสอบว่า layer มีขอบเขตหรือไม่
      var center;
      if (layer.getBounds && layer.getBounds().isValid()) {
        center = layer.getBounds().getCenter();
      } else if (layer.getLatLng) {
        center = layer.getLatLng();
      } else {
        console.warn("Cannot determine center for feature", feature);
        return;
      }

      var plantName = feature.properties.Plant_name || "(ไม่มีข้อมูล)";

      // สร้าง Label ให้แต่ละ Marker
      var label = L.divIcon({
        className: 'label-container',
        html: `<div class='label-text'>${plantName}</div>`,
        iconSize: [120, 30],  // ปรับขนาดให้ใหญ่ขึ้น
        iconAnchor: [60, -10]  // ย้ายตำแหน่งให้อยู่บน Marker
      });

      // สร้าง Marker และกำหนด Label
      var marker = L.marker(center, { icon: label })

      // เก็บ Marker ไว้ใน layer
      layer.marker = marker;
    }

  });


  // ฟังก์ชันเปิด/ปิด Layer เมื่อกด checkbox
  function toggleSuanPhaLayer() {
    const checkbox = document.getElementById('suanpha_checkbox');
    if (checkbox.checked) {
      sp.addTo(map);
      sp.eachLayer(function (layer) {
        if (layer.marker) {
          map.addLayer(layer.marker);
        }
      });
    } else {
      map.removeLayer(sp);
      sp.eachLayer(function (layer) {
        if (layer.marker) {
          map.removeLayer(layer.marker);
        }
      });
    }
  }

  // ป่าไม้ รายปี 66
  var fr66 = new L.GeoJSON.AJAX("json/forestarea2566.geojson", {
    style: function (feature) {
      return { color: "#1640D6" };
    },
    onEachFeature: function (feature, layer) {
      // คำนวณพื้นที่ (แปลงจากตารางเมตรเป็นตารางกิโลเมตร)
      var shapeArea = (feature.properties.SHAPE_AREA / 1000000).toFixed(2);

      // สร้าง Popup แสดงข้อมูล
      var popupContent = `<b style='font-family: Noto Sans Thai; font-size: 16px;'>(พื้นที่ป่าที่${feature.properties.OBJECTID})</b><br>
                            <span style='font-family: Noto Sans Thai; font-size: 14px;'><b>พื้นที่ :</b> ${shapeArea} ตารางกิโลเมตร</span>`;
      layer.bindPopup(popupContent);

    }
  });

  function toggleFoRest66Layer() {
    const checkbox = document.getElementById('f2566_checkbox');
    if (checkbox.checked) {
      fr66.addTo(map);
    } else {
      map.removeLayer(fr66);
    }
  };

  // ป่าไม้ รายปี 65
  var fr65 = new L.GeoJSON.AJAX("json/forestarea2565.geojson", {
    color: "#F94C10"
    ,
    onEachFeature: function (feature, layer) {
      // คำนวณพื้นที่ (แปลงจากตารางเมตรเป็นตารางกิโลเมตร)
      var shapeArea = (feature.properties.SHAPE_AREA / 1000000).toFixed(2);

      // สร้าง Popup แสดงข้อมูล
      var popupContent = `<b style='font-family: Noto Sans Thai; font-size: 16px;'>(พื้นที่ป่าที่${feature.properties.OBJECTID})</b><br>
                            <span style='font-family: Noto Sans Thai; font-size: 14px;'>พื้นที่ : ${shapeArea} ตารางกิโลเมตร</span>`;
      layer.bindPopup(popupContent);

    }

  });

  function toggleFoRest65Layer() {
    const checkbox = document.getElementById('f2565_checkbox');
    if (checkbox.checked) {
      fr65.addTo(map);
    } else {
      map.removeLayer(fr65);
    }
  };

  // Soil
  var soil = new L.GeoJSON.AJAX("json/soilkk.geojson", {
    style: function (feature) {
      var pH_top = feature.properties.pH_top || "(ไม่ระบุ)";

      // ตัวแปรกำหนดสีให้สัมพันธ์กับข้อมูลในAttribute
      var fillColor;
      if (pH_top === 'กรดจัดมากถึงกรดจัด') {
        fillColor = '#CA002A';  // สีแดงเข้ม
      } else if (pH_top === 'กรดจัดมากถึงกรดปานกลาง') {
        fillColor = '#FF1100';  // สีส้มแดง
      } else if (pH_top === 'กรดจัดมากถึงกรดเล็กน้อย') {
        fillColor = '#FF4200';  // สีส้มเข้ม
      } else if (pH_top === 'กรดจัดถึงกรดปานกลาง') {
        fillColor = '#FFD700';  // สีทอง
      } else if (pH_top === 'กรดจัดถึงกรดเล็กน้อย') {
        fillColor = '#ADFF2F';  // สีเขียวอ่อน
      } else if (pH_top === 'กรดปานกลางถึงกรดเล็กน้อย') {
        fillColor = '#32CD32';  // สีเขียว
      } else if (pH_top === 'กรดปานกลางถึงเป็นกลาง') {
        fillColor = '#1E90FF';  // สีน้ำเงิน
      } else if (pH_top === 'กรดเล็กน้อยถึงด่างปานกลาง') {
        fillColor = '#9370DB';  // สีม่วง
      } else {
        fillColor = '#808080';  // สีเทา (ไม่มีข้อมูล)
      }

      return {
        color: "#000000",  // สีขอบดำ
        fillColor: fillColor,  // สีเติม
        fillOpacity: 0.7  // ความโปร่งใส
      };
    },
    onEachFeature: function (feature, layer) {
      // กำหนดตัวแปล/ตรวจสอบค่าถ้าไม่มีให้ใช้ "ไม่มีข้อมูล"
      var amphoeT = feature.properties.AMPHOE_T || "(ไม่มีข้อมูล)";
      var amphoeE = feature.properties.AMPHOE_E || "(ไม่มีข้อมูล)";
      var soilgroup = feature.properties.Soilgroup || "(ไม่มีข้อมูล)";
      var ph = feature.properties.pH_top || "(ไม่มีข้อมูล)";
      var soilseries = feature.properties.soilserien || "(ไม่มีข้อมูล)";
      var fertility = feature.properties.fertility || "(ไม่มีข้อมูล)";
      var texture = feature.properties.texture_to || "(ไม่มีข้อมูล)";

      // สร้าง Popup แสดงข้อมูล
      var popupContent = `
    <div style="font-family: 'Noto Sans Thai'; font-size: 14px; max-width: 250px; line-height: 1.5; text-align: left;">
      <b style="font-size: 16px;">${amphoeT} (${amphoeE})</b><br>
      <span><b>ประเภทดิน:</b> ${soilgroup}</span><br>
      <span><b>ค่าความเป็นกรด-ด่าง (pH):</b> ${ph}</span><br>
      <span><b>ระดับความอุดมสมบูรณ์:</b> ${fertility}</span><br>
      <span><b>ชุดดิน:</b> ${soilseries} (${feature.properties.soil_serie})</span><br>
      <span><b>ลักษณะดิน:</b> ${texture}</span>
    </div>
  `;
      layer.bindPopup(popupContent);
    }
  });

  // ======= เพิ่ม Legend สำหรับดิน =======
  var soilLegend = L.control({ position: "bottomright" });

  soilLegend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend");

    // สร้างตัวแปร
    var grades = [
      { color: "#CA002A", text: "กรดจัดมาก - กรดจัด" },
      { color: "#FF1100", text: "กรดจัดมาก - กรดปานกลาง" },
      { color: "#FF4200", text: "กรดจัดมาก - กรดเล็กน้อย" },
      { color: "#FFD700", text: "กรดจัด - กรดปานกลาง" },
      { color: "#ADFF2F", text: "กรดจัด - กรดเล็กน้อย" },
      { color: "#32CD32", text: "กรดปานกลาง - กรดเล็กน้อย" },
      { color: "#1E90FF", text: "กรดปานกลาง - เป็นกลาง" },
      { color: "#9370DB", text: "กรดเล็กน้อย - ด่างปานกลาง" },
      { color: "#808080", text: "ไม่มีข้อมูล" }
    ];

    // สร้างกล่องสีหน้าข้อความ และข้อความอธิบาย
    for (var i = 0; i < grades.length; i++) {
      var item = document.createElement("div");
      item.classList.add("legend-item");

      var colorBox = document.createElement("i");
      colorBox.classList.add("color-box");
      colorBox.style.background = grades[i].color;

      var textNode = document.createTextNode(grades[i].text);
      item.appendChild(colorBox);
      item.appendChild(textNode);
      div.appendChild(item);
    }

    return div;
  };


  // ฟังก์ชันเปิด/ปิด Layer เมื่อกด checkbox สำหรับดิน
  function toggleSoilLayer() {
    const checkbox = document.getElementById('soil_checkbox');

    if (checkbox.checked) {
      soil.addTo(map);  // เพิ่ม Layer
      soilLegend.addTo(map); // เพิ่ม Legend
    } else {
      map.removeLayer(soil);  // ลบ Layer
      map.removeControl(soilLegend); // ลบ Legend
    }
  };

  // Rock
  var rock = new L.GeoJSON.AJAX("./json/rock_kk.geojson", {
    style: function (feature) {
      var DES_T = feature.properties.DESCRIPT_T || "(ไม่ระบุ)";

      // กำหนดสีตามค่า DES_T (ปรับให้เข้มขึ้น)
      var fillColor;
      if (DES_T === 'ตะกอนน้ำพา') {
        fillColor = '#5A3E1B';  // น้ำตาลเข้มมาก
      } else if (DES_T === 'หินกรวดมน, หินทรายแป้งสีน้ำตาลอมแดงมีไมกา') {
        fillColor = '#914E38';  // น้ำตาลแดงเข้ม
      } else if (DES_T === 'หินควอตซ์ไมกาซิสต์') {
        fillColor = '#A07658';  // น้ำตาลอ่อนเข้มขึ้น
      } else if (DES_T === 'หินดินดาน') {
        fillColor = '#C4A484';  // เบจเข้มขึ้น
      } else if (DES_T === 'หินดินดาน, หินกรวดมน') {
        fillColor = '#DAC9A6';  // ครีมเข้ม
      } else if (DES_T === 'หินดินดาน, หินแกรย์แวก') {
        fillColor = '#8EB0C5';  // ฟ้าอมเทาเข้ม
      } else if (DES_T === 'หินดินดานสีเทาอมเขียว') {
        fillColor = '#5F9EA0';  // ฟ้าอมเขียวเข้มขึ้น
      } else if (DES_T === 'หินปูน') {
        fillColor = '#008080';  // เขียวอมฟ้าเข้ม
      } else if (DES_T === 'หินปูน, หินควอตซ์ไมกาซิสต์') {
        fillColor = '#006666';  // ฟ้าอมเขียวเข้มมาก
      } else {
        fillColor = '#004C4C';  // ฟ้าอมเขียวเข้มสุด (ไม่มีข้อมูล)
      }
      return {
        color: "#000000",  // สีขอบดำ
        fillColor: fillColor,  // สีเติม
        fillOpacity: 0.8  // ความโปร่งใส
      };

    },
    onEachFeature: function (feature, layer) {
      // กำหนดค่าถ้าไม่มีให้ใช้ "ไม่มีข้อมูล"
      var DESC_T = feature.properties.DESCRIPT_T || "(ไม่มีข้อมูล)";
      var DESC_E = feature.properties.DESCRIPT_E || "(ไม่มีข้อมูล)";
      var type = feature.properties.ROCK_TYPE || "(ไม่มีข้อมูล)";
      var form_t = feature.properties.FORM_T || "(ไม่มีข้อมูล)";
      var form_e = feature.properties.FORM_E || "(ไม่มีข้อมูล)";
      var group_t = feature.properties.GROUP_T || "(ไม่มีข้อมูล)";
      var group_e = feature.properties.GROUP_E || "(ไม่มีข้อมูล)";
      var age_t = feature.properties.AGE_T || "(ไม่มีข้อมูล)";
      var age_e = feature.properties.AGE_E || "(ไม่มีข้อมูล)";

      // สร้าง Popup แสดงข้อมูล
      var popupContent = `
      <div style="font-family: 'Noto Sans Thai'; font-size: 14px; max-width: 250px; line-height: 1.5; text-align: left;">
        <b style="font-size: 16px;">ชื่อ:</b> ${DESC_T} (${DESC_E})<br>
        <span><b>ประเภทหิน:</b> ${type}</span><br>
        <span><b>หมวดหิน:</b> ${form_t} (${form_e})</span><br>
        <span><b>กลุ่มหิน:</b> ${group_t} (${group_e})</span><br>
        <span><b>อายุหิน:</b> ${age_t} (${age_e})</span><br>
      </div>
    `;
      layer.bindPopup(popupContent);
    }
  });

  // ======= เพิ่ม Legend สำหรับประเภทของหิน =======
  var rockLegend = L.control({ position: "bottomright" });

  rockLegend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend");
    // สร้างตัวแปรสำหรับแต่ละประเภทหิน (ปรับสีให้เข้มขึ้น)
    var grades = [
      { color: "#5A3E1B", text: "ตะกอนน้ำพา" },
      { color: "#914E38", text: "หินกรวดมน, หินทรายแป้ง" },
      { color: "#A07658", text: "หินควอตซ์ไมกาซิสต์" },
      { color: "#C4A484", text: "หินดินดาน" },
      { color: "#DAC9A6", text: "หินดินดาน, หินกรวดมน" },
      { color: "#8EB0C5", text: "หินดินดาน, หินแกรย์แวก" },
      { color: "#5F9EA0", text: "หินดินดานสีเทาอมเขียว" },
      { color: "#008080", text: "หินปูน" },
      { color: "#006666", text: "หินปูน, หินควอตซ์ไมกาซิสต์" }
    ];

    // สร้างกล่องสีและข้อความอธิบาย
    for (var i = 0; i < grades.length; i++) {
      var item = document.createElement("div");
      item.classList.add("legend-item"); // ใช้ CSS class ที่กำหนดไว้

      var colorBox = document.createElement("i");
      colorBox.classList.add("color-box");  // ใช้ CSS class ที่กำหนดไว้
      // กำหนดสีแบบไดนามิกตามข้อมูลที่ได้
      colorBox.style.background = grades[i].color;

      var textNode = document.createTextNode(grades[i].text);
      item.appendChild(colorBox);
      item.appendChild(textNode);
      div.appendChild(item);
    }

    return div;
  };


  // ฟังก์ชันเปิด/ปิด Layer เมื่อกด checkbox สำหรับหิน
  function toggleRockLayer() {
    const checkbox = document.getElementById('rock_checkbox');

    if (checkbox.checked) {
      rock.addTo(map);
      rockLegend.addTo(map);  // เพิ่ม Legend
    } else {
      map.removeLayer(rock);
      map.removeControl(rockLegend); // ลบ Legend
    }
  };

  document.getElementById('kkpv_checkbox').addEventListener('change', toggleKKPVLayer);
  document.getElementById('kk_checkbox').addEventListener('change', toggleKKLayer);
  document.getElementById('th_checkbox').addEventListener('change', toggleTHLayer);
  document.getElementById('paanurak_checkbox').addEventListener('change', togglePaANuRakLayer);
  document.getElementById('pasanguan_checkbox').addEventListener('change', togglePaSanGuanLayer);
  document.getElementById('patawon_checkbox').addEventListener('change', togglePaTaWonLayer);
  document.getElementById('suanpha_checkbox').addEventListener('change', toggleSuanPhaLayer);
  document.getElementById('f2566_checkbox').addEventListener('change', toggleFoRest66Layer);
  document.getElementById('f2565_checkbox').addEventListener('change', toggleFoRest65Layer);
  document.getElementById('soil_checkbox').addEventListener('change', toggleSoilLayer);
  document.getElementById('rock_checkbox').addEventListener('change', toggleRockLayer);
});

/* ________________________________________________________________________________________________________________________________ */

let geojsonData = []; // ตัวแปรเก็บข้อมูล GeoJSON (เปลี่ยนเป็น array สำหรับหลายไฟล์)
let marker; // ตัวแปรเก็บมาร์กเกอร์
const files = [
  { name: "ป่าอนุรักษ์", path: "./json/paanurak_kk.geojson" },
  { name: "ป่าสงวน", path: "./json/pasaguan_kk.geojson" },
  /* { name: "สวนป่า", path: "./json/suanpha_kk.geojson" }  */
];

// สร้าง array ของ promises สำหรับแต่ละไฟล์
const promises = files.map(file => fetch(file.path).then(response => response.json()));

// ใช้ Promise.all เพื่อรอให้โหลดทั้งหมดเสร็จ
Promise.all(promises)
  .then(results => {
    // รวมข้อมูลจากทุกไฟล์เข้าด้วยกัน
    geojsonData = results;
    console.log(geojsonData); // ตรวจสอบข้อมูลที่ได้จากทุกไฟล์
  })
  .catch(error => {
    console.error("เกิดข้อผิดพลาดในการโหลดไฟล์ geoJSON:", error);
  });

function showPopup() {

  const lat = parseFloat(document.getElementById("latInput").value);
  const lng = parseFloat(document.getElementById("lngInput").value);

  if (isNaN(lat) || isNaN(lng)) {
    alert("กรุณากรอกพิกัดให้ถูกต้อง!");
    return;
  }

  const isInside = checkPointInGeoJSON(lat, lng);

  let message;

  if (isInside) {
    message = `อยู่ในขอบเขตของ${isInside}`;
  } else {
    message = "อยู่นอกขอบเขตของป่าอนุรักษ์และป่าสงวน ";
  }

  document.getElementById("popup-message").innerText = message;
  document.getElementById("container-noti").style.display = "flex";

  // อัปเดตมาร์กเกอร์
  addMarker(lat, lng);
}

function checkPointInGeoJSON(lat, lng) {
  if (!geojsonData.length) return false; // ตรวจสอบว่า geojsonData มีข้อมูลมั้ย

  const point = turf.point([lng, lat]);

  // ตรวจสอบว่าพิกัดอยู่ใน polygon ของ geoJSON อันไหนวะสัด
  for (const [index, file] of geojsonData.entries()) {
    for (const feature of file.features) {
      if (turf.booleanPointInPolygon(point, feature)) {
        return files[index].name; // ใช้ชื่อจากไฟล์ใน array files
      }
    }
  }

  return false; // ถ้าไม่อยู่ในขอบเขตอะไรเลย
}


function addMarker(lat, lng) {
  if (marker) {
    map.removeLayer(marker); // ลบมาร์กเกอร์เดิมถ้ามี
  }

  marker = L.marker([lat, lng]).addTo(map);
  map.setView([lat, lng], 10); // เลื่อนแผนที่ไปยังตำแหน่งใหม่
}

function confirmLocation() {
  document.getElementById("container-noti").style.display = "none";

  const lat = parseFloat(document.getElementById("latInput").value);
  const lng = parseFloat(document.getElementById("lngInput").value);

  document.getElementById("lat-display").innerText = lat;
  document.getElementById("lng-display").innerText = lng;
  document.getElementById("marker-container").style.display = "block";
}
