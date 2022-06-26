var scalingFactor = function (value) {
  return (
    value * 0.9 +
    (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 10)
  );
};
var randomColor = function (opacity) {
  return (
    "rgba(" +
    Math.round(Math.random() * 255) +
    "," +
    Math.round(Math.random() * 255) +
    "," +
    Math.round(Math.random() * 255) +
    "," +
    (opacity || ".3") +
    ")"
  );
};

var generateData = function (count, range) {
  var data = [];

  var y = 0;
  for (var i = 0; i < count; i++) {
    y = scalingFactor(y);
    data.push({
      x: i,
      y: y + range,
    });
  }

  return data;
};

var generateDataset = function (name, dataCount, range) {
  return {
    label: name,
    data: generateData(dataCount, range),
    borderColor: randomColor(1),
    borderWidth: 2,
    fill: false,
  };
};

var intervalGraph;
function startSendData() {
  intervalGraph = setInterval(() => {
    let item = {
      randomNumber: (Math.random() < 0.5 ? -1 : 1) * Math.random() * 30,
      scoreValue: Math.floor(Math.random() * 3),
    };
    addItemSocket(item.randomNumber);
    checkAttention(item.scoreValue);
  }, 10);
}
function stopSendData() {
  clearInterval(intervalGraph);
}

// Websocket
// var socket = io.connect("http://localhost:3000", {
//   transports: ["websocket"],
// });
// socket.on("chartData", (value) => {
//   //console.log("value", value);
//   addItemSocket(value.randomNumber);
//   checkAttention(value.scoreValue);
// });

// socket.on("connect", () => {
//   console.log("client connected");
// });

// Cbuffer mock data
const lengthBuffer = 1000;
const mockLabels = Array.from({ length: lengthBuffer }, (_, index) => {
  return "x" + index;
});
const mockRandomNumbers = Array.from({ length: lengthBuffer }, (_, index) => {
  return Math.floor(Math.random() * 100) + 1;
});
const mockNull = Array.from({ length: lengthBuffer }, (_, index) => {
  return null;
});

// Cbuffer
let totalItem1Array = [];
let totalItem2Array = [];
let totalItem3Array = [];
let totalItem4Array = [];
let myBuff1 = CBuffer(lengthBuffer);
let myBuff2 = CBuffer(lengthBuffer);
let myBuff3 = CBuffer(lengthBuffer);
let myBuff4 = CBuffer(lengthBuffer);
myBuff1.push(...generateData(lengthBuffer, 0));
myBuff2.push(...generateData(lengthBuffer, 100));
myBuff3.push(...generateData(lengthBuffer, 200));
myBuff4.push(...generateData(lengthBuffer, 300));

//console.log("myBuff1", myBuff1);

var config = {
  type: "line",
  data: {
    datasets: [
      {
        label: "CH1",
        data: myBuff1.data,
        borderColor: randomColor(1),
        borderWidth: 2,
        fill: false,
      },
      {
        label: "CH2",
        data: myBuff2.data,
        borderColor: randomColor(1),
        borderWidth: 2,
        fill: false,
      },
      {
        label: "CH3",
        data: myBuff3.data,
        borderColor: randomColor(1),
        borderWidth: 2,
        fill: false,
      },
      {
        label: "CH4",
        data: myBuff4.data,
        borderColor: randomColor(1),
        borderWidth: 2,
        fill: false,
      },
    ],
  },
  options: {
    // responsive: true,
    // title: {
    //   display: true,
    //   text: "Chart.js Downsample Plugin",
    // },
    // legend: {
    //   display: false,
    // },
    scales: {
      xAxes: [
        {
          type: "linear",
          position: "bottom",
        },
      ],
    },
    downsample: {
      enabled: true,
      threshold: 800,

      auto: true,
      onInit: true,

      preferOriginalData: true,
      restoreOriginalData: true,
    },
    animation: {
      duration: 0,
    },
    elements: {
      point: {
        radius: 0, // disable points
      },
    },
  },
};

//   ChartJS
var ctx = document.getElementById("canvas").getContext("2d");
var mockChart = new Chart(ctx, config);

// DownSampling Function
var slider = document.getElementById("threshold");
var thresholdCurrent = document.getElementById("thresholdCurrent");

slider.max = config.data.datasets[0].data.length;
slider.value = thresholdCurrent.innerHTML = config.options.downsample.threshold;

slider.oninput = function () {
  mockChart.options.downsample.threshold = thresholdCurrent.innerHTML =
    slider.value;
  mockChart.update();
};

function addItem() {
  var y = (Math.random() < 0.5 ? -1 : 1) * Math.round(Math.random() * 40);

  let dataLength = config.data.datasets[0].data.length;
  let lastItem = config.data.datasets[0].data[dataLength - 1];
  let item = {
    x: lastItem.x + 1,
    y: y,
  };

  myBuff1.push(item);

  mockChart.update();
  console.log("item", item);
  console.log("myBuff1", myBuff1);
}

function addItemSocket(value) {
  let item = {
    x: myBuff1.start,
    y: value,
  };
  let item2 = {
    x: myBuff2.start,
    y: value + 100,
  };
  let item3 = {
    x: myBuff3.start,
    y: value + 200,
  };
  let item4 = {
    x: myBuff4.start,
    y: value + 300,
  };

  myBuff1.push(item);
  myBuff2.push(item2);
  myBuff3.push(item3);
  myBuff4.push(item4);

  if (myBuff1.start === 0) {
    let myBuff1Refacter = myBuff1.data.map((x) => x);
    totalItem1Array.push(myBuff1Refacter);
  }
  if (myBuff2.start === 0) {
    let myBuff2Refacter = myBuff2.data.map((x) => x);
    totalItem2Array.push(myBuff2Refacter);
  }
  if (myBuff3.start === 0) {
    let myBuff3Refacter = myBuff3.data.map((x) => x);
    totalItem3Array.push(myBuff3Refacter);
  }
  if (myBuff4.start === 0) {
    let myBuff4Refacter = myBuff4.data.map((x) => x);
    totalItem4Array.push(myBuff4Refacter);
  }
  mockChart.update();

  // console.log("config", config.data.datasets[0].data);
  // console.log("myBuff1", myBuff1);
  // console.log("myBuff2", myBuff2);
  // console.log("myBuff3", myBuff3);
  // console.log("myBuff4", myBuff4);
}

function addItemSocket2(value) {
  let item = {
    x: myBuff1.start,
    y: value,
  };
  myBuff1.push(item);
  let myBuff1Refacter = myBuff1.data.map((x) => x);
  config.data.datasets[0].data = myBuff1Refacter;

  if (myBuff1.start === 0) {
    totalItemArray1.push(myBuff1Refacter);
  }

  mockChart.update();

  // console.log("config", config.data.datasets[0].data);
  // console.log("myBuff1", myBuff1);
}

// console.log("config", config);
// console.log("mockChart", mockChart);
// console.log("myBuff1", myBuff1);
// console.log("myBuff2", myBuff2);
// console.log("myBuff3", myBuff3);
// console.log("myBuff4", myBuff4);

function showTotalItem() {
  console.log("totalItem1Array", totalItem1Array);
  console.log("totalItem2Array", totalItem2Array);
  console.log("totalItem3Array", totalItem3Array);
  console.log("totalItem4Array", totalItem4Array);
}

function addColor(circleNumber) {
  const circles = document.querySelectorAll(".circle");
  circles.forEach((item) => item.classList.remove("active"));
  const circle = document.querySelector(`.circle${circleNumber}`);
  circle.classList.add("active");
  console.log(circle);
}

function checkAttention(scoreValue) {
  const scoreValueElem = document.querySelector(`.score-value`);
  const circle1 = document.querySelector(`.circle1`);
  const circle2 = document.querySelector(`.circle2`);
  const circle3 = document.querySelector(`.circle3`);

  if (scoreValue === 2) {
    circle1.classList.add("active");
    circle2.classList.add("active");
    circle3.classList.add("active");
  }
  if (scoreValue === 1) {
    circle1.classList.remove("active");
    circle2.classList.add("active");
    circle3.classList.add("active");
  }
  if (scoreValue === 0) {
    circle1.classList.remove("active");
    circle2.classList.remove("active");
    circle3.classList.add("active");
  }

  scoreValueElem.innerHTML = scoreValue;
}
