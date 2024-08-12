"use strict";

const seconds = document.querySelector("#seconds");
const inputPercentage = document.querySelectorAll(".inputPercentage");
const signals = document.querySelectorAll(".signal");
const timing = document.querySelectorAll("h3");
let hasSignalOpen = false;
let data = [];
let totalPercentage = 0;
let currentSignal = 0;
let noMatchTime = 0;
let redScore = 0;
let timeInterval;
let nextSignal;

fetch("/timeData.json").then(x => x.json()).then(res => data = res.data);

function getSeconds() {
    for (let x of inputPercentage) {
        x.value = 25;
    };
};

for (let x of inputPercentage) {
    x.addEventListener("change", () => {
        x.classList.remove("change");
        totalPercentage += Number(x.value);
        let remainInputs = document.querySelectorAll(".change");
        remainInputs?.forEach(x => x.value = Math.round((100 - totalPercentage) / remainInputs.length));
    });
};

function showTime(currentSignal, expireTime) {
    if (seconds.value === "") {
        seconds.value = 150;
        getSeconds();
    };
    signals.forEach(x => x.querySelector(".circle2").classList.remove("yellow"));
    for (let i = 1; i <= signals.length; i++) {
        redScore += Math.round(inputPercentage[i - 1].value * seconds.value / 100);
        if (i >= signals.length) {
            timing[0].textContent = redScore;
        }
        else {
            timing[i].textContent = redScore;
        };
    };
    startSignal(currentSignal, expireTime);
};

function startSignal(currentSignal, expireTime) {
    timing[currentSignal].textContent = Math.round((inputPercentage[currentSignal].value * seconds.value) / 100) - 3;
    signals[currentSignal].querySelector(".circle3").classList.add("green");
    signals[currentSignal].querySelector(".circle1").classList.remove("red");
    signals.forEach(x => {
        let y = x.querySelector(".circle3");
        if (!y.classList.contains("green")) {
            x.querySelector(".circle1").classList.add("red");
        };
    });
    nextSignal = setInterval(startInterval, 1000, expireTime);
};

function startInterval(expireTime) {
    let hold = Math.floor(new Date().setHours(expireTime.split(":")[0], expireTime.split(":")[1]) / 1000);
    let currentTime = Math.floor(new Date().getTime() / 1000);
    if (currentTime >= hold) {
        document.querySelectorAll(".circle1").forEach(x => x.classList.remove("red"));
        document.querySelectorAll(".circle3").forEach(x => x.classList.remove("green"));
        continueChecking();
    }
    else {
        timing.forEach(x => x.textContent--);
        if (timing[currentSignal].textContent <= 0) {
            if (signals[currentSignal].querySelector(".circle2").classList.contains("yellow")) {
                signals[currentSignal].querySelector(".circle2").classList.remove("yellow");
                signals[currentSignal].querySelector(".circle1").classList.add("red");
                timing[currentSignal].textContent = seconds.value - Math.round((inputPercentage[currentSignal].value * seconds.value) / 100);
                clearInterval(nextSignal);
                currentSignal++;
                if (currentSignal >= 4) {
                    currentSignal = 0;
                }
                startSignal(currentSignal, expireTime);
            }
            else {
                signals[currentSignal].querySelector(".circle3").classList.remove("green");
                signals[currentSignal].querySelector(".circle2").classList.add("yellow");
                timing[currentSignal].textContent = 3;
            };
        };
    };
};

function signalStop() {
    timing.forEach(x => x.textContent = 0);
    signals.forEach(x => x.querySelector(".circle2").classList.add("yellow"));
};

function continueChecking() {
    clearInterval(nextSignal);
    clearInterval(timeInterval);
    hasSignalOpen = false;
    noMatchTime = 0;
    if (!hasSignalOpen) {
        timeInterval = setInterval(checkTimeZone, 5000);
    };
    let yellowCircles = 0;
    document.querySelectorAll(".circle2").forEach(x => {
        if (x.classList.contains("yellow")) {
            yellowCircles++;
        };
    });
    if (yellowCircles < signals.length) {
        signalStop();
    };
};

function checkTimeZone() {
    if (!hasSignalOpen) {
        for (let i = 0; i < data.length; i++) {
            let startTime = Math.floor(new Date().setHours(data[i]["start"].split(":")[0], data[i]["start"].split(":")[1]) / 1000);
            let endTime = Math.floor(new Date().setHours(data[i]["end"].split(":")[0], data[i]["end"].split(":")[1]) / 1000);
            let currentTime = Math.floor(new Date().getTime() / 1000);
            if (currentTime >= startTime && currentTime < endTime) {
                currentSignal = 0;
                redScore = 0;
                hasSignalOpen = true;
                showTime(currentSignal, data[i]["end"]);
                break;
            }
            else {
                noMatchTime++;
            };
        };
        if (noMatchTime === data.length) {
            continueChecking();
        }
        else {
            clearInterval(timeInterval);
        };
    }
    else {
        inputPercentage?.forEach(x => x.setAttribute("readOnly", true))
        hasSignalOpen = false;
        clearInterval(timeInterval);
        clearInterval(nextSignal);
        document.querySelectorAll(".circle3").forEach(x => x.classList.remove("green"));
        checkTimeZone();
    };
};


setTimeout(() => {
    checkTimeZone();
}, 1000);













